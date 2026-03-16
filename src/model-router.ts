/**
 * Intelligent model routing.
 * Uses a fast Haiku call to classify message complexity,
 * then selects the appropriate model for the actual response.
 */
import { request as httpsRequest } from 'https';

import { PRIMARY_MODEL, SECONDARY_MODEL } from './config.js';
import { readEnvFile } from './env.js';
import { logger } from './logger.js';

const ROUTER_MODEL = 'claude-haiku-4-5-20251001';

const CLASSIFICATION_PROMPT = `You are a model router. Based on the user's message, classify the complexity to determine which AI model should handle it.

Reply with EXACTLY one word: haiku, sonnet, or opus.

Guidelines:
- haiku: Simple factual questions, greetings, acknowledgments, quick lookups, status checks, reminders, short translations, basic math. Anything that needs a fast, brief answer.
- sonnet: Moderate tasks — summarization, writing emails/messages, code explanations, debugging simple bugs, data analysis, research, most everyday tasks. The default workhorse.
- opus: Complex reasoning, multi-step planning, architecture decisions, nuanced creative writing, difficult debugging, strategic analysis, tasks requiring deep thought or careful judgment. Use sparingly — only when the task genuinely demands it.

When in doubt between two levels, pick the lower one. Most messages are sonnet-level.`;

const MODEL_MAP: Record<string, string> = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: ROUTER_MODEL,
};

/**
 * Classify a message and return the appropriate model.
 * Falls back to the default model on any error.
 */
export async function routeModel(
  messageText: string,
  defaultModel: string,
): Promise<string> {
  try {
    const classification = await classify(messageText);
    const model = MODEL_MAP[classification];
    if (model) {
      logger.info({ classification, model }, 'Model router classification');
      return model;
    }
  } catch (err) {
    logger.warn({ err }, 'Model router failed, using default');
  }
  return defaultModel;
}

async function classify(text: string): Promise<string> {
  const secrets = readEnvFile([
    'ANTHROPIC_API_KEY',
    'CLAUDE_CODE_OAUTH_TOKEN',
    'ANTHROPIC_AUTH_TOKEN',
  ]);

  // Build headers based on auth mode
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'anthropic-version': '2023-06-01',
  };

  const oauthToken =
    secrets.CLAUDE_CODE_OAUTH_TOKEN || secrets.ANTHROPIC_AUTH_TOKEN;

  if (secrets.ANTHROPIC_API_KEY) {
    headers['x-api-key'] = secrets.ANTHROPIC_API_KEY;
  } else if (oauthToken) {
    headers['authorization'] = `Bearer ${oauthToken}`;
  } else {
    throw new Error('No credentials available for model routing');
  }

  const body = JSON.stringify({
    model: ROUTER_MODEL,
    max_tokens: 10,
    system: CLASSIFICATION_PROMPT,
    messages: [{ role: 'user', content: text.slice(0, 500) }],
  });

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        hostname: 'api.anthropic.com',
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        headers: { ...headers, 'content-length': Buffer.byteLength(body) },
        timeout: 5000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const result = parsed.content?.[0]?.text?.trim().toLowerCase();
            if (
              result === 'opus' ||
              result === 'sonnet' ||
              result === 'haiku'
            ) {
              resolve(result);
            } else {
              logger.debug({ statusCode: res.statusCode, body: data.slice(0, 300) }, 'Router unexpected response');
              reject(new Error(`Unexpected classification: ${result}`));
            }
          } catch (err) {
            reject(err);
          }
        });
      },
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Classification timeout'));
    });
    req.write(body);
    req.end();
  });
}
