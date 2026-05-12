import { PromptSection } from './PromptSections.entity';

export class PromptAssemblyResult {
  constructor(
    public readonly prompt: string,
    public readonly sections: PromptSection[],
    public readonly estimatedTokens: number,
  ) {}
}
