import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AuditRequestDto {
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  text!: string;

  @IsOptional()
  @IsString()
  model?: string;
}
