import { TokenBudget } from '@/ai/domain/entities/TokenBudget.entity';
import { Injectable } from '@nestjs/common';

export enum ConversationType {
  REGULATION = 'REGULATION',
  GENERAL = 'GENERAL',
  CASUAL = 'CASUAL',
}

export class CreateTokenBudgetInput {
  conversationType?: ConversationType;
}

@Injectable()
export class TokenBudgetStrategyService {
  createBudget(input?: CreateTokenBudgetInput): TokenBudget {
    switch (input?.conversationType) {
      case ConversationType.REGULATION:
        return this.buildRegulationBudget();

      case ConversationType.CASUAL:
        return this.buildCasualBudget();

      default:
        return this.buildGeneralBudget();
    }
  }

  /**
   * =========================================================
   * REGULATION / DOCUMENT-HEAVY CONVERSATIONS
   * =========================================================
   */

  private buildRegulationBudget(): TokenBudget {
    return new TokenBudget({
      maxInputTokens: 8000,
      reservedOutputTokens: 1500,
      maxHistoryTokens: 1800,
      maxMemoryTokens: 1200,
      maxRetrievalTokens: 3500,
    });
  }

  /**
   * =========================================================
   * GENERAL CONVERSATIONS
   * =========================================================
   */

  private buildGeneralBudget(): TokenBudget {
    return new TokenBudget({
      maxInputTokens: 6000,
      reservedOutputTokens: 1200,
      maxHistoryTokens: 2200,
      maxMemoryTokens: 1200,
      maxRetrievalTokens: 1400,
    });
  }

  /**
   * =========================================================
   * LIGHTWEIGHT / CASUAL CONVERSATIONS
   * =========================================================
   */

  private buildCasualBudget(): TokenBudget {
    return new TokenBudget({
      maxInputTokens: 4000,
      reservedOutputTokens: 800,
      maxHistoryTokens: 1200,
      maxMemoryTokens: 600,
      maxRetrievalTokens: 500,
    });
  }
}
