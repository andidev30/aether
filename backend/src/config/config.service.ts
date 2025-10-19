import { Injectable, Logger } from '@nestjs/common';

const DEFAULT_ELASTIC_INDEX = 'aether';
const DEFAULT_ELASTIC_RESULT_SIZE = 5;
const DEFAULT_SOURCE_CONFIDENCE_THRESHOLD = 0.75;
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  get elasticUrl(): string | undefined {
    return process.env.ELASTIC_URL;
  }

  get elasticApiKey(): string | undefined {
    return process.env.ELASTIC_API_KEY;
  }

  get elasticIndex(): string {
    return (
      process.env.AETHER_ELASTIC_INDEX ??
      process.env.ELASTIC_INDEX ??
      DEFAULT_ELASTIC_INDEX
    );
  }

  get elasticResultSize(): number {
    const raw = process.env.ELASTIC_RESULT_SIZE ?? '';
    const parsed = Number(raw);
    if (!raw) {
      return DEFAULT_ELASTIC_RESULT_SIZE;
    }
    if (Number.isNaN(parsed) || parsed <= 0) {
      this.logger.warn(`Invalid ELASTIC_RESULT_SIZE "${raw}", falling back to ${DEFAULT_ELASTIC_RESULT_SIZE}`);
      return DEFAULT_ELASTIC_RESULT_SIZE;
    }
    return parsed;
  }

  get sourceConfidenceThreshold(): number {
    const raw =
      process.env.AUDIT_SOURCE_CONFIDENCE_THRESHOLD ??
      process.env.SOURCE_CONFIDENCE_THRESHOLD ??
      '';
    const parsed = Number(raw);
    if (!raw) {
      return DEFAULT_SOURCE_CONFIDENCE_THRESHOLD;
    }
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
      this.logger.warn(
        `Invalid source confidence threshold "${raw}", falling back to ${DEFAULT_SOURCE_CONFIDENCE_THRESHOLD}`
      );
      return DEFAULT_SOURCE_CONFIDENCE_THRESHOLD;
    }
    return parsed;
  }

  get elasticCaCertificatePath(): string | undefined {
    return process.env.ELASTIC_CA_CERT_PATH;
  }

  get vertexProjectId(): string | undefined {
    return process.env.VERTEX_PROJECT_ID;
  }

  get vertexLocation(): string | undefined {
    return process.env.VERTEX_LOCATION;
  }

  get vertexEmbeddingModel(): string | undefined {
    return process.env.VERTEX_EMBEDDING_MODEL;
  }

  get vertexModerationModel(): string | undefined {
    return process.env.VERTEX_MODERATION_MODEL;
  }

  get geminiModel(): string {
    return process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  }

  get httpTimeoutMs(): number {
    const raw = process.env.HTTP_TIMEOUT_MS;
    if (!raw) {
      return 10000;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed) || parsed <= 0) {
      this.logger.warn(`Invalid HTTP_TIMEOUT_MS "${raw}", defaulting to 10000`);
      return 10000;
    }
    return parsed;
  }

  get isElasticEnabled(): boolean {
    return Boolean(this.elasticUrl && this.elasticApiKey);
  }

  get isVertexEnabled(): boolean {
    return Boolean(
      this.vertexProjectId &&
      this.vertexLocation &&
      this.vertexEmbeddingModel &&
      this.vertexModerationModel
    );
  }
}
