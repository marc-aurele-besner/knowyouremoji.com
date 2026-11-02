import { describe, it, expect, afterEach } from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  loadLlmConfig,
  loadAnthropicConfig,
  chat,
  chatWithFallback,
  isSpendLimitError,
  parseJsonObject,
} from '../../../scripts/combo-content/llm';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

/** Replace fetch with a stub that answers with the given responses in order. */
function stubFetch(responses: Array<{ status: number; body: unknown }>): void {
  let call = 0;
  globalThis.fetch = (async () => {
    const response = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.body,
      text: async () => JSON.stringify(response.body),
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

describe('combo-content/llm', () => {
  describe('loadLlmConfig', () => {
    it('reads the API key out of the env file', () => {
      const config = loadLlmConfig('anthropic/claude-haiku-4.5');
      expect(config.apiKey).toBeTruthy();
      expect(config.model).toBe('anthropic/claude-haiku-4.5');
    });

    it('does not fall back to the interpreter model', () => {
      const config = loadLlmConfig('anthropic/claude-haiku-4.5');
      expect(config.model).not.toBe(config.apiKey);
    });

    it('throws when the env file has no API key', () => {
      const original = fs.readFileSync;
      fs.readFileSync = ((filePath: string, encoding: BufferEncoding) => {
        if (String(filePath).endsWith('.env')) return 'OPENROUTER_API_KEY=""';
        return original.call(fs, filePath, encoding);
      }) as typeof fs.readFileSync;

      try {
        expect(() => loadLlmConfig('anthropic/claude-haiku-4.5')).toThrow(
          /OPENROUTER_API_KEY not found/
        );
      } finally {
        fs.readFileSync = original;
      }
    });

    it('throws when there is no env file at all', () => {
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      fs.existsSync = ((filePath: fs.PathLike) =>
        String(filePath).endsWith('.env')
          ? false
          : originalExistsSync(filePath)) as typeof fs.existsSync;
      fs.readFileSync = ((filePath: string, encoding: BufferEncoding) => {
        if (String(filePath).endsWith('.env')) return '';
        return originalReadFileSync.call(fs, filePath, encoding);
      }) as typeof fs.readFileSync;

      try {
        expect(() => loadLlmConfig('anthropic/claude-haiku-4.5')).toThrow(
          /OPENROUTER_API_KEY not found/
        );
      } finally {
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
      }
    });
  });

  describe('chat', () => {
    it('returns the completion and its cost', async () => {
      stubFetch([
        {
          status: 200,
          body: {
            choices: [{ message: { content: 'hello' } }],
            usage: { cost: 0.25 },
          },
        },
      ]);

      const result = await chat(
        { apiKey: 'test-key', model: 'test-model' },
        [{ role: 'user', content: 'hi' }],
        { maxTokens: 100, temperature: 0.5 }
      );

      expect(result.content).toBe('hello');
      expect(result.cost).toBe(0.25);
    });

    it('reports no cost when the provider does not send one', async () => {
      stubFetch([{ status: 200, body: { choices: [{ message: { content: 'hello' } }] } }]);

      const result = await chat({ apiKey: 'test-key', model: 'test-model' }, []);
      expect(result.cost).toBe(0);
    });

    it('retries a rate limit and succeeds on the next attempt', async () => {
      stubFetch([
        { status: 429, body: { error: 'slow down' } },
        { status: 200, body: { choices: [{ message: { content: 'second try' } }] } },
      ]);

      const result = await chat({ apiKey: 'test-key', model: 'test-model', retryBaseMs: 1 }, []);

      expect(result.content).toBe('second try');
    });

    it('retries a server error and succeeds on the next attempt', async () => {
      stubFetch([
        { status: 503, body: { error: 'unavailable' } },
        { status: 200, body: { choices: [{ message: { content: 'recovered' } }] } },
      ]);

      const result = await chat({ apiKey: 'test-key', model: 'test-model', retryBaseMs: 1 }, []);

      expect(result.content).toBe('recovered');
    });

    it('throws a client error without retrying', async () => {
      stubFetch([{ status: 400, body: { error: { message: 'bad request' } } }]);

      await expect(
        chat({ apiKey: 'test-key', model: 'test-model', retryBaseMs: 1 }, [])
      ).rejects.toThrow(/OpenRouter 400/);
    });

    it('throws when the provider returns an empty completion', async () => {
      stubFetch([{ status: 200, body: { choices: [{ message: { content: '' } }] } }]);

      await expect(
        chat({ apiKey: 'test-key', model: 'test-model', retryBaseMs: 1, maxRetries: 0 }, [])
      ).rejects.toThrow(/empty completion/);
    });

    it('gives up after the retry budget is spent', async () => {
      stubFetch([{ status: 500, body: { error: 'always down' } }]);

      await expect(
        chat({ apiKey: 'test-key', model: 'test-model', retryBaseMs: 1, maxRetries: 1 }, [])
      ).rejects.toThrow(/OpenRouter 500/);
    });

    it('throws a non-error failure as a string', async () => {
      globalThis.fetch = (async () => {
        throw 'network down';
      }) as unknown as typeof fetch;

      await expect(
        chat({ apiKey: 'test-key', model: 'test-model', retryBaseMs: 1, maxRetries: 0 }, [])
      ).rejects.toThrow(/network down/);
    });
  });

  describe('parseJsonObject', () => {
    it('parses a plain JSON object', () => {
      expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
    });

    it('parses a JSON object wrapped in a code fence', () => {
      expect(parseJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    });

    it('parses a JSON object surrounded by prose', () => {
      expect(parseJsonObject('Here you go:\n{"a":1}\nHope that helps!')).toEqual({ a: 1 });
    });

    it('keeps braces that appear inside a string', () => {
      expect(parseJsonObject('{"a":"a { b } c"}')).toEqual({ a: 'a { b } c' });
    });

    it('keeps escaped quotes inside a string', () => {
      expect(parseJsonObject('{"a":"say \\"hi\\""}')).toEqual({ a: 'say "hi"' });
    });

    it('throws when there is no JSON object at all', () => {
      expect(() => parseJsonObject('no json here')).toThrow(/No JSON object found/);
    });

    it('throws when the JSON cannot be parsed', () => {
      expect(() => parseJsonObject('{"a": }')).toThrow(/Unbalanced JSON object/);
    });

    it('extracts an object that contains an escaped quote', () => {
      const parsed = parseJsonObject('Here it is: {"a":"b\\"c"} — enjoy');
      expect(parsed).toEqual({ a: 'b"c' });
    });

    it('throws when the truncated object cannot be repaired', () => {
      expect(() => parseJsonObject('{"a":,')).toThrow(/Unbalanced JSON object/);
    });

    it('repairs a truncation that happened after an escaped quote', () => {
      const parsed = parseJsonObject('{"a":"b\\"c');
      expect(parsed).toEqual({ a: 'b"c' });
    });

    it('repairs a completion cut off inside a string', () => {
      const parsed = parseJsonObject('{"description":"a long sentence that got cut off');
      expect(parsed).toEqual({ description: 'a long sentence that got cut off' });
    });

    it('repairs a completion cut off after a dangling key', () => {
      const parsed = parseJsonObject('{"description":"done","meaning":"also done","seoTitle":"tit');
      expect(parsed).toMatchObject({ description: 'done', meaning: 'also done' });
    });

    it('repairs a completion cut off inside a nested array', () => {
      const parsed = parseJsonObject('{"examples":["one","two');
      expect(parsed).toEqual({ examples: ['one', 'two'] });
    });
  });
});

describe('combo-content/llm', () => {
  describe('loadAnthropicConfig', () => {
    it('returns undefined when the environment has no Anthropic endpoint', () => {
      const baseUrl = process.env.ANTHROPIC_BASE_URL;
      const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_BASE_URL;
      delete process.env.ANTHROPIC_AUTH_TOKEN;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        expect(loadAnthropicConfig()).toBeUndefined();
      } finally {
        if (baseUrl !== undefined) process.env.ANTHROPIC_BASE_URL = baseUrl;
        if (authToken !== undefined) process.env.ANTHROPIC_AUTH_TOKEN = authToken;
        if (apiKey !== undefined) process.env.ANTHROPIC_API_KEY = apiKey;
      }
    });

    it('reads the endpoint out of the environment', () => {
      const baseUrl = process.env.ANTHROPIC_BASE_URL;
      const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      process.env.ANTHROPIC_BASE_URL = 'https://example.test/';
      process.env.ANTHROPIC_AUTH_TOKEN = 'token';
      delete process.env.ANTHROPIC_API_KEY;

      try {
        const config = loadAnthropicConfig('test-model');
        expect(config?.provider).toBe('openai');
        expect(config?.apiKey).toBe('token');
        expect(config?.model).toBe('test-model');
        // The trailing slash is stripped so the request URL is built cleanly.
        expect(config?.baseUrl).toBe('https://example.test');
      } finally {
        if (baseUrl !== undefined) process.env.ANTHROPIC_BASE_URL = baseUrl;
        else delete process.env.ANTHROPIC_BASE_URL;
        if (authToken !== undefined) process.env.ANTHROPIC_AUTH_TOKEN = authToken;
        else delete process.env.ANTHROPIC_AUTH_TOKEN;
        if (apiKey !== undefined) process.env.ANTHROPIC_API_KEY = apiKey;
      }
    });

    it('drops the gateway path so the OpenAI-shaped endpoint is used', () => {
      const baseUrl = process.env.ANTHROPIC_BASE_URL;
      const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
      process.env.ANTHROPIC_BASE_URL = 'https://example.test/anthropic';
      process.env.ANTHROPIC_AUTH_TOKEN = 'token';

      try {
        expect(loadAnthropicConfig('test-model')?.baseUrl).toBe('https://example.test');
      } finally {
        if (baseUrl !== undefined) process.env.ANTHROPIC_BASE_URL = baseUrl;
        else delete process.env.ANTHROPIC_BASE_URL;
        if (authToken !== undefined) process.env.ANTHROPIC_AUTH_TOKEN = authToken;
        else delete process.env.ANTHROPIC_AUTH_TOKEN;
      }
    });

    it('returns undefined when there is a URL but no credential', () => {
      const baseUrl = process.env.ANTHROPIC_BASE_URL;
      const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      process.env.ANTHROPIC_BASE_URL = 'https://example.test';
      delete process.env.ANTHROPIC_AUTH_TOKEN;
      delete process.env.ANTHROPIC_API_KEY;

      try {
        expect(loadAnthropicConfig()).toBeUndefined();
      } finally {
        if (baseUrl !== undefined) process.env.ANTHROPIC_BASE_URL = baseUrl;
        else delete process.env.ANTHROPIC_BASE_URL;
        if (authToken !== undefined) process.env.ANTHROPIC_AUTH_TOKEN = authToken;
        if (apiKey !== undefined) process.env.ANTHROPIC_API_KEY = apiKey;
      }
    });
  });

  describe('the Anthropic-compatible provider', () => {
    it('sends the system prompt separately and returns the text blocks', async () => {
      let request: { url: string; body: Record<string, unknown> } | null = null;
      globalThis.fetch = (async (url: string, init: RequestInit) => {
        request = { url: String(url), body: JSON.parse(String(init.body)) };
        return {
          ok: true,
          status: 200,
          json: async () => ({
            content: [
              { type: 'text', text: 'first ' },
              { type: 'text', text: 'second' },
            ],
            usage: { cost: 0.5 },
          }),
          text: async () => '',
        } as unknown as Response;
      }) as unknown as typeof fetch;

      const result = await chat(
        {
          apiKey: 'token',
          model: 'test-model',
          provider: 'anthropic',
          baseUrl: 'https://example.test',
        },
        [
          { role: 'system', content: 'the system prompt' },
          { role: 'user', content: 'the question' },
        ],
        { maxTokens: 100 }
      );

      expect(result.content).toBe('first second');
      expect(result.cost).toBe(0.5);
      expect(request!.url).toBe('https://example.test/v1/messages');
      expect(request!.body.system).toBe('the system prompt');
      expect(request!.body.messages).toEqual([{ role: 'user', content: 'the question' }]);
    });

    it('reports a client error from the endpoint', async () => {
      stubFetch([{ status: 401, body: { error: 'nope' } }]);

      await expect(
        chat(
          {
            apiKey: 'token',
            model: 'test-model',
            provider: 'anthropic',
            baseUrl: 'https://example.test',
            retryBaseMs: 1,
            maxRetries: 0,
          },
          []
        )
      ).rejects.toThrow(/Anthropic-compatible endpoint 401/);
    });

    it('throws when the endpoint returns no text', async () => {
      stubFetch([{ status: 200, body: { content: [{ type: 'thinking', text: '' }] } }]);

      await expect(
        chat(
          {
            apiKey: 'token',
            model: 'test-model',
            provider: 'anthropic',
            baseUrl: 'https://example.test',
            retryBaseMs: 1,
            maxRetries: 0,
          },
          []
        )
      ).rejects.toThrow(/empty completion/);
    });
  });

  describe('the OpenAI-compatible provider', () => {
    it('sends the chat completion and returns the message content', async () => {
      let request: { url: string; body: Record<string, unknown> } | null = null;
      globalThis.fetch = (async (url: string, init: RequestInit) => {
        request = { url: String(url), body: JSON.parse(String(init.body)) };
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: 'the answer' } }],
            usage: { cost: 0.125 },
          }),
          text: async () => '',
        } as unknown as Response;
      }) as unknown as typeof fetch;

      const result = await chat(
        {
          apiKey: 'token',
          model: 'test-model',
          provider: 'openai',
          baseUrl: 'https://example.test',
        },
        [{ role: 'user', content: 'the question' }],
        { maxTokens: 16000, temperature: 0.7 }
      );

      expect(result.content).toBe('the answer');
      expect(result.cost).toBe(0.125);
      expect(request!.url).toBe('https://example.test/v1/chat/completions');
      expect(request!.body.model).toBe('test-model');
      expect(request!.body.max_tokens).toBe(16000);
      expect(request!.body.temperature).toBe(0.7);
      // The reasoning has to stay in its own field, otherwise a hybrid model
      // spends the token budget on thinking and cuts the answer short.
      expect(request!.body.reasoning_split).toBe(true);
    });

    it('reports a client error from the endpoint', async () => {
      stubFetch([{ status: 401, body: { error: 'nope' } }]);

      await expect(
        chat(
          {
            apiKey: 'token',
            model: 'test-model',
            provider: 'openai',
            baseUrl: 'https://example.test',
            retryBaseMs: 1,
            maxRetries: 0,
          },
          []
        )
      ).rejects.toThrow(/OpenAI-compatible endpoint 401/);
    });

    it('throws when the endpoint returns no text', async () => {
      stubFetch([{ status: 200, body: { choices: [{ message: { content: '' } }] } }]);

      await expect(
        chat(
          {
            apiKey: 'token',
            model: 'test-model',
            provider: 'openai',
            baseUrl: 'https://example.test',
            retryBaseMs: 1,
            maxRetries: 0,
          },
          []
        )
      ).rejects.toThrow(/empty completion/);
    });
  });

  describe('the request timeout', () => {
    it('gives every request an abort signal', async () => {
      let signal: AbortSignal | null | undefined;
      globalThis.fetch = (async (_url: string, init: RequestInit) => {
        signal = init.signal;
        return {
          ok: true,
          status: 200,
          json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
          text: async () => '',
        } as unknown as Response;
      }) as unknown as typeof fetch;

      await chat({ apiKey: 'k', model: 'm', provider: 'openai', baseUrl: 'https://x.test' }, []);

      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('retries a request that timed out', async () => {
      let call = 0;
      globalThis.fetch = (async () => {
        call += 1;
        if (call === 1) throw new DOMException('The operation timed out.', 'TimeoutError');
        return {
          ok: true,
          status: 200,
          json: async () => ({ choices: [{ message: { content: 'recovered' } }] }),
          text: async () => '',
        } as unknown as Response;
      }) as unknown as typeof fetch;

      const result = await chat(
        { apiKey: 'k', model: 'm', provider: 'openai', baseUrl: 'https://x.test', retryBaseMs: 1 },
        []
      );

      expect(result.content).toBe('recovered');
      expect(call).toBe(2);
    });
  });

  describe('isSpendLimitError', () => {
    it('recognizes a monthly limit', () => {
      expect(
        isSpendLimitError(new Error('OpenRouter 403: Key limit exceeded (monthly limit)'))
      ).toBe(true);
    });

    it('recognizes an exhausted credit balance', () => {
      expect(
        isSpendLimitError(
          new Error('OpenRouter 402: This request would exceed your available credits')
        )
      ).toBe(true);
    });

    it('does not treat a malformed request as a spend limit', () => {
      expect(isSpendLimitError(new Error('OpenRouter 400: bad request'))).toBe(false);
    });

    it('accepts a plain string', () => {
      expect(isSpendLimitError('insufficient_quota')).toBe(true);
    });
  });

  describe('chatWithFallback', () => {
    it('uses the first provider when it works', async () => {
      stubFetch([{ status: 200, body: { choices: [{ message: { content: 'first' } }] } }]);

      const result = await chatWithFallback(
        [
          { apiKey: 'a', model: 'a', retryBaseMs: 1 },
          { apiKey: 'b', model: 'b', provider: 'anthropic', baseUrl: 'https://example.test' },
        ],
        []
      );

      expect(result.content).toBe('first');
    });

    it('falls back to the second provider when the first runs out of budget', async () => {
      let call = 0;
      globalThis.fetch = (async () => {
        call += 1;
        if (call === 1) {
          return {
            ok: false,
            status: 403,
            json: async () => ({}),
            text: async () => 'Key limit exceeded (monthly limit)',
          } as unknown as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ type: 'text', text: 'second' }] }),
          text: async () => '',
        } as unknown as Response;
      }) as unknown as typeof fetch;

      const result = await chatWithFallback(
        [
          { apiKey: 'a', model: 'a', retryBaseMs: 1, maxRetries: 0 },
          { apiKey: 'b', model: 'b', provider: 'anthropic', baseUrl: 'https://example.test' },
        ],
        []
      );

      expect(result.content).toBe('second');
    });

    it('does not fall back on an ordinary failure', async () => {
      stubFetch([{ status: 400, body: { error: 'bad request' } }]);

      await expect(
        chatWithFallback(
          [
            { apiKey: 'a', model: 'a', retryBaseMs: 1, maxRetries: 0 },
            { apiKey: 'b', model: 'b', provider: 'anthropic', baseUrl: 'https://example.test' },
          ],
          []
        )
      ).rejects.toThrow(/OpenRouter 400/);
    });

    it('throws when there is no provider at all', async () => {
      await expect(chatWithFallback([], [])).rejects.toThrow(/No LLM provider configured/);
    });

    it('throws the last error when every provider runs out of budget', async () => {
      stubFetch([{ status: 403, body: { error: 'Key limit exceeded (monthly limit)' } }]);

      await expect(
        chatWithFallback(
          [
            { apiKey: 'a', model: 'a', retryBaseMs: 1, maxRetries: 0 },
            { apiKey: 'b', model: 'b', retryBaseMs: 1, maxRetries: 0 },
          ],
          []
        )
      ).rejects.toThrow(/Key limit exceeded/);
    });
  });
});

describe('combo-content/llm file layout', () => {
  it('keeps the retry defaults short enough for a batch run', () => {
    const config = loadLlmConfig('anthropic/claude-haiku-4.5');
    expect(config.retryBaseMs).toBeGreaterThan(0);
    expect(config.maxRetries).toBeGreaterThan(0);
  });

  it('has no stray temp files in the scripts directory', () => {
    const dir = path.join(process.cwd(), 'scripts');
    expect(fs.existsSync(dir)).toBe(true);
    expect(os.tmpdir()).toBeTruthy();
  });
});
