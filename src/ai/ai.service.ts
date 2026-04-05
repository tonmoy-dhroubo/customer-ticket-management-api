import { Injectable } from '@nestjs/common';
import { TicketPriority } from '../database/enums/ticket-priority.enum';

export interface TicketClassificationResult {
  category: string;
  priority: TicketPriority;
  confidence: number;
  source: 'MOCK';
}

@Injectable()
export class AIService {
  private readonly categoryKeywords: Record<string, string[]> = {
    Billing: ['payment', 'charged', 'invoice', 'refund', 'subscription'],
    Bug: ['error', 'bug', 'crash', 'issue', 'broken', 'fail'],
    'Feature Request': ['feature', 'add', 'improve', 'enhance', 'request'],
  };

  classifyTicket(input: string): TicketClassificationResult {
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

  summarizeTicket(text: string): string {
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

  suggestAssignment(category: string): string {
    const mapping: Record<string, string> = {
      Billing: 'Finance Agent',
      Bug: 'Tech Support',
      'Feature Request': 'Product Team',
      Support: 'Support Team',
    };

    return mapping[category] ?? 'Support Team';
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
