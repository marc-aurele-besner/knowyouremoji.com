/**
 * Minimal chat client used by the combo content writer.
 *
 * The site already talks to OpenRouter for the emoji interpreter, so the
 * content pipeline reuses the same key and endpoint rather than introducing a
 * second provider. Requests are retried with exponential backoff because a
 * batch rewrite runs hundreds of calls and any single 429 would otherwise
 * abort the run.
 *
 * A second provider is supported because the OpenRouter key has a monthly
 * spend limit, and a batch this size can exhaust it partway through. When it
 * does, the writer falls back to whatever Anthropic-compatible endpoint the
 * environment is configured against rather than abandoning the remaining
 * pages.
 */

import fs from 'fs';
import path from 'path';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  content: string;
  cost: number;
}

export interface LlmConfig {
  apiKey: string;
  model: string;
  /** Which API shape to speak. */
  provider?: 'openrouter' | 'anthropic' | 'openai';
  /** Base URL for the compatible endpoint. */
  baseUrl?: string;
  /** Base delay between retries, in milliseconds. */
  retryBaseMs?: number;
  maxRetries?: number;
  /** How long a single request may take before it is aborted. */
  requestTimeoutMs?: number;
}

/**
 * How long a single request may take before it is aborted.
 *
 * A request with no ceiling can hang indefinitely when the name server
 * stalls, and a batch of hundreds of pages would sit there with every worker
 * waiting on a connection that is never going to answer. The abort turns that
 * into an ordinary failure, which the retry loop already knows how to handle.
 */
const DEFAULT_REQUEST_TIMEOUT_MS = 180000;

/**
 * Read the OpenRouter credentials out of the local env file.
 *
 * The model is not taken from `OPENROUTER_MODEL`: that setting points at the
 * small, fast model the interpreter feature uses to answer quickly, and it is
 * not strong enough to write reference prose. Callers pick the model.
 */
export function loadLlmConfig(model: string): LlmConfig {
  const envPath = path.join(process.cwd(), '.env');
  let env = '';
  if (fs.existsSync(envPath)) env = fs.readFileSync(envPath, 'utf-8');

  const apiKey = env.match(/OPENROUTER_API_KEY="?([^"\n]+)"?/)?.[1]?.trim();

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found in .env');
  }

  return {
    apiKey,
    model,
    provider: 'openrouter',
    retryBaseMs: 1500,
    maxRetries: 5,
  };
}

/**
 * Read the credentials for a compatible endpoint from the environment.
 *
 * The environment points at an Anthropic-shaped gateway, but that shape
 * charges the reasoning tokens of a hybrid model against the same budget as
 * the answer, so a long page comes back with the answer cut off. The
 * OpenAI-shaped endpoint on the same host keeps the reasoning in a separate
 * field and leaves the whole budget for the answer, so that is the one used.
 *
 * Returns undefined when the environment has no such endpoint configured, so
 * the caller can decide whether to fall back.
 */
export function loadAnthropicConfig(model?: string): LlmConfig | undefined {
  const baseUrl = process.env.ANTHROPIC_BASE_URL;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!baseUrl || (!authToken && !apiKey)) return undefined;

  // The Anthropic-shaped gateway lives under /anthropic on the same host.
  const openAiBase = baseUrl.replace(/\/anthropic\/?$/, '').replace(/\/$/, '');

  return {
    apiKey: authToken || apiKey || '',
    model: model || process.env.ANTHROPIC_MODEL || '',
    provider: 'openai',
    baseUrl: openAiBase,
    retryBaseMs: 1500,
    maxRetries: 5,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send a chat completion, retrying on rate limits and transient server
 * errors.
 */
export async function chat(
  config: LlmConfig,
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<ChatResult> {
  const { maxTokens = 3000, temperature = 0.85 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= (config.maxRetries ?? 5); attempt++) {
    try {
      const payload = await callProvider(config, messages, maxTokens, temperature);

      const content = payload.content;
      if (!content) throw new Error(`${providerName(config)} returned an empty completion`);

      return { content, cost: payload.cost };
    } catch (error) {
      lastError = error;
      // An exhausted budget will not refill itself, so there is nothing to
      // wait for: fail straight away so the caller can fall back to another
      // provider instead of sitting through the backoff.
      if (isSpendLimitError(error)) break;
      if (attempt === (config.maxRetries ?? 5)) break;
      const delay = (config.retryBaseMs ?? 1500) * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** The name of the provider, used in error messages. */
function providerName(config: LlmConfig): string {
  if (config.provider === 'openai') return 'OpenAI-compatible endpoint';
  if (config.provider === 'anthropic') return 'Anthropic-compatible endpoint';
  return 'OpenRouter';
}

/**
 * Whether a failure means the provider is out of budget rather than the
 * request being wrong.
 *
 * A batch this size can exhaust a monthly spend limit partway through, and
 * the failure looks like a client error rather than a quota error, so it has
 * to be recognised from the message.
 *
 * The "in-flight requests" wording is excluded: that one is about too many
 * concurrent calls, which settles on its own, so it is worth retrying.
 */
export function isSpendLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (/in-flight requests/i.test(message)) return false;
  return /key limit exceeded|monthly limit|insufficient_quota|exceed your available credits/i.test(
    message
  );
}

/**
 * Send a chat completion, falling back to a second provider when the first
 * one runs out of budget.
 *
 * The fallback is only used for the failures that mean "no more money",
 * because a malformed request or a bad key will fail the same way on the
 * second provider and the fallback would only hide the real problem.
 */
export async function chatWithFallback(
  configs: LlmConfig[],
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<ChatResult> {
  if (configs.length === 0) throw new Error('No LLM provider configured');

  let lastError: unknown;

  for (const config of configs) {
    try {
      return await chat(config, messages, options);
    } catch (error) {
      lastError = error;
      if (!isSpendLimitError(error)) throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

interface ProviderPayload {
  content: string;
  cost: number;
}

/**
 * Send one request to whichever provider the config points at.
 */
async function callProvider(
  config: LlmConfig,
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<ProviderPayload> {
  const signal = AbortSignal.timeout(config.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);

  if (config.provider === 'openai') {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: maxTokens,
        temperature,
        // Keeps the reasoning in its own field so the answer keeps the whole
        // token budget on a hybrid model.
        reasoning_split: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI-compatible endpoint ${response.status}: ${body.slice(0, 500)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { cost?: number };
    };

    return {
      content: payload.choices?.[0]?.message?.content ?? '',
      cost: payload.usage?.cost ?? 0,
    };
  }

  if (config.provider === 'anthropic') {
    const response = await fetch(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal,
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        temperature,
        system: messages.find((m) => m.role === 'system')?.content,
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic-compatible endpoint ${response.status}: ${body.slice(0, 500)}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { cost?: number };
    };

    const content = (payload.content ?? [])
      .filter((block) => block.type === 'text' || block.type === undefined)
      .map((block) => block.text ?? '')
      .join('');

    return { content, cost: payload.usage?.cost ?? 0 };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (response.status === 429 || response.status >= 500) {
    const body = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${body.slice(0, 300)}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${body.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { cost?: number };
  };

  return {
    content: payload.choices?.[0]?.message?.content ?? '',
    cost: payload.usage?.cost ?? 0,
  };
}

/**
 * Pull a JSON object out of a model completion.
 *
 * Models wrap JSON in prose or code fences often enough that a strict parse
 * fails often enough to matter, so the fences are stripped first and the
 * outermost brace pair is located by hand.
 *
 * A completion that hit the token ceiling comes back with its braces
 * unbalanced. Rather than throw the whole response away, the truncated tail
 * is closed off and the parse is retried — the fields written before the
 * cutoff are still usable.
 */
export function parseJsonObject(raw: string): unknown {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall through to brace extraction.
  }

  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in completion');

  const extracted = extractBalanced(cleaned, start);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch {
      // Fall through to repair.
    }
  }

  // `repairTruncatedJson` only returns a candidate it has already parsed, so
  // there is nothing left to guard here.
  const repaired = repairTruncatedJson(cleaned, start);
  if (repaired) return JSON.parse(repaired);

  throw new Error('Unbalanced JSON object in completion');
}

/**
 * Walk the string tracking brace depth, returning the balanced slice.
 */
function extractBalanced(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

/**
 * The shape of a chunk of JSON text.
 */
interface JsonShape {
  /** How many braces and brackets are still open. */
  depth: number;
  /** True when the text ends inside a string literal. */
  inString: boolean;
  /** The closing characters for the structures that are still open. */
  open: string[];
  /** The index of every comma that sits directly inside the outermost object. */
  commas: number[];
}

/**
 * Walk a chunk of JSON text and describe its shape.
 */
function scanJson(text: string): JsonShape {
  let depth = 0;
  let inString = false;
  let escaped = false;
  const open: string[] = [];
  const commas: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{' || char === '[') {
      depth += 1;
      open.push(char === '{' ? '}' : ']');
    } else if (char === '}' || char === ']') {
      depth -= 1;
      open.pop();
    } else if (char === ',' && depth === 1) {
      commas.push(i);
    }
  }

  return { depth, inString, open, commas };
}

/**
 * Close off a chunk of JSON: terminate an open string, drop a dangling
 * comma, and close the structures that are still open.
 */
function closeJson(text: string, shape: JsonShape): string {
  let out = shape.inString ? `${text}"` : text;
  out = out.replace(/[\s,]*$/, '');
  return out + shape.open.slice().reverse().join('');
}

/**
 * Close off a JSON object that was cut short.
 *
 * A completion that hit the token ceiling comes back with its braces
 * unbalanced. The tail is usually either an unterminated string or a key that
 * never received a value. Both are repairable, so rather than throw the whole
 * response away the candidates are tried in order of how much they keep:
 *
 *   1. close the truncated string and the open braces,
 *   2. drop the incomplete member and close.
 *
 * The first candidate that parses wins.
 */
function repairTruncatedJson(text: string, start: number): string | null {
  const tail = text.slice(start);
  const shape = scanJson(tail);

  if (shape.depth <= 0 && !shape.inString) return null;

  const candidates: string[] = [closeJson(tail, shape)];

  for (const comma of shape.commas) {
    const sliced = tail.slice(0, comma);
    candidates.push(closeJson(sliced, scanJson(sliced)));
  }

  for (const candidate of candidates) {
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}
