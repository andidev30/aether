import { Injectable } from '@nestjs/common';
import type { SimilarityResult } from '@/utils/score.utils';

export type ElasticDocument = {
  id: string;
  title: string;
  similarity: number;
};

@Injectable()
export class ElasticService {
  async searchSimilarDocuments(_embeddings: number[]): Promise<ElasticDocument[]> {
    // TODO: Replace with Elastic Cloud hybrid search
    return [
      { id: 'doc-1', title: 'Synthetic Evidence A', similarity: 0.82 },
      { id: 'doc-2', title: 'Synthetic Evidence B', similarity: 0.71 },
      { id: 'doc-3', title: 'Synthetic Evidence C', similarity: 0.64 }
    ];
  }

  toSimilarityResults(documents: ElasticDocument[]): SimilarityResult[] {
    return documents.map(({ similarity }) => ({ similarity }));
  }
}
