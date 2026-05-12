import { IsOptional, IsString, MinLength } from 'class-validator';

export class ImportAiDocumentDto {
  @IsString()
  @MinLength(1)
  title?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @MinLength(1)
  content?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
