import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import type { SimilarityResult } from '@/utils/score.utils';
import { ConfigService } from '@/config/config.service';

export type ElasticDocument = {
  id: string;
  title: string;
  summary?: string;
  body?: string;
  sourceUrl?: string;
  publishedAt?: string;
  tags?: string[];
  similarity: number;
};

type EvidenceSource = {
  id?: string;
  title?: string;
  summary?: string;
  body?: string;
  source_url?: string;
  published_at?: string;
  tags?: string[];
};

@Injectable()
export class ElasticService {
  private readonly logger = new Logger(ElasticService.name);
  private readonly client: Client | null;

  constructor(private readonly config: ConfigService) {
    if (!this.config.isElasticEnabled) {
      this.logger.warn('Elastic Cloud configuration missing; evidence retrieval disabled.');
      this.client = null;
      return;
    }

    this.client = new Client({
      node: this.config.elasticUrl!,
      auth: {
        apiKey: this.config.elasticApiKey!
      }
    });
  }

  private getClientOrThrow(): Client {
    if (!this.client) {
      throw new Error('Elastic client is not configured.');
    }
    return this.client;
  }

  async searchSimilarDocuments(text: string, _embeddings?: number[]): Promise<ElasticDocument[]> {
    if (!text.trim()) {
      return [];
    }

    let client: Client;
    try {
      client = this.getClientOrThrow();
    } catch (error) {
      this.logger.warn(`Elastic search disabled; returning empty evidence. Reason: ${(error as Error).message}`);
      return [];
    }

    try {
      const size = this.config.elasticResultSize;
      const response = await client.search<EvidenceSource>({
        index: this.config.elasticIndex,
        size,
        query: {
          multi_match: {
            query: text,
            fields: ['title^3', 'summary^2', 'body']
          }
        }
      });

      const hits = response.hits?.hits ?? [];
      if (!hits.length) {
        return [];
      }

      const maxScore = response.hits.max_score ?? 0;

      return hits.map((hit: typeof hits[number]) => {
        const source = (hit._source as EvidenceSource) ?? {};
        const similarity = maxScore ? ((hit._score ?? 0) / maxScore) : 0;
        return {
          id: source.id ?? hit._id ?? 'unknown',
          title: source.title ?? 'Untitled evidence',
          summary: source.summary,
          body: source.body,
          sourceUrl: source.source_url,
          publishedAt: source.published_at,
          tags: source.tags,
          similarity: Number(similarity.toFixed(2))
        };
      });
    } catch (error) {
      this.logger.error(`Elastic search failed: ${(error as Error).message}`);
      throw error;
    }
  }

  toSimilarityResults(documents: ElasticDocument[]): SimilarityResult[] {
    return documents.map(({ similarity }) => ({ similarity }));
  }
}
