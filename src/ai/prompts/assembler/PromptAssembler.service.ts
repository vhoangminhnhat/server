import { PromptAssemblyResult } from '@/ai/domain/entities/PromptAssemblerResult.entity';
import { PromptSection } from '@/ai/domain/entities/PromptSections.entity';
import { Injectable } from '@nestjs/common';
import { TokenEstimatorService } from '../budget/TokenEstimator.service';

@Injectable()
export class PromptAssemblerService {
  constructor(private readonly tokenEstimator: TokenEstimatorService) {}

  assemble(sections: PromptSection[]): PromptAssemblyResult {
    const orderedSections = [...sections].sort(
      (a, b) => (b.priority as number) - (a.priority as number),
    );

    const renderedSections = orderedSections.map((section) =>
      this.renderSection(section),
    );

    const finalPrompt = renderedSections.filter(Boolean).join('\n\n');

    const estimatedTokens = this.tokenEstimator.estimate(finalPrompt);

    return new PromptAssemblyResult(
      finalPrompt,
      orderedSections,
      estimatedTokens,
    );
  }

  private renderSection(section: PromptSection): string {
    return [`### ${section.type}`, (section.content || '').trim()].join('\n');
  }
}
