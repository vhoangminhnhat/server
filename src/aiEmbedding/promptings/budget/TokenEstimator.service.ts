import { PromptSection } from '@/aiEmbedding/shared/entities/prompts/PromptSections.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenEstimatorService {
  estimate(content: string): number {
    if (!content?.trim()) {
      return 0;
    }

    return Math.ceil(content.trim().length / 4);
  }

  estimateSection(section: PromptSection): number {
    return this.estimate(section.content || '');
  }

  estimateSections(sections: PromptSection[]): number {
    return sections.reduce(
      (total, section) => total + this.estimateSection(section),
      0,
    );
  }
}
