import { describe, it, expect } from 'bun:test';
import { cn } from '../../../src/lib/utils';

describe('cn utility', () => {
  describe('basic functionality', () => {
    it('should merge class names', () => {
      const result = cn('px-4', 'py-2');
      expect(result).toBe('px-4 py-2');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle single class name', () => {
      const result = cn('single-class');
      expect(result).toBe('single-class');
    });

    it('should handle multiple class names', () => {
      const result = cn('class1', 'class2', 'class3', 'class4');
      expect(result).toBe('class1 class2 class3 class4');
    });
  });

  describe('conditional classes', () => {
    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base active');
    });

    it('should handle false conditionals', () => {
      const isActive = false;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base');
    });

    it('should handle ternary conditionals', () => {
      const isError = true;
      const result = cn('base', isError ? 'text-red-500' : 'text-green-500');
      expect(result).toBe('base text-red-500');
    });

    it('should handle multiple conditionals', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn('base', isActive && 'active', isDisabled && 'disabled');
      expect(result).toBe('base active');
    });
  });

  describe('tailwind class merging', () => {
    it('should merge conflicting tailwind classes', () => {
      const result = cn('px-4', 'px-8');
      expect(result).toBe('px-8');
    });

    it('should merge conflicting margin classes', () => {
      const result = cn('mx-2', 'mx-4');
      expect(result).toBe('mx-4');
    });

    it('should merge conflicting padding on same axis', () => {
      const result = cn('py-2', 'py-4');
      expect(result).toBe('py-4');
    });

    it('should preserve different axis classes', () => {
      const result = cn('px-2', 'py-4');
      expect(result).toBe('px-2 py-4');
    });

    it('should merge conflicting text colors', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('should merge conflicting background colors', () => {
      const result = cn('bg-white', 'bg-gray-100');
      expect(result).toBe('bg-gray-100');
    });

    it('should handle responsive prefixes', () => {
      const result = cn('px-2', 'md:px-4', 'lg:px-6');
      expect(result).toBe('px-2 md:px-4 lg:px-6');
    });

    it('should merge conflicting responsive classes', () => {
      const result = cn('md:px-2', 'md:px-4');
      expect(result).toBe('md:px-4');
    });

    it('should handle state prefixes', () => {
      const result = cn('hover:bg-blue-500', 'focus:bg-blue-600');
      expect(result).toBe('hover:bg-blue-500 focus:bg-blue-600');
    });

    it('should merge conflicting state classes', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500');
      expect(result).toBe('hover:bg-red-500');
    });

    it('should handle arbitrary values', () => {
      const result = cn('w-[100px]', 'h-[200px]');
      expect(result).toBe('w-[100px] h-[200px]');
    });

    it('should merge conflicting arbitrary values', () => {
      const result = cn('w-[100px]', 'w-[200px]');
      expect(result).toBe('w-[200px]');
    });
  });

  describe('array inputs', () => {
    it('should handle arrays of classes', () => {
      const result = cn(['px-4', 'py-2']);
      expect(result).toBe('px-4 py-2');
    });

    it('should handle nested arrays', () => {
      const result = cn(['px-4', ['py-2', 'mx-2']]);
      expect(result).toBe('px-4 py-2 mx-2');
    });

    it('should handle empty arrays', () => {
      const result = cn([]);
      expect(result).toBe('');
    });

    it('should handle mixed arrays and strings', () => {
      const result = cn('base', ['array-class'], 'end');
      expect(result).toBe('base array-class end');
    });

    it('should handle arrays with undefined values', () => {
      const result = cn(['class1', undefined, 'class2']);
      expect(result).toBe('class1 class2');
    });
  });

  describe('object inputs', () => {
    it('should handle objects with boolean values', () => {
      const result = cn({ 'text-red-500': true, 'text-blue-500': false });
      expect(result).toBe('text-red-500');
    });

    it('should handle objects with all true values', () => {
      const result = cn({ class1: true, class2: true, class3: true });
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with all false values', () => {
      const result = cn({ class1: false, class2: false });
      expect(result).toBe('');
    });

    it('should handle empty objects', () => {
      const result = cn({});
      expect(result).toBe('');
    });

    it('should handle objects mixed with strings', () => {
      const result = cn('base', { active: true, disabled: false }, 'end');
      expect(result).toBe('base active end');
    });
  });

  describe('falsy and edge case values', () => {
    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'extra');
      expect(result).toBe('base extra');
    });

    it('should handle empty strings', () => {
      const result = cn('base', '', 'extra');
      expect(result).toBe('base extra');
    });

    it('should handle false value', () => {
      const result = cn('base', false, 'extra');
      expect(result).toBe('base extra');
    });

    it('should handle zero value', () => {
      const result = cn('base', 0, 'extra');
      expect(result).toBe('base extra');
    });

    it('should handle only falsy values', () => {
      const result = cn(null, undefined, false, '', 0);
      expect(result).toBe('');
    });

    it('should handle whitespace in class names', () => {
      const result = cn('  class1  ', 'class2');
      expect(result).toBe('class1 class2');
    });
  });

  describe('complex mixed inputs', () => {
    it('should handle complex mixed inputs', () => {
      const isActive = true;
      const isError = false;
      const result = cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        { conditional: isActive, error: isError },
        isActive && 'active-class',
        undefined,
        null,
        'final-class'
      );
      expect(result).toBe(
        'base-class array-class-1 array-class-2 conditional active-class final-class'
      );
    });

    it('should handle deeply nested structures', () => {
      const result = cn(['level1', ['level2', ['level3']]]);
      expect(result).toBe('level1 level2 level3');
    });

    it('should handle real-world button styling', () => {
      const variant = 'primary';
      const size = 'md';
      const disabled = false;
      const result = cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
        },
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        disabled && 'opacity-50 cursor-not-allowed'
      );
      expect(result).toBe(
        'inline-flex items-center justify-center rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 text-base'
      );
    });

    it('should handle real-world card styling with overrides', () => {
      const result = cn('p-4 bg-white rounded-lg shadow', 'p-6 bg-gray-50');
      expect(result).toBe('rounded-lg shadow p-6 bg-gray-50');
    });
  });
});
