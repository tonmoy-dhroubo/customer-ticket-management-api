import { Injectable } from '@nestjs/common';
import { TicketPriority } from '../database/enums/ticket-priority.enum';

export interface TicketClassificationResult {
  category: string;
  priority: TicketPriority;
  confidence: number;
  source: 'MOCK' | 'GEMINI';
}

@Injectable()
export class AIService {
  private readonly geminiApiKey = process.env.GEMINI_API_KEY ?? '';
  private readonly geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

  private readonly categoryKeywords: Record<string, string[]> = {
    Billing: ['payment', 'charged', 'invoice', 'refund', 'subscription'],
    Bug: ['error', 'bug', 'crash', 'issue', 'broken', 'fail'],
    'Feature Request': ['feature', 'add', 'improve', 'enhance', 'request'],
  };

  async classifyTicket(input: string): Promise<TicketClassificationResult> {
    if (this.geminiApiKey) {
      try {
        const aiResult = await this.classifyWithGemini(input);
        if (aiResult) {
          return aiResult;
        }
      } catch {
        // Fall back to deterministic mock logic if external AI fails.
      }
    }

    return this.classifyWithMock(input);
  }

  async summarizeTicket(text: string): Promise<string> {
    if (this.geminiApiKey) {
      try {
        const summary = await this.summarizeWithGemini(text);
        if (summary) {
          return summary;
        }
      } catch {
        // Fall back to deterministic mock logic if external AI fails.
      }
    }

    return this.summarizeWithMock(text);
  }

  suggestAssignment(category: string): string {
    const mapping: Record<string, string> = {
      Billing: 'Finance Agent',
      Bug: 'Tech Support',
      'Feature Request': 'Product Team',
      Support: 'Support Team',
    };

    return mapping[category] ?? 'Support Team';
  }

  private classifyWithMock(input: string): TicketClassificationResult {
    const normalized = this.normalize(input);
    const scoreByCategory = new Map<string, number>();

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (normalized.includes(keyword) ? 1 : 0);
      }, 0);
      scoreByCategory.set(category, score);
    }

    let bestCategory = 'Support';
    let bestScore = 0;

    for (const [category, score] of scoreByCategory.entries()) {
      if (score > bestScore) {
        bestCategory = category;
        bestScore = score;
      }
    }

    const maxPossible =
      bestCategory === 'Support'
        ? Math.max(...Object.values(this.categoryKeywords).map((list) => list.length))
        : this.categoryKeywords[bestCategory].length;
    const confidence = bestScore === 0 ? 0.35 : Math.min(0.99, Number((bestScore / maxPossible).toFixed(2)));

    return {
      category: bestCategory,
      priority: this.derivePriority(bestCategory, normalized),
      confidence,
      source: 'MOCK',
    };
  }

  private summarizeWithMock(text: string): string {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      return 'No details provided.';
    }

    const sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(' ');

    return sentences.length > 150 ? `${sentences.slice(0, 147)}...` : sentences;
  }

  private async classifyWithGemini(input: string): Promise<TicketClassificationResult | null> {
    const prompt = [
      'You classify customer support tickets.',
      'Return ONLY JSON with keys: category, priority, confidence.',
      'category must be one of: Billing, Bug, Feature Request, Support.',
      'priority must be one of: LOW, MEDIUM, HIGH, URGENT.',
      'confidence must be a number between 0 and 1.',
      `Ticket text: ${input}`,
    ].join('\n');

    const text = await this.generateText(prompt);
    const parsed = this.extractJson(text) as
      | { category?: string; priority?: string; confidence?: number }
      | null;

    if (!parsed?.category || !parsed?.priority || typeof parsed.confidence !== 'number') {
      return null;
    }

    const allowedCategories = new Set(['Billing', 'Bug', 'Feature Request', 'Support']);
    const normalizedCategory = allowedCategories.has(parsed.category) ? parsed.category : 'Support';
    const normalizedPriority = this.toPriority(parsed.priority);
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence.toFixed(2))));

    return {
      category: normalizedCategory,
      priority: normalizedPriority,
      confidence,
      source: 'GEMINI',
    };
  }

  private async summarizeWithGemini(text: string): Promise<string | null> {
    const prompt = [
      'Summarize the following support ticket description in 1-2 sentences.',
      'Keep it under 150 characters.',
      'Return plain text only.',
      `Description: ${text}`,
    ].join('\n');

    const summary = (await this.generateText(prompt)).replace(/\s+/g, ' ').trim();
    if (!summary) {
      return null;
    }

    return summary.length > 150 ? `${summary.slice(0, 147)}...` : summary;
  }

  private async generateText(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  }

  private extractJson(text: string): Record<string, unknown> | null {
    if (!text) {
      return null;
    }

    const fencedJson = text.match(/```json\s*([\s\S]*?)\s*```/i);
    const raw = fencedJson ? fencedJson[1] : text;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private toPriority(value: string): TicketPriority {
    const normalized = value.toUpperCase();
    if (normalized === TicketPriority.URGENT) return TicketPriority.URGENT;
    if (normalized === TicketPriority.HIGH) return TicketPriority.HIGH;
    if (normalized === TicketPriority.LOW) return TicketPriority.LOW;
    return TicketPriority.MEDIUM;
  }

  private normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  }

  private derivePriority(category: string, normalizedText: string): TicketPriority {
    if (normalizedText.includes('urgent') || normalizedText.includes('immediately') || normalizedText.includes('critical')) {
      return TicketPriority.URGENT;
    }

    if (category === 'Bug') {
      return TicketPriority.HIGH;
    }

    if (category === 'Billing') {
      return TicketPriority.MEDIUM;
    }

    return TicketPriority.LOW;
  }
}
