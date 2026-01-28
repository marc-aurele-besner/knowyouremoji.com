/**
 * Type exports for KnowYourEmoji
 */

export type {
  // Basic types
  EmojiCodepoint,
  EmojiSlug,
  EmojiCategoryName,
  EmojiCategoryDisplayName,
  UnicodeVersion,
  // Context types
  ContextType,
  RiskLevel,
  Platform,
  Generation,
  WarningSeverity,
  RelationshipContext,
  // Interface types
  ContextMeaning,
  PlatformNote,
  GenerationalNote,
  EmojiWarning,
  Emoji,
  EmojiSummary,
  // Collection types
  EmojiSearchResult,
  EmojiCollection,
  EmojiCategoryWithEmojis,
  // Utility types
  EmojiValidationResult,
  EmojiDraft,
  // Interpreter types
  InterpretRequest,
  DetectedEmoji,
  InterpretationMetrics,
  RedFlag,
  InterpretationResult,
  InterpretErrorResponse,
} from './emoji';
