import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { AiEmbeddingModule } from './aiEmbedding/aiEmbedding.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { McpModule } from './mcp/mcp.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ChatModule,
    McpModule,
    AiModule,
    AiEmbeddingModule,
  ],
})
export class AppModule {}
