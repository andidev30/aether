import { Module } from '@nestjs/common';
import { AuditController } from '@/controllers/audit.controller';
import { HealthController } from '@/controllers/health.controller';
import { AuditService } from '@/services/audit.service';
import { VertexService } from '@/services/vertex.service';
import { ElasticService } from '@/services/elastic.service';
import { ConfigService } from '@/config/config.service';

@Module({
  controllers: [AuditController, HealthController],
  providers: [ConfigService, AuditService, VertexService, ElasticService],
  exports: [AuditService]
})
export class AuditModule {}
