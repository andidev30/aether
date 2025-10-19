import { Body, Controller, Post } from '@nestjs/common';
import { AuditService, AuditResponse } from '@/services/audit.service';
import { AuditRequestDto } from '@/controllers/dto/audit-request.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  runAudit(@Body() payload: AuditRequestDto): Promise<AuditResponse> {
    return this.auditService.runAudit(payload);
  }
}
