import { describe, it, expect } from 'bun:test';
import * as uiComponents from '@/components/ui';

describe('UI Components barrel export (index.ts)', () => {
  describe('Button exports', () => {
    it('exports Button component', () => {
      expect(uiComponents.Button).toBeDefined();
    });
  });

  describe('Card exports', () => {
    it('exports Card component', () => {
      expect(uiComponents.Card).toBeDefined();
    });

    it('exports CardHeader component', () => {
      expect(uiComponents.CardHeader).toBeDefined();
    });

    it('exports CardTitle component', () => {
      expect(uiComponents.CardTitle).toBeDefined();
    });

    it('exports CardDescription component', () => {
      expect(uiComponents.CardDescription).toBeDefined();
    });

    it('exports CardContent component', () => {
      expect(uiComponents.CardContent).toBeDefined();
    });

    it('exports CardFooter component', () => {
      expect(uiComponents.CardFooter).toBeDefined();
    });
  });

  describe('Input exports', () => {
    it('exports Input component', () => {
      expect(uiComponents.Input).toBeDefined();
    });
  });

  describe('Badge exports', () => {
    it('exports Badge component', () => {
      expect(uiComponents.Badge).toBeDefined();
    });
  });

  describe('Skeleton exports', () => {
    it('exports Skeleton component', () => {
      expect(uiComponents.Skeleton).toBeDefined();
    });
  });

  describe('Dialog exports', () => {
    it('exports Dialog component', () => {
      expect(uiComponents.Dialog).toBeDefined();
    });

    it('exports DialogPortal component', () => {
      expect(uiComponents.DialogPortal).toBeDefined();
    });

    it('exports DialogOverlay component', () => {
      expect(uiComponents.DialogOverlay).toBeDefined();
    });

    it('exports DialogClose component', () => {
      expect(uiComponents.DialogClose).toBeDefined();
    });

    it('exports DialogTrigger component', () => {
      expect(uiComponents.DialogTrigger).toBeDefined();
    });

    it('exports DialogContent component', () => {
      expect(uiComponents.DialogContent).toBeDefined();
    });

    it('exports DialogHeader component', () => {
      expect(uiComponents.DialogHeader).toBeDefined();
    });

    it('exports DialogFooter component', () => {
      expect(uiComponents.DialogFooter).toBeDefined();
    });

    it('exports DialogTitle component', () => {
      expect(uiComponents.DialogTitle).toBeDefined();
    });

    it('exports DialogDescription component', () => {
      expect(uiComponents.DialogDescription).toBeDefined();
    });
  });

  describe('Select exports', () => {
    it('exports Select component', () => {
      expect(uiComponents.Select).toBeDefined();
    });

    it('exports SelectGroup component', () => {
      expect(uiComponents.SelectGroup).toBeDefined();
    });

    it('exports SelectValue component', () => {
      expect(uiComponents.SelectValue).toBeDefined();
    });

    it('exports SelectTrigger component', () => {
      expect(uiComponents.SelectTrigger).toBeDefined();
    });

    it('exports SelectContent component', () => {
      expect(uiComponents.SelectContent).toBeDefined();
    });

    it('exports SelectLabel component', () => {
      expect(uiComponents.SelectLabel).toBeDefined();
    });

    it('exports SelectItem component', () => {
      expect(uiComponents.SelectItem).toBeDefined();
    });

    it('exports SelectSeparator component', () => {
      expect(uiComponents.SelectSeparator).toBeDefined();
    });

    it('exports SelectScrollUpButton component', () => {
      expect(uiComponents.SelectScrollUpButton).toBeDefined();
    });

    it('exports SelectScrollDownButton component', () => {
      expect(uiComponents.SelectScrollDownButton).toBeDefined();
    });
  });

  describe('Toast exports', () => {
    it('exports ToastProvider component', () => {
      expect(uiComponents.ToastProvider).toBeDefined();
    });

    it('exports ToastViewport component', () => {
      expect(uiComponents.ToastViewport).toBeDefined();
    });

    it('exports Toast component', () => {
      expect(uiComponents.Toast).toBeDefined();
    });

    it('exports ToastTitle component', () => {
      expect(uiComponents.ToastTitle).toBeDefined();
    });

    it('exports ToastDescription component', () => {
      expect(uiComponents.ToastDescription).toBeDefined();
    });

    it('exports ToastClose component', () => {
      expect(uiComponents.ToastClose).toBeDefined();
    });

    it('exports ToastAction component', () => {
      expect(uiComponents.ToastAction).toBeDefined();
    });
  });

  describe('Collapsible exports', () => {
    it('exports Collapsible component', () => {
      expect(uiComponents.Collapsible).toBeDefined();
    });

    it('exports CollapsibleTrigger component', () => {
      expect(uiComponents.CollapsibleTrigger).toBeDefined();
    });

    it('exports CollapsibleContent component', () => {
      expect(uiComponents.CollapsibleContent).toBeDefined();
    });
  });

  describe('all exports are valid components or functions', () => {
    it('exports the correct number of components and types', () => {
      const exportedKeys = Object.keys(uiComponents);
      // 1 Button + 6 Card + 1 Input + 1 Badge + 1 Skeleton + 10 Dialog + 10 Select + 7 Toast + 3 Collapsible + 1 OptimizedImage = 41 exports
      expect(exportedKeys.length).toBe(41);
    });
  });
});
