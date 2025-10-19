import { Module } from '@nestjs/common';
import { AuditController } from '@/controllers/audit.controller';
import { HealthController } from '@/controllers/health.controller';
import { AuditService } from '@/services/audit.service';
import { VertexService } from '@/services/vertex.service';
import { ElasticService } from '@/services/elastic.service';
import { GeminiService } from '@/services/gemini.service';

@Module({
  controllers: [AuditController, HealthController],
  providers: [AuditService, VertexService, ElasticService, GeminiService],
  exports: [AuditService]
})
export class AuditModule {}
