import { AiDocument } from '@/ai/domain/entities/AiDocument.entity';
import { AiDocumentChunk } from '@/ai/domain/entities/AiDocumentChunk.entity';
import { IDocumentRepository } from '@/ai/domain/interface/documentRepository.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveDocumentWithChunks(
    document: AiDocument,
    chunks: AiDocumentChunk[],
  ): Promise<AiDocument> {
    const created = await (this.prisma as any).aiDocument.create({
      data: {
        id: document.id,
        title: document.title,
        source: document.source,
        content: document.content,
        userId: document.userId,
        createdAt: document.createdAt || new Date(),
        chunks: {
          create: chunks.map((chunk) => ({
            id: chunk.id,
            chunkIndex: chunk.chunkIndex,
            title: chunk.title,
            source: chunk.source,
            content: chunk.content,
            searchText: chunk.searchText,
            embedding: chunk.embedding,
            userId: chunk.userId,
            createdAt: chunk.createdAt || new Date(),
          })),
        },
      },
    });

    return new AiDocument({
      id: created.id,
      title: created.title,
      source: created.source,
      content: created.content,
      userId: created.userId,
      createdAt: created.createdAt,
    });
  }
}
