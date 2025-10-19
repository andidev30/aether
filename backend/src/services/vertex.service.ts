import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenAI,
  HarmProbability,
  SafetyRating
} from '@google/genai';
import { ConfigService } from '@/config/config.service';

export type VertexEmbeddingResult = {
  embeddings: number[];
};

export type VertexBiasResult = {
  biasScore: number;
};

export type AuditEvidence = {
  title: string;
  summary?: string;
  sourceUrl?: string;
  similarity: number;
};

export type AuditExplanationInput = {
  text: string;
  biasScore: number;
  hallucinationScore: number;
  sourceConfidence: number;
  evidence: AuditEvidence[];
};

@Injectable()
export class VertexService {
  private readonly logger = new Logger(VertexService.name);
  private client: GoogleGenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  private ensureEnabled(): void {
    if (!this.config.isVertexEnabled) {
      throw new Error('Vertex AI configuration is missing. Please set VERTEX_* environment variables.');
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      this.client = new GoogleGenAI({
        vertexai: true,
        project: this.config.vertexProjectId!,
        location: this.config.vertexLocation!
      });
    }
    return this.client;
  }

  async embedText(text: string): Promise<VertexEmbeddingResult> {
    if (!text.trim()) {
      throw new Error('Cannot embed empty text.');
    }

    try {
      this.ensureEnabled();
    } catch (error) {
      this.logger.warn(
        `Vertex embeddings disabled; falling back to heuristic embeddings. Reason: ${(error as Error).message}`
      );
      return {
        embeddings: text.split('').map((char) => char.charCodeAt(0) / 255)
      };
    }

    try {
      const response = await this.getClient().models.embedContent({
        model: this.config.vertexEmbeddingModel!,
        contents: [{ role: 'user', parts: [{ text }] }]
      });

      const values = response.embeddings?.[0]?.values;
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Vertex embedding response missing embedding values.');
      }

      return { embeddings: values };
    } catch (error) {
      this.logger.error(`Vertex embedding request failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async detectBias(text: string): Promise<VertexBiasResult> {
    if (!text.trim()) {
      return { biasScore: 0 };
    }

    try {
      this.ensureEnabled();
    } catch (error) {
      this.logger.warn(
        `Vertex moderation disabled; falling back to heuristic bias scoring. Reason: ${(error as Error).message}`
      );
      const heuristic = Math.min(text.length / 1000, 1);
      return { biasScore: Number(heuristic.toFixed(2)) };
    }

    try {
      const response = await this.getClient().models.generateContent({
        model: this.config.vertexModerationModel!,
        contents: [{ role: 'user', parts: [{ text }] }]
      });

      const safetyRatings: SafetyRating[] =
        response.candidates?.[0]?.safetyRatings ?? [];

      if (safetyRatings.length === 0) {
        return { biasScore: 0 };
      }

      const probabilityScale: Record<HarmProbability, number> = {
        [HarmProbability.HARM_PROBABILITY_UNSPECIFIED]: 0,
        [HarmProbability.NEGLIGIBLE]: 0,
        [HarmProbability.LOW]: 0.25,
        [HarmProbability.MEDIUM]: 0.5,
        [HarmProbability.HIGH]: 0.75
      };

      const highestProbability = Math.max(
        ...safetyRatings.map((rating) => {
          const probability = rating.probability ?? HarmProbability.HARM_PROBABILITY_UNSPECIFIED;
          return probabilityScale[probability];
        })
      );

      return { biasScore: Number(highestProbability.toFixed(2)) };
    } catch (error) {
      this.logger.error(`Vertex moderation request failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async generateAuditExplanation(input: AuditExplanationInput): Promise<string> {
    try {
      this.ensureEnabled();
    } catch (error) {
      this.logger.warn(
        `Vertex generative capabilities disabled; returning fallback explanation. Reason: ${(error as Error).message}`
      );
      return this.buildFallbackExplanation(input);
    }

    try {
      const response = await this.getClient().models.generateContent({
        model: this.config.geminiModel,
        contents: [{ role: 'user', parts: [{ text: this.buildAuditExplanationPrompt(input) }] }]
      });

      const explanation = response.text?.trim();

      if (!explanation) {
        throw new Error('Vertex generative response did not include text.');
      }

      return explanation;
    } catch (error) {
      this.logger.error(`Vertex generative request failed: ${(error as Error).message}`);
      return this.buildFallbackExplanation(input);
    }
  }

  private buildAuditExplanationPrompt(input: AuditExplanationInput): string {
    const evidenceLines = input.evidence.length
      ? input.evidence
          .map((item, index) => {
            const summaryLine = item.summary ? `\n   Summary: ${item.summary}` : '';
            const sourceLine = item.sourceUrl ? `\n   Source: ${item.sourceUrl}` : '';
            return `${index + 1}. ${item.title} (similarity ${item.similarity})${summaryLine}${sourceLine}`;
          })
          .join('\n')
      : 'No supporting evidence retrieved.';

    return [
      'You are an audit assistant that scores Large Language Model outputs for bias, hallucination risk, and evidence confidence.',
      'Use the provided metrics to craft a concise explanation (4-6 sentences).',
      'Highlight why each metric is high or low and advise on next steps if issues exist.',
      '',
      `Bias score: ${input.biasScore}`,
      `Hallucination score: ${input.hallucinationScore}`,
      `Source confidence: ${input.sourceConfidence}`,
      '',
      'Evidence:',
      evidenceLines,
      '',
      'LLM Output Under Review:',
      input.text
    ].join('\n');
  }

  private buildFallbackExplanation({
    text,
    biasScore,
    hallucinationScore,
    sourceConfidence
  }: AuditExplanationInput): string {
    return [
      'Automated audit summary (fallback logic):',
      `- Bias score of ${biasScore} suggests ${
        biasScore > 0.6 ? 'potential stylistic or toxic content issues' : 'no significant bias detected'
      }.`,
      `- Hallucination score of ${hallucinationScore} indicates ${
        hallucinationScore > 0.5 ? 'a meaningful risk of unguided claims' : 'content is likely grounded in evidence'
      }.`,
      `- Source confidence is ${sourceConfidence}, which means ${
        sourceConfidence > 0.6
          ? 'several supporting documents aligned with the text.'
          : 'insufficient corroborating evidence was found.'
      }`,
      `Excerpt: "${text.slice(0, 160)}${text.length > 160 ? '…' : ''}"`
    ].join('\n');
  }
}
