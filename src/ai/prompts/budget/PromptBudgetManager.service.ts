import { PromptSection } from '@/ai/domain/entities/PromptSections.entity';
import { TokenBudget } from '@/ai/domain/entities/TokenBudget.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptBudgetManagerService {
  allocate(sections: PromptSection[], budget: TokenBudget): PromptSection[] {
    const maxAllowedTokens =
      (budget.maxInputTokens || 0) - (budget.reservedOutputTokens || 0);

    const sectionsWithEstimates = sections.map((section) => ({
      ...section,
      estimatedTokens:
        section.estimatedTokens ??
        Math.ceil((section.content || '').length / 4),
    }));

    const sortedSections = sectionsWithEstimates.sort((a, b) => {
      if (a.required && !b.required) {
        return -1;
      }

      if (!a.required && b.required) {
        return 1;
      }

      return (b.priority as number) - (a.priority as number);
    });

    const selectedSections: PromptSection[] = [];

    let currentTokenUsage = 0;

    for (const section of sortedSections) {
      const nextUsage = currentTokenUsage + (section.estimatedTokens || 0);

      if (nextUsage > maxAllowedTokens) {
        continue;
      }

      selectedSections.push(section);

      currentTokenUsage = nextUsage;
    }

    return selectedSections;
  }
}
