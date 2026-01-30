import { describe, it, expect } from 'bun:test';
import {
  VALID_INTERPRET_REQUESTS,
  INVALID_INTERPRET_REQUESTS,
  EDGE_CASE_MESSAGES,
  MESSAGES_WITH_MULTIPLE_EMOJIS,
  MESSAGES_BY_PLATFORM,
  MESSAGES_BY_CONTEXT,
  getRandomValidRequest,
  getRandomInvalidRequest,
} from '../../../utils/fixtures/messages.fixtures';
import { isValidInterpretRequest } from '../../../utils/helpers/validation.helpers';

describe('messages.fixtures', () => {
  describe('VALID_INTERPRET_REQUESTS', () => {
    it('should contain multiple valid requests', () => {
      expect(VALID_INTERPRET_REQUESTS.length).toBeGreaterThanOrEqual(3);
    });

    it('should have all valid interpret requests', () => {
      VALID_INTERPRET_REQUESTS.forEach((request) => {
        expect(isValidInterpretRequest(request)).toBe(true);
      });
    });

    it('should have messages containing emojis', () => {
      // Simple emoji check - contains non-ASCII characters in emoji ranges
      const hasEmoji = (str: string) =>
        /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u.test(
          str
        );

      VALID_INTERPRET_REQUESTS.forEach((request) => {
        expect(hasEmoji(request.message)).toBe(true);
      });
    });

    it('should have messages of valid length (10-1000 chars)', () => {
      VALID_INTERPRET_REQUESTS.forEach((request) => {
        expect(request.message.length).toBeGreaterThanOrEqual(10);
        expect(request.message.length).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('INVALID_INTERPRET_REQUESTS', () => {
    it('should contain multiple invalid requests', () => {
      expect(INVALID_INTERPRET_REQUESTS.length).toBeGreaterThanOrEqual(3);
    });

    it('should have invalid interpret requests', () => {
      INVALID_INTERPRET_REQUESTS.forEach((request) => {
        // Each should fail validation for some reason
        expect(isValidInterpretRequest(request)).toBe(false);
      });
    });

    it('should include various failure cases', () => {
      // Check for different types of invalid requests
      const reasons = INVALID_INTERPRET_REQUESTS.map((r) => {
        if (!r.message) return 'missing_message';
        if (r.message.length < 10) return 'too_short';
        if (r.message.length > 1000) return 'too_long';
        if (!r.platform) return 'missing_platform';
        if (!r.context) return 'missing_context';
        return 'other';
      });

      // Should have at least one case of too_short
      expect(reasons.some((r) => r === 'too_short')).toBe(true);
    });
  });

  describe('EDGE_CASE_MESSAGES', () => {
    it('should contain edge case messages', () => {
      expect(EDGE_CASE_MESSAGES.length).toBeGreaterThanOrEqual(3);
    });

    it('should include unicode edge cases', () => {
      // Should have messages with special unicode patterns
      const hasZWJ = EDGE_CASE_MESSAGES.some((msg) => msg.includes('\u200D'));
      const hasVariationSelector = EDGE_CASE_MESSAGES.some((msg) => msg.includes('\uFE0F'));

      // At least one should have ZWJ or variation selector
      expect(hasZWJ || hasVariationSelector).toBe(true);
    });

    it('should include messages with multiple consecutive emojis', () => {
      const hasConsecutiveEmojis = EDGE_CASE_MESSAGES.some((msg) => {
        const emojiPattern = /[\u{1F300}-\u{1F9FF}][\u{1F300}-\u{1F9FF}]/u;
        return emojiPattern.test(msg);
      });

      expect(hasConsecutiveEmojis).toBe(true);
    });
  });

  describe('MESSAGES_WITH_MULTIPLE_EMOJIS', () => {
    it('should contain messages with multiple emojis', () => {
      expect(MESSAGES_WITH_MULTIPLE_EMOJIS.length).toBeGreaterThanOrEqual(2);
    });

    it('should have messages containing at least 2 emojis each', () => {
      const countEmojis = (str: string) => {
        const matches = str.match(
          /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu
        );
        return matches ? matches.length : 0;
      };

      MESSAGES_WITH_MULTIPLE_EMOJIS.forEach((msg) => {
        expect(countEmojis(msg)).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('MESSAGES_BY_PLATFORM', () => {
    it('should have messages for each platform', () => {
      const platforms = [
        'IMESSAGE',
        'INSTAGRAM',
        'TIKTOK',
        'WHATSAPP',
        'SLACK',
        'DISCORD',
        'TWITTER',
        'OTHER',
      ];

      platforms.forEach((platform) => {
        expect(MESSAGES_BY_PLATFORM[platform as keyof typeof MESSAGES_BY_PLATFORM]).toBeDefined();
      });
    });

    it('should have valid requests for each platform', () => {
      Object.values(MESSAGES_BY_PLATFORM).forEach((request) => {
        expect(isValidInterpretRequest(request)).toBe(true);
      });
    });

    it('should have platform-appropriate messages', () => {
      expect(MESSAGES_BY_PLATFORM.SLACK.platform).toBe('SLACK');
      expect(MESSAGES_BY_PLATFORM.DISCORD.platform).toBe('DISCORD');
      expect(MESSAGES_BY_PLATFORM.INSTAGRAM.platform).toBe('INSTAGRAM');
    });
  });

  describe('MESSAGES_BY_CONTEXT', () => {
    it('should have messages for each context', () => {
      const contexts = [
        'ROMANTIC_PARTNER',
        'FRIEND',
        'FAMILY',
        'COWORKER',
        'ACQUAINTANCE',
        'STRANGER',
      ];

      contexts.forEach((context) => {
        expect(MESSAGES_BY_CONTEXT[context as keyof typeof MESSAGES_BY_CONTEXT]).toBeDefined();
      });
    });

    it('should have valid requests for each context', () => {
      Object.values(MESSAGES_BY_CONTEXT).forEach((request) => {
        expect(isValidInterpretRequest(request)).toBe(true);
      });
    });

    it('should have context-appropriate messages', () => {
      expect(MESSAGES_BY_CONTEXT.COWORKER.context).toBe('COWORKER');
      expect(MESSAGES_BY_CONTEXT.ROMANTIC_PARTNER.context).toBe('ROMANTIC_PARTNER');
      expect(MESSAGES_BY_CONTEXT.FAMILY.context).toBe('FAMILY');
    });
  });

  describe('getRandomValidRequest', () => {
    it('should return a valid request', () => {
      const request = getRandomValidRequest();
      expect(isValidInterpretRequest(request)).toBe(true);
    });

    it('should return request from valid fixtures', () => {
      const request = getRandomValidRequest();
      const allMessages = VALID_INTERPRET_REQUESTS.map((r) => r.message);
      expect(allMessages).toContain(request.message);
    });
  });

  describe('getRandomInvalidRequest', () => {
    it('should return an invalid request', () => {
      const request = getRandomInvalidRequest();
      expect(isValidInterpretRequest(request)).toBe(false);
    });

    it('should return request from invalid fixtures', () => {
      const request = getRandomInvalidRequest();
      const allMessages = INVALID_INTERPRET_REQUESTS.map((r) => r.message);
      expect(allMessages).toContain(request.message);
    });
  });
});
