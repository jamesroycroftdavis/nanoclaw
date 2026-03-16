import { readEnvFile } from './env.js';
import { logger } from './logger.js';

const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-large-v3-turbo';

/**
 * Transcribe an audio buffer using Groq's Whisper API.
 * Returns the transcript text, or null if transcription fails or is unavailable.
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = 'voice.ogg',
): Promise<string | null> {
  const apiKey =
    process.env.GROQ_API_KEY || readEnvFile(['GROQ_API_KEY']).GROQ_API_KEY;

  if (!apiKey) {
    logger.warn('GROQ_API_KEY not set — voice transcription unavailable');
    return null;
  }

  try {
    const boundary = `----NanoClawBoundary${Date.now()}`;
    const parts: Buffer[] = [];

    // File part
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: audio/ogg\r\n\r\n`,
      ),
    );
    parts.push(audioBuffer);
    parts.push(Buffer.from('\r\n'));

    // Model part
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n${WHISPER_MODEL}\r\n`,
      ),
    );

    // Close boundary
    parts.push(Buffer.from(`--${boundary}--\r\n`));

    const body = Buffer.concat(parts);

    const response = await fetch(GROQ_WHISPER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        { status: response.status, error: errorText },
        'Groq transcription API error',
      );
      return null;
    }

    const result = (await response.json()) as { text?: string };
    const transcript = result.text?.trim();

    if (transcript) {
      logger.info({ chars: transcript.length }, 'Transcribed voice message');
      return transcript;
    }

    return null;
  } catch (err) {
    logger.error({ err }, 'Voice transcription failed');
    return null;
  }
}
