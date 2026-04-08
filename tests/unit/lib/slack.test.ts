import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';

// Save/restore only the env vars this test file touches
const TESTED_KEYS = ['SLACK_BOT_TOKEN', 'SLACK_LOG_CHANNEL_ID'] as const;
const savedEnv: Record<string, string | undefined> = {};

function saveEnv() {
  for (const key of TESTED_KEYS) {
    savedEnv[key] = process.env[key];
  }
}
function restoreEnv() {
  for (const key of TESTED_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
}

beforeEach(() => {
  saveEnv();
});

afterEach(() => {
  restoreEnv();
});

import { isSlackConfigured, buildSlackMessage, logInterpreterUsage } from '../../../src/lib/slack';

describe('slack logging', () => {
  describe('isSlackConfigured', () => {
    it('should return true when both token and channel are set', () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';
      expect(isSlackConfigured()).toBe(true);
    });

    it('should return false when token is missing', () => {
      delete process.env.SLACK_BOT_TOKEN;
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';
      expect(isSlackConfigured()).toBe(false);
    });

    it('should return false when channel is missing', () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      delete process.env.SLACK_LOG_CHANNEL_ID;
      expect(isSlackConfigured()).toBe(false);
    });

    it('should return false when both are missing', () => {
      delete process.env.SLACK_BOT_TOKEN;
      delete process.env.SLACK_LOG_CHANNEL_ID;
      expect(isSlackConfigured()).toBe(false);
    });
  });

  describe('buildSlackMessage', () => {
    it('should include all fields in the message', () => {
      const result = buildSlackMessage({
        message: 'Hello 😀 friend',
        platform: 'IMESSAGE',
        context: 'FRIEND',
        output: 'This emoji means happiness',
      });

      expect(result).toContain('Interpreter Usage');
      expect(result).toContain('IMESSAGE');
      expect(result).toContain('FRIEND');
      expect(result).toContain('Hello 😀 friend');
      expect(result).toContain('This emoji means happiness');
    });

    it('should include timestamp in ISO format', () => {
      const result = buildSlackMessage({
        message: 'Test message 😀',
        platform: 'SLACK',
        context: 'COWORKER',
        output: 'Test output',
      });

      // ISO timestamp pattern: YYYY-MM-DDTHH:mm:ss
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle multiline input messages', () => {
      const result = buildSlackMessage({
        message: 'Line 1\nLine 2\nLine 3 😀',
        platform: 'IMESSAGE',
        context: 'FRIEND',
        output: 'Output text',
      });

      expect(result).toContain('>Line 1');
      expect(result).toContain('>Line 2');
      expect(result).toContain('>Line 3 😀');
    });

    it('should handle multiline output', () => {
      const result = buildSlackMessage({
        message: 'Input 😀 message',
        platform: 'IMESSAGE',
        context: 'FRIEND',
        output: 'Output line 1\nOutput line 2',
      });

      expect(result).toContain('>Output line 1');
      expect(result).toContain('>Output line 2');
    });
  });

  describe('logInterpreterUsage', () => {
    const validParams = {
      message: 'Hello 😀 friend how are you?',
      platform: 'IMESSAGE',
      context: 'FRIEND',
      output: 'The grinning face emoji indicates happiness',
    };

    it('should not call fetch when Slack is not configured', async () => {
      delete process.env.SLACK_BOT_TOKEN;
      delete process.env.SLACK_LOG_CHANNEL_ID;

      const fetchSpy = spyOn(globalThis, 'fetch');
      await logInterpreterUsage(validParams);
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('should not call fetch when only token is set', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      delete process.env.SLACK_LOG_CHANNEL_ID;

      const fetchSpy = spyOn(globalThis, 'fetch');
      await logInterpreterUsage(validParams);
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('should not call fetch when only channel is set', async () => {
      delete process.env.SLACK_BOT_TOKEN;
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const fetchSpy = spyOn(globalThis, 'fetch');
      await logInterpreterUsage(validParams);
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('should call fetch with correct Slack API URL when configured', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      await logInterpreterUsage(validParams);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://slack.com/api/chat.postMessage');
      fetchSpy.mockRestore();
    });

    it('should send correct authorization header', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      await logInterpreterUsage(validParams);

      const [, options] = fetchSpy.mock.calls[0];
      const headers = options?.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer xoxb-test-token');
      expect(headers['Content-Type']).toBe('application/json');
      fetchSpy.mockRestore();
    });

    it('should send correct channel and message body', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      await logInterpreterUsage(validParams);

      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options?.body as string);
      expect(body.channel).toBe('C12345');
      expect(body.text).toContain('Hello 😀 friend how are you?');
      expect(body.text).toContain('The grinning face emoji indicates happiness');
      fetchSpy.mockRestore();
    });

    it('should not throw on HTTP error', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Server Error', { status: 500 })
      );

      // Should not throw
      await logInterpreterUsage(validParams);
      expect(consoleSpy).toHaveBeenCalledWith('Slack API HTTP error: 500');

      fetchSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should not throw on Slack API error response', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ ok: false, error: 'channel_not_found' }), { status: 200 })
      );

      await logInterpreterUsage(validParams);
      expect(consoleSpy).toHaveBeenCalledWith('Slack API error: channel_not_found');

      fetchSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should not throw on network error', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      const fetchSpy = spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      await logInterpreterUsage(validParams);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to log to Slack:', expect.any(Error));

      fetchSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should use POST method', async () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345';

      const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      await logInterpreterUsage(validParams);

      const [, options] = fetchSpy.mock.calls[0];
      expect(options?.method).toBe('POST');
      fetchSpy.mockRestore();
    });
  });
});
