import { Injectable } from '@nestjs/common';
import { calculateScores } from '@/utils/score.utils';
import { VertexService } from '@/services/vertex.service';
import { ElasticService } from '@/services/elastic.service';
import { GeminiService } from '@/services/gemini.service';

export type AuditRequest = {
  text: string;
  model?: string;
};

export type AuditResponse = {
  biasScore: number;
  hallucinationScore: number;
  sourceConfidence: number;
  evidence: {
    id: string;
    title: string;
    similarity: number;
  }[];
  geminiExplanation: string;
};

@Injectable()
export class AuditService {
  constructor(
    private readonly vertexService: VertexService,
    private readonly elasticService: ElasticService,
    private readonly geminiService: GeminiService
  ) {}

  async runAudit({ text, model }: AuditRequest): Promise<AuditResponse> {
    const [{ embeddings }, { biasScore }] = await Promise.all([
      this.vertexService.embedText(text),
      this.vertexService.detectBias(text)
    ]);

    const documents = await this.elasticService.searchSimilarDocuments(embeddings);
    const scores = calculateScores({
      biasScore,
      similarities: this.elasticService.toSimilarityResults(documents)
    });

    const geminiExplanation = await this.geminiService.generateExplanation({
      text,
      ...scores
    });

    return {
      ...scores,
      evidence: documents,
      geminiExplanation: model ? `[${model}] ${geminiExplanation}` : geminiExplanation
    };
  }
}
