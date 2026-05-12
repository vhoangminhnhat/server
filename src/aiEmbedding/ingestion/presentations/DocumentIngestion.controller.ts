import { Body, Controller, Post } from '@nestjs/common';
import { ImportDocumentUseCase } from '../applications/ImportDocument.useCase';
import { ImportAiDocumentDto } from './dtos/ImportAiDocument.dto';

@Controller('ai/documents')
export class DocumentIngestionController {
  constructor(private readonly importDocumentUseCase: ImportDocumentUseCase) {}

  @Post('import')
  async importDocument(@Body() dto: ImportAiDocumentDto) {
    return this.importDocumentUseCase.execute(dto);
  }
}
