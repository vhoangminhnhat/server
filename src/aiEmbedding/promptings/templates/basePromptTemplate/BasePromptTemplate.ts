export abstract class BasePromptTemplate<TInput> {
  abstract build(input: TInput): string;

  protected normalize(value?: string): string {
    return value?.trim() || '';
  }

  protected joinSections(sections: string[]): string {
    return sections.filter(Boolean).join('\n\n');
  }
}