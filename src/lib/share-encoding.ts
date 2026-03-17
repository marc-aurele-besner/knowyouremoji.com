/**
 * Share encoding utilities for interpreter results.
 * Encodes interpretation data as base64 URL params for Phase 1 (no database).
 */

import type { InterpretationResult } from '@/types';

/**
 * Minimal shared interpretation data structure
 */
export interface SharedInterpretation {
  /** Original message (truncated to 200 chars) */
  message: string;
  /** Interpretation text (truncated to 500 chars) */
  interpretation: string;
  /** Overall tone */
  tone: 'positive' | 'neutral' | 'negative';
  /** Sarcasm probability (0-100) */
  sarcasm: number;
  /** Passive-aggression probability (0-100) */
  passiveAggression: number;
  /** Confidence (0-100) */
  confidence: number;
}

/**
 * Encode an interpretation result into a base64 string for URL sharing.
 * Truncates text fields to keep the URL under ~2000 chars.
 */
export function encodeInterpretation(result: InterpretationResult): string {
  const data: SharedInterpretation = {
    message: result.message.slice(0, 200),
    interpretation: result.interpretation.slice(0, 500),
    tone: result.metrics.overallTone,
    sarcasm: result.metrics.sarcasmProbability,
    passiveAggression: result.metrics.passiveAggressionProbability,
    confidence: result.metrics.confidence,
  };

  const json = JSON.stringify(data);
  // Use btoa for base64 encoding - handle unicode by encoding to URI first
  const encoded = btoa(encodeURIComponent(json));
  return encoded;
}

/**
 * Decode a base64 string back into a SharedInterpretation object.
 * Returns null if the data is invalid or corrupted.
 */
export function decodeInterpretation(encoded: string): SharedInterpretation | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);

    // Validate required fields
    if (
      typeof data.message !== 'string' ||
      typeof data.interpretation !== 'string' ||
      !['positive', 'neutral', 'negative'].includes(data.tone) ||
      typeof data.sarcasm !== 'number' ||
      typeof data.passiveAggression !== 'number' ||
      typeof data.confidence !== 'number'
    ) {
      return null;
    }

    return {
      message: data.message,
      interpretation: data.interpretation,
      tone: data.tone,
      sarcasm: data.sarcasm,
      passiveAggression: data.passiveAggression,
      confidence: data.confidence,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a shareable URL for an interpretation result.
 */
export function getShareUrl(result: InterpretationResult, baseUrl: string): string {
  const encoded = encodeInterpretation(result);
  return `${baseUrl}/interpreter?r=${encoded}`;
}
