'use client';

import { useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import type { Platform, RelationshipContext } from '@/types';
import { Button } from '@/components/ui/button';
import { PlatformSelector } from '@/components/interpreter/platform-selector';
import { ContextSelector } from '@/components/interpreter/context-selector';
import { UsageCounter } from '@/components/rate-limit/usage-counter';

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 1000;
const EMOJI_REGEX = /\p{Emoji}/u;
const EMOJI_COUNT_REGEX =
  /\p{Regional_Indicator}{2}|\p{Extended_Pictographic}[\uFE0F\p{Emoji_Modifier}]*(?:\u200D\p{Extended_Pictographic}[\uFE0F\p{Emoji_Modifier}]*)*/gu;

/** Count the emojis (graphemes, not code points) in a message. */
export function countEmojis(value: string): number {
  return value.match(EMOJI_COUNT_REGEX)?.length ?? 0;
}

function emojiCountText(count: number): string {
  if (count === 0) return 'No emojis yet';
  return `${count} emoji${count === 1 ? '' : 's'} detected`;
}

export interface InterpreterFormData {
  message: string;
  platform: Platform | 'OTHER';
  context: RelationshipContext;
}

export interface InterpreterFormProps {
  onSubmit: (data: InterpreterFormData) => Promise<void>;
  disabled?: boolean;
  usageRemaining?: number;
  usageMax?: number;
  initialMessage?: string;
  initialPlatform?: Platform | 'OTHER';
  initialContext?: RelationshipContext;
  /** Whether results stream in as they're written (shows a toggle when `onStreamingChange` is set) */
  streaming?: boolean;
  /** Called when the user flips the streaming toggle */
  onStreamingChange?: (streaming: boolean) => void;
  className?: string;
}

interface FormErrors {
  message?: string;
  platform?: string;
  context?: string;
}

/**
 * Interpreter form component for submitting messages for AI interpretation.
 * Includes message textarea, platform/context selectors, and validation.
 */
export function InterpreterForm({
  onSubmit,
  disabled = false,
  usageRemaining,
  usageMax,
  initialMessage = '',
  initialPlatform,
  initialContext,
  streaming = true,
  onStreamingChange,
  className,
}: InterpreterFormProps) {
  const [message, setMessage] = useState(initialMessage);
  const [platform, setPlatform] = useState<Platform | 'OTHER' | undefined>(initialPlatform);
  const [context, setContext] = useState<RelationshipContext | undefined>(initialContext);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageErrorId = useId();
  const messageHintId = useId();
  const streamingId = useId();
  const platformErrorId = useId();
  const contextErrorId = useId();

  const isRateLimited = usageRemaining !== undefined && usageRemaining <= 0;
  const isFormDisabled = disabled || isSubmitting;

  const validateMessage = useCallback((value: string): string | undefined => {
    if (value.length < MIN_MESSAGE_LENGTH) {
      return `Message must be at least ${MIN_MESSAGE_LENGTH} characters`;
    }
    if (value.length > MAX_MESSAGE_LENGTH) {
      return `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`;
    }
    if (!EMOJI_REGEX.test(value)) {
      return 'Message must contain at least one emoji';
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const messageError = validateMessage(message);
    if (messageError) {
      newErrors.message = messageError;
    }

    if (!platform) {
      newErrors.platform = 'Please select a platform';
    }

    if (!context) {
      newErrors.context = 'Please select a relationship context';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [message, platform, context, validateMessage]);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setMessage(newValue);

      // Clear message error when user types valid input
      if (errors.message && !validateMessage(newValue)) {
        setErrors((prev) => ({ ...prev, message: undefined }));
      }
    },
    [errors.message, validateMessage]
  );

  const handlePlatformChange = useCallback(
    (newPlatform: Platform | 'OTHER') => {
      setPlatform(newPlatform);
      if (errors.platform) {
        setErrors((prev) => ({ ...prev, platform: undefined }));
      }
    },
    [errors.platform]
  );

  const handleContextChange = useCallback(
    (newContext: RelationshipContext) => {
      setContext(newContext);
      if (errors.context) {
        setErrors((prev) => ({ ...prev, context: undefined }));
      }
    },
    [errors.context]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          message,
          platform: platform!,
          context: context!,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, message, platform, context]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const getCharCountColor = () => {
    if (message.length >= MAX_MESSAGE_LENGTH) {
      return 'text-danger';
    }
    if (message.length >= MAX_MESSAGE_LENGTH * 0.9) {
      return 'text-primary-700';
    }
    return 'text-muted-foreground';
  };

  const showUsageCounter = usageRemaining !== undefined && usageMax !== undefined;

  const labelClass = 'text-sm font-semibold text-foreground';

  return (
    <form role="form" onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)}>
      {/* Message Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>
          Message to interpret
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          disabled={isFormDisabled}
          placeholder="Paste or type the message you want to decode... (must include emojis)"
          className={cn(
            'min-h-[120px] w-full resize-y rounded-xl border bg-card px-3.5 py-3 text-[15px] text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            'disabled:cursor-not-allowed disabled:opacity-50',
            errors.message
              ? 'border-danger focus-visible:ring-danger'
              : 'border-card-border focus-visible:ring-primary-500'
          )}
          aria-describedby={errors.message ? `${messageErrorId} ${messageHintId}` : messageHintId}
          aria-invalid={!!errors.message}
        />
        <div id={messageHintId} className="flex items-center justify-between gap-3 text-[13px]">
          <span data-testid="emoji-count" className="text-muted-foreground">
            {emojiCountText(countEmojis(message))}
          </span>
          <span data-testid="char-counter" className={getCharCountColor()}>
            {message.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
        {errors.message && (
          <span id={messageErrorId} className="text-sm text-danger" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {/* Platform Selector */}
      <div className="flex flex-col gap-2">
        <label id="platform-label" className={labelClass}>
          Platform
        </label>
        <PlatformSelector
          value={platform}
          onChange={handlePlatformChange}
          variant="buttons"
          disabled={isFormDisabled}
          aria-labelledby="platform-label"
        />
        {errors.platform && (
          <span id={platformErrorId} className="text-sm text-danger" role="alert">
            {errors.platform}
          </span>
        )}
      </div>

      {/* Context Selector */}
      <div className="flex flex-col gap-2">
        <label id="context-label" className={labelClass}>
          Who sent it?
        </label>
        <ContextSelector
          value={context}
          onChange={handleContextChange}
          variant="radio"
          disabled={isFormDisabled}
          aria-labelledby="context-label"
        />
        {errors.context && (
          <span id={contextErrorId} className="text-sm text-danger" role="alert">
            {errors.context}
          </span>
        )}
      </div>

      {onStreamingChange && (
        <label htmlFor={streamingId} className="flex items-center gap-2.5 text-sm text-foreground">
          <input
            id={streamingId}
            type="checkbox"
            checked={streaming}
            onChange={(e) => onStreamingChange(e.target.checked)}
            disabled={isFormDisabled}
            className="h-4 w-4 rounded accent-primary-500"
          />
          Stream the answer as it&apos;s written
        </label>
      )}

      {/* Submit and Usage Counter */}
      <div className="flex flex-col items-center gap-3">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={isFormDisabled || isRateLimited}
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Interpreting...' : 'Interpret message'}
        </Button>
        {showUsageCounter && (
          <UsageCounter remaining={usageRemaining} max={usageMax} variant="default" />
        )}
      </div>
    </form>
  );
}
