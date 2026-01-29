import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Emoji } from '../../../src/types/emoji';
import {
  validateEmoji,
  validateContextMeaning,
  validatePlatformNote,
  validateGenerationalNote,
  validateWarning,
  checkDuplicateSlugs,
  checkComboReferences,
  validateAllEmojis,
  loadEmojisFromDirectory,
  loadComboSlugs,
  main,
  isRunningDirectly,
  handleMainError,
} from '../../../scripts/validate-emojis';

// Valid test emoji
const validEmoji: Emoji = {
  unicode: '1F480',
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  shortName: 'skull',
  category: 'faces',
  subcategory: 'face-negative',
  unicodeVersion: '6.0',
  baseMeaning: 'A human skull.',
  tldr: 'Usually means I am dead from laughing.',
  contextMeanings: [
    {
      context: 'SLANG',
      meaning: 'Something is extremely funny.',
      example: 'That meme 💀💀💀',
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [
    {
      platform: 'TIKTOK',
      note: 'Very common in comments.',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Almost exclusively means I am dead from laughing.',
    },
  ],
  warnings: [
    {
      title: 'Context matters',
      description: 'Can be misinterpreted by older generations.',
      severity: 'LOW',
    },
  ],
  relatedCombos: ['skull-laughing'],
  seoTitle: 'Skull Emoji Meaning',
  seoDescription: 'Learn what the skull emoji means.',
};

describe('validate-emojis', () => {
  describe('validateEmoji', () => {
    it('should return no errors for a valid emoji', () => {
      const errors = validateEmoji(validEmoji);
      expect(errors).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const invalidEmoji = { slug: 'test' } as unknown as Emoji;
      const errors = validateEmoji(invalidEmoji);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === 'unicode')).toBe(true);
      expect(errors.some((e) => e.field === 'character')).toBe(true);
      expect(errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('should detect empty string fields', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        unicode: '',
        name: '',
      };
      const errors = validateEmoji(invalidEmoji);

      expect(errors.some((e) => e.field === 'unicode' && e.message.includes('empty'))).toBe(true);
      expect(errors.some((e) => e.field === 'name' && e.message.includes('empty'))).toBe(true);
    });

    it('should validate invalid items in contextMeanings array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        contextMeanings: [
          {
            context: 'INVALID_CONTEXT' as Emoji['contextMeanings'][0]['context'],
            meaning: '',
            example: '',
            riskLevel: 'INVALID' as Emoji['contextMeanings'][0]['riskLevel'],
          },
        ],
      };
      const errors = validateEmoji(invalidEmoji);
      expect(errors.some((e) => e.field === 'contextMeanings[0]')).toBe(true);
      expect(errors.some((e) => e.file === 'skull')).toBe(true);
    });

    it('should validate invalid items in platformNotes array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        platformNotes: [
          {
            platform: 'INVALID_PLATFORM' as Emoji['platformNotes'][0]['platform'],
            note: '',
          },
        ],
      };
      const errors = validateEmoji(invalidEmoji);
      expect(errors.some((e) => e.field === 'platformNotes[0]')).toBe(true);
      expect(errors.some((e) => e.file === 'skull')).toBe(true);
    });

    it('should validate invalid items in generationalNotes array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        generationalNotes: [
          {
            generation: 'INVALID_GEN' as Emoji['generationalNotes'][0]['generation'],
            note: '',
          },
        ],
      };
      const errors = validateEmoji(invalidEmoji);
      expect(errors.some((e) => e.field === 'generationalNotes[0]')).toBe(true);
      expect(errors.some((e) => e.file === 'skull')).toBe(true);
    });

    it('should validate invalid items in warnings array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        warnings: [
          {
            title: '',
            description: '',
            severity: 'INVALID' as Emoji['warnings'][0]['severity'],
          },
        ],
      };
      const errors = validateEmoji(invalidEmoji);
      expect(errors.some((e) => e.field === 'warnings[0]')).toBe(true);
      expect(errors.some((e) => e.file === 'skull')).toBe(true);
    });

    it('should use unknown as file when slug is missing', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        slug: undefined as unknown as string,
        contextMeanings: [
          {
            context: 'INVALID_CONTEXT' as Emoji['contextMeanings'][0]['context'],
            meaning: 'test',
            example: 'test',
            riskLevel: 'LOW',
          },
        ],
      };
      const errors = validateEmoji(invalidEmoji);
      expect(errors.some((e) => e.file === 'unknown')).toBe(true);
    });

    it('should detect invalid contextMeanings array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        contextMeanings: 'not-an-array' as unknown as Emoji['contextMeanings'],
      };
      const errors = validateEmoji(invalidEmoji);

      expect(errors.some((e) => e.field === 'contextMeanings')).toBe(true);
    });

    it('should detect invalid platformNotes array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        platformNotes: 'not-an-array' as unknown as Emoji['platformNotes'],
      };
      const errors = validateEmoji(invalidEmoji);

      expect(errors.some((e) => e.field === 'platformNotes')).toBe(true);
    });

    it('should detect invalid generationalNotes array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        generationalNotes: 'not-an-array' as unknown as Emoji['generationalNotes'],
      };
      const errors = validateEmoji(invalidEmoji);

      expect(errors.some((e) => e.field === 'generationalNotes')).toBe(true);
    });

    it('should detect invalid warnings array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        warnings: 'not-an-array' as unknown as Emoji['warnings'],
      };
      const errors = validateEmoji(invalidEmoji);

      expect(errors.some((e) => e.field === 'warnings')).toBe(true);
    });

    it('should detect invalid relatedCombos array', () => {
      const invalidEmoji: Emoji = {
        ...validEmoji,
        relatedCombos: 'not-an-array' as unknown as Emoji['relatedCombos'],
      };
      const errors = validateEmoji(invalidEmoji);

      expect(errors.some((e) => e.field === 'relatedCombos')).toBe(true);
    });
  });

  describe('validateContextMeaning', () => {
    it('should return no errors for valid context meaning', () => {
      const errors = validateContextMeaning(validEmoji.contextMeanings[0], 0);
      expect(errors).toEqual([]);
    });

    it('should detect invalid context type', () => {
      const invalid = {
        context: 'INVALID_CONTEXT',
        meaning: 'test',
        example: 'test',
        riskLevel: 'LOW',
      };
      const errors = validateContextMeaning(invalid as unknown as Emoji['contextMeanings'][0], 0);

      expect(errors.some((e) => e.message.includes('context'))).toBe(true);
    });

    it('should detect invalid risk level', () => {
      const invalid = {
        context: 'SLANG',
        meaning: 'test',
        example: 'test',
        riskLevel: 'INVALID',
      };
      const errors = validateContextMeaning(invalid as unknown as Emoji['contextMeanings'][0], 0);

      expect(errors.some((e) => e.message.includes('riskLevel'))).toBe(true);
    });

    it('should detect missing required fields', () => {
      const invalid = { context: 'SLANG' };
      const errors = validateContextMeaning(invalid as unknown as Emoji['contextMeanings'][0], 0);

      expect(errors.some((e) => e.message.includes('meaning'))).toBe(true);
      expect(errors.some((e) => e.message.includes('example'))).toBe(true);
    });
  });

  describe('validatePlatformNote', () => {
    it('should return no errors for valid platform note', () => {
      const errors = validatePlatformNote(validEmoji.platformNotes[0], 0);
      expect(errors).toEqual([]);
    });

    it('should detect invalid platform', () => {
      const invalid = {
        platform: 'INVALID_PLATFORM',
        note: 'test',
      };
      const errors = validatePlatformNote(invalid as unknown as Emoji['platformNotes'][0], 0);

      expect(errors.some((e) => e.message.includes('platform'))).toBe(true);
    });

    it('should detect missing note', () => {
      const invalid = { platform: 'TIKTOK' };
      const errors = validatePlatformNote(invalid as unknown as Emoji['platformNotes'][0], 0);

      expect(errors.some((e) => e.message.includes('note'))).toBe(true);
    });
  });

  describe('validateGenerationalNote', () => {
    it('should return no errors for valid generational note', () => {
      const errors = validateGenerationalNote(validEmoji.generationalNotes[0], 0);
      expect(errors).toEqual([]);
    });

    it('should detect invalid generation', () => {
      const invalid = {
        generation: 'INVALID_GEN',
        note: 'test',
      };
      const errors = validateGenerationalNote(
        invalid as unknown as Emoji['generationalNotes'][0],
        0
      );

      expect(errors.some((e) => e.message.includes('generation'))).toBe(true);
    });

    it('should detect missing note', () => {
      const invalid = { generation: 'GEN_Z' };
      const errors = validateGenerationalNote(
        invalid as unknown as Emoji['generationalNotes'][0],
        0
      );

      expect(errors.some((e) => e.message.includes('note'))).toBe(true);
    });
  });

  describe('validateWarning', () => {
    it('should return no errors for valid warning', () => {
      const errors = validateWarning(validEmoji.warnings[0], 0);
      expect(errors).toEqual([]);
    });

    it('should detect invalid severity', () => {
      const invalid = {
        title: 'test',
        description: 'test',
        severity: 'INVALID',
      };
      const errors = validateWarning(invalid as unknown as Emoji['warnings'][0], 0);

      expect(errors.some((e) => e.message.includes('severity'))).toBe(true);
    });

    it('should detect missing required fields', () => {
      const invalid = { severity: 'LOW' };
      const errors = validateWarning(invalid as unknown as Emoji['warnings'][0], 0);

      expect(errors.some((e) => e.message.includes('title'))).toBe(true);
      expect(errors.some((e) => e.message.includes('description'))).toBe(true);
    });
  });

  describe('checkDuplicateSlugs', () => {
    it('should return no errors for unique slugs', () => {
      const emojis = [
        { ...validEmoji, slug: 'emoji-1' },
        { ...validEmoji, slug: 'emoji-2' },
        { ...validEmoji, slug: 'emoji-3' },
      ];
      const errors = checkDuplicateSlugs(emojis);
      expect(errors).toEqual([]);
    });

    it('should detect duplicate slugs', () => {
      const emojis = [
        { ...validEmoji, slug: 'duplicate' },
        { ...validEmoji, slug: 'unique' },
        { ...validEmoji, slug: 'duplicate' },
      ];
      const errors = checkDuplicateSlugs(emojis);

      expect(errors.length).toBe(1);
      expect(errors[0].message).toContain('duplicate');
    });

    it('should detect multiple duplicates', () => {
      const emojis = [
        { ...validEmoji, slug: 'dup1' },
        { ...validEmoji, slug: 'dup2' },
        { ...validEmoji, slug: 'dup1' },
        { ...validEmoji, slug: 'dup2' },
      ];
      const errors = checkDuplicateSlugs(emojis);

      expect(errors.length).toBe(2);
    });
  });

  describe('checkComboReferences', () => {
    it('should return no errors when all combos exist', () => {
      const emojis = [{ ...validEmoji, relatedCombos: ['skull-laughing'] }];
      const existingCombos = new Set(['skull-laughing']);
      const errors = checkComboReferences(emojis, existingCombos);

      expect(errors).toEqual([]);
    });

    it('should detect missing combo references', () => {
      const emojis = [{ ...validEmoji, slug: 'skull', relatedCombos: ['non-existent-combo'] }];
      const existingCombos = new Set(['skull-laughing']);
      const errors = checkComboReferences(emojis, existingCombos);

      expect(errors.length).toBe(1);
      expect(errors[0].message).toContain('non-existent-combo');
      expect(errors[0].file).toBe('skull');
    });

    it('should handle empty relatedCombos', () => {
      const emojis = [{ ...validEmoji, relatedCombos: [] }];
      const existingCombos = new Set(['skull-laughing']);
      const errors = checkComboReferences(emojis, existingCombos);

      expect(errors).toEqual([]);
    });
  });

  describe('validateAllEmojis', () => {
    it('should return valid result for valid emojis', () => {
      const emojis = [validEmoji];
      const combos = new Set(['skull-laughing']);
      const result = validateAllEmojis(emojis, combos);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should return invalid result with errors for invalid emojis', () => {
      const invalidEmoji = { slug: 'test' } as unknown as Emoji;
      const result = validateAllEmojis([invalidEmoji], new Set());

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should combine all validation errors', () => {
      const emojis = [
        { ...validEmoji, slug: 'dup', relatedCombos: ['missing-combo'] },
        { ...validEmoji, slug: 'dup' },
      ];
      const result = validateAllEmojis(emojis, new Set());

      expect(result.valid).toBe(false);
      // Should have duplicate slug error and missing combo error
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
      expect(result.errors.some((e) => e.includes('missing-combo'))).toBe(true);
    });
  });

  describe('loadEmojisFromDirectory', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emoji-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should return empty array for non-existent directory', () => {
      const result = loadEmojisFromDirectory('/non/existent/path');
      expect(result).toEqual([]);
    });

    it('should return empty array for directory with no JSON files', () => {
      fs.writeFileSync(path.join(tempDir, 'readme.txt'), 'Not a JSON file');
      const result = loadEmojisFromDirectory(tempDir);
      expect(result).toEqual([]);
    });

    it('should load valid emoji JSON files', () => {
      fs.writeFileSync(path.join(tempDir, 'skull.json'), JSON.stringify(validEmoji));
      const result = loadEmojisFromDirectory(tempDir);
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe('skull');
    });

    it('should load multiple JSON files', () => {
      const emoji2 = { ...validEmoji, slug: 'heart', unicode: '2764' };
      fs.writeFileSync(path.join(tempDir, 'skull.json'), JSON.stringify(validEmoji));
      fs.writeFileSync(path.join(tempDir, 'heart.json'), JSON.stringify(emoji2));
      const result = loadEmojisFromDirectory(tempDir);
      expect(result.length).toBe(2);
    });

    it('should skip invalid JSON files and log error', () => {
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      fs.writeFileSync(path.join(tempDir, 'invalid.json'), 'not valid json{');
      const result = loadEmojisFromDirectory(tempDir);
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('loadComboSlugs', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'combo-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should return empty set for non-existent directory', () => {
      const result = loadComboSlugs('/non/existent/path');
      expect(result.size).toBe(0);
    });

    it('should return empty set for directory with no JSON files', () => {
      fs.writeFileSync(path.join(tempDir, 'readme.txt'), 'Not a JSON file');
      const result = loadComboSlugs(tempDir);
      expect(result.size).toBe(0);
    });

    it('should load combo slugs from JSON files', () => {
      const combo = { slug: 'skull-laughing', name: 'Skull Laughing' };
      fs.writeFileSync(path.join(tempDir, 'skull-laughing.json'), JSON.stringify(combo));
      const result = loadComboSlugs(tempDir);
      expect(result.size).toBe(1);
      expect(result.has('skull-laughing')).toBe(true);
    });

    it('should load multiple combo slugs', () => {
      fs.writeFileSync(
        path.join(tempDir, 'combo1.json'),
        JSON.stringify({ slug: 'combo-1', name: 'Combo 1' })
      );
      fs.writeFileSync(
        path.join(tempDir, 'combo2.json'),
        JSON.stringify({ slug: 'combo-2', name: 'Combo 2' })
      );
      const result = loadComboSlugs(tempDir);
      expect(result.size).toBe(2);
      expect(result.has('combo-1')).toBe(true);
      expect(result.has('combo-2')).toBe(true);
    });

    it('should skip files without slug field', () => {
      fs.writeFileSync(path.join(tempDir, 'no-slug.json'), JSON.stringify({ name: 'No Slug' }));
      const result = loadComboSlugs(tempDir);
      expect(result.size).toBe(0);
    });

    it('should skip invalid JSON files and log error', () => {
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      fs.writeFileSync(path.join(tempDir, 'invalid.json'), 'not valid json{');
      const result = loadComboSlugs(tempDir);
      expect(result.size).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('main', () => {
    let tempDir: string;
    let emojisDir: string;
    let combosDir: string;
    let originalCwd: () => string;
    let consoleLogSpy: ReturnType<typeof spyOn>;
    let processExitSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'main-test-'));
      emojisDir = path.join(tempDir, 'src', 'data', 'emojis');
      combosDir = path.join(tempDir, 'src', 'data', 'combos');
      fs.mkdirSync(emojisDir, { recursive: true });
      fs.mkdirSync(combosDir, { recursive: true });

      originalCwd = process.cwd;
      process.cwd = () => tempDir;

      consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
      processExitSpy = spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
    });

    afterEach(() => {
      process.cwd = originalCwd;
      consoleLogSpy.mockRestore();
      processExitSpy.mockRestore();
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should exit with code 1 when no emoji files found', async () => {
      await expect(main()).rejects.toThrow('process.exit called');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should succeed with valid emoji files', async () => {
      fs.writeFileSync(path.join(emojisDir, 'skull.json'), JSON.stringify(validEmoji));
      fs.writeFileSync(
        path.join(combosDir, 'skull-laughing.json'),
        JSON.stringify({ slug: 'skull-laughing' })
      );

      await main();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('valid'));
    });

    it('should exit with code 1 when validation fails', async () => {
      const invalidEmoji = { slug: 'test' };
      fs.writeFileSync(path.join(emojisDir, 'invalid.json'), JSON.stringify(invalidEmoji));

      await expect(main()).rejects.toThrow('process.exit called');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('isRunningDirectly', () => {
    it('should return false when imported as module', () => {
      // When running tests, this file is imported as a module, not run directly
      const result = isRunningDirectly();
      expect(result).toBe(false);
    });
  });

  describe('handleMainError', () => {
    let consoleErrorSpy: ReturnType<typeof spyOn>;
    let processExitSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
      consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
      processExitSpy = spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should log error and exit with code 1', () => {
      const testError = new Error('Test error');
      expect(() => handleMainError(testError)).toThrow('process.exit called');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Validation script failed:', testError);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
