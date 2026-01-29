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
  className,
}: InterpreterFormProps) {
  const [message, setMessage] = useState(initialMessage);
  const [platform, setPlatform] = useState<Platform | 'OTHER' | undefined>(initialPlatform);
  const [context, setContext] = useState<RelationshipContext | undefined>(initialContext);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageErrorId = useId();
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
      return 'text-red-600';
    }
    if (message.length >= MAX_MESSAGE_LENGTH * 0.9) {
      return 'text-yellow-600';
    }
    return 'text-gray-500';
  };

  const showUsageCounter = usageRemaining !== undefined && usageMax !== undefined;

  return (
    <form role="form" onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)}>
      {/* Message Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            'min-h-[120px] w-full resize-y rounded-md border bg-white px-3 py-2 text-sm',
            'dark:bg-gray-800 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-gray-900',
            'disabled:cursor-not-allowed disabled:opacity-50',
            errors.message
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus-visible:ring-amber-500'
          )}
          aria-describedby={errors.message ? messageErrorId : undefined}
          aria-invalid={!!errors.message}
        />
        <div className="flex items-center justify-between">
          {errors.message ? (
            <span id={messageErrorId} className="text-sm text-red-600" role="alert">
              {errors.message}
            </span>
          ) : (
            <span />
          )}
          <span data-testid="char-counter" className={cn('text-sm', getCharCountColor())}>
            {message.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="flex flex-col gap-2">
        <label id="platform-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Platform
        </label>
        <PlatformSelector
          value={platform}
          onChange={handlePlatformChange}
          variant="dropdown"
          disabled={isFormDisabled}
          aria-labelledby="platform-label"
        />
        {errors.platform && (
          <span id={platformErrorId} className="text-sm text-red-600" role="alert">
            {errors.platform}
          </span>
        )}
      </div>

      {/* Context Selector */}
      <div className="flex flex-col gap-2">
        <label id="context-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Relationship context
        </label>
        <ContextSelector
          value={context}
          onChange={handleContextChange}
          variant="radio"
          disabled={isFormDisabled}
          aria-labelledby="context-label"
        />
        {errors.context && (
          <span id={contextErrorId} className="text-sm text-red-600" role="alert">
            {errors.context}
          </span>
        )}
      </div>

      {/* Usage Counter and Submit */}
      <div className="flex items-center justify-between gap-4">
        {showUsageCounter && (
          <UsageCounter remaining={usageRemaining} max={usageMax} variant="default" />
        )}
        <Button
          type="submit"
          disabled={isFormDisabled || isRateLimited}
          loading={isSubmitting}
          className={cn(!showUsageCounter && 'ml-auto')}
        >
          {isSubmitting ? 'Interpreting...' : 'Interpret Message'}
        </Button>
      </div>
    </form>
  );
}
