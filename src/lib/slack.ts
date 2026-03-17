/**
 * Slack logging for interpreter usage
 *
 * Uses the Slack Web API (chat.postMessage) to log interpreter
 * input/output to a configured Slack channel. Logging is fire-and-forget
 * so it never blocks or breaks the interpreter response.
 */

import { getEnv } from './env';

const SLACK_API_URL = 'https://slack.com/api/chat.postMessage';

export interface SlackLogParams {
  message: string;
  platform: string;
  context: string;
  output: string;
}

/**
 * Check if Slack logging is configured
 */
export function isSlackConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.slackBotToken && env.slackLogChannelId);
}

/**
 * Build Slack message blocks for interpreter usage log
 */
export function buildSlackMessage(params: SlackLogParams): string {
  const { message, platform, context, output } = params;
  const timestamp = new Date().toISOString();

  return [
    `:robot_face: *Interpreter Usage* — ${timestamp}`,
    '',
    `*Platform:* ${platform} | *Context:* ${context}`,
    '',
    `*Input:*`,
    `>${message.split('\n').join('\n>')}`,
    '',
    `*Output:*`,
    `>${output.split('\n').join('\n>')}`,
  ].join('\n');
}

/**
 * Log interpreter usage to Slack (fire-and-forget)
 *
 * Silently fails if Slack is not configured or the request fails.
 * Never throws — errors are logged to console.
 */
export async function logInterpreterUsage(params: SlackLogParams): Promise<void> {
  const env = getEnv();

  if (!env.slackBotToken || !env.slackLogChannelId) {
    return;
  }

  try {
    const text = buildSlackMessage(params);

    const response = await fetch(SLACK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.slackBotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: env.slackLogChannelId,
        text,
      }),
    });

    if (!response.ok) {
      console.error(`Slack API HTTP error: ${response.status}`);
    } else {
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        console.error(`Slack API error: ${data.error}`);
      }
    }
  } catch (error) {
    console.error('Failed to log to Slack:', error);
  }
}
