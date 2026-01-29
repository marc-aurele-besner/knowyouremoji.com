/**
 * Emoji components barrel export
 */

// Core emoji display components
export { EmojiHeader, type EmojiHeaderProps } from './emoji-header';
export { EmojiContextCard, type EmojiContextCardProps } from './emoji-context-card';
export { EmojiTLDR, type EmojiTLDRProps } from './emoji-tldr';
export { EmojiComboList, type EmojiComboListProps, type EmojiCombo } from './emoji-combo-list';
export { EmojiCopyButton, type EmojiCopyButtonProps } from './emoji-copy-button';
export { EmojiGrid, type EmojiGridProps, type EmojiGridColumns } from './emoji-grid';
export {
  EmojiPlatformPreview,
  type EmojiPlatformPreviewProps,
  type PlatformType,
  type PlatformEmoji,
} from './emoji-platform-preview';
export { EmojiSearch, type EmojiSearchProps } from './emoji-search';
export {
  EmojiWarnings,
  type EmojiWarningsProps,
  type EmojiWarningExtended,
} from './emoji-warnings';

// Section components
export {
  ContextMeaningsSection,
  type ContextMeaningsSectionProps,
} from './context-meanings-section';
export {
  EmojiCombosSection,
  type EmojiCombosSectionProps,
  type ComboWithEmoji,
} from './emoji-combos-section';
export {
  GenerationalNotesSection,
  type GenerationalNotesSectionProps,
  type GenerationalNoteExtended,
  type CringeFactor,
} from './generational-notes-section';
export {
  PlatformNotesSection,
  type PlatformNotesSectionProps,
  type PlatformNoteExtended,
  type NoteImportance,
} from './platform-notes-section';
export {
  RelatedEmojisSection,
  type RelatedEmojisSectionProps,
  type RelatedEmoji,
} from './related-emojis-section';

// Navigation component
export { CategoryLink, type CategoryLinkProps } from './category-link';
