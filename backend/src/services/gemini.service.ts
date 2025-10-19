import { Injectable } from '@nestjs/common';

export type GeminiPromptInput = {
  text: string;
  biasScore: number;
  hallucinationScore: number;
  sourceConfidence: number;
};

@Injectable()
export class GeminiService {
  async generateExplanation({ text, biasScore, hallucinationScore, sourceConfidence }: GeminiPromptInput) {
    // TODO: Replace with Gemini reasoning API call
    return [
      'Mock explanation:',
      `- Bias score: ${biasScore}`,
      `- Hallucination score: ${hallucinationScore}`,
      `- Source confidence: ${sourceConfidence}`,
      `Original text: "${text.slice(0, 120)}${text.length > 120 ? '…' : ''}"`
    ].join('\n');
  }
}
