import { Injectable, Logger } from '@nestjs/common';
import { calculateScores } from '@/utils/score.utils';
import { VertexService } from '@/services/vertex.service';
import { ElasticService } from '@/services/elastic.service';
import { ConfigService } from '@/config/config.service';

export type AuditRequest = {
  text: string;
  model?: string;
};

export type AuditResponse = {
  bias_score: number;
  hallucination_score: number;
  source_confidence: number;
  evidence: {
    id: string;
    title: string;
    summary?: string;
    source_url?: string;
    published_at?: string;
    similarity: number;
  }[];
  gemini_explanation: string;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly vertexService: VertexService,
    private readonly elasticService: ElasticService,
    private readonly config: ConfigService
  ) {}

  async runAudit({ text, model }: AuditRequest): Promise<AuditResponse> {
    const [embeddingResult, biasResult] = await Promise.all([
      this.vertexService
        .embedText(text)
        .catch((error) => {
          this.logger.warn(`Embedding failed, continuing without vector search: ${(error as Error).message}`);
          return { embeddings: [] };
        }),
      this.vertexService.detectBias(text)
    ]);

    const documents = await this.elasticService
      .searchSimilarDocuments(text, embeddingResult.embeddings)
      .catch((error) => {
        this.logger.error(`Evidence retrieval failed: ${(error as Error).message}`);
        return [];
      });

    const scores = calculateScores({
      biasScore: biasResult.biasScore,
      similarities: this.elasticService.toSimilarityResults(documents)
    }, this.config.sourceConfidenceThreshold);

    const auditExplanation = await this.vertexService.generateAuditExplanation({
      text,
      evidence: documents.map((doc) => ({
        title: doc.title,
        summary: doc.summary,
        sourceUrl: doc.sourceUrl,
        similarity: doc.similarity
      })),
      ...scores
    });

    return {
      bias_score: Number(scores.biasScore.toFixed(2)),
      hallucination_score: Number(scores.hallucinationScore.toFixed(2)),
      source_confidence: Number(scores.sourceConfidence.toFixed(2)),
      evidence: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        summary: doc.summary,
        source_url: doc.sourceUrl,
        published_at: doc.publishedAt,
        similarity: doc.similarity
      })),
      gemini_explanation: model ? `[${model}] ${auditExplanation}` : auditExplanation
    };
  }
}
