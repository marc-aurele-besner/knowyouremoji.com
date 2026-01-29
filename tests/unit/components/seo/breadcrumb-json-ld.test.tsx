import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { BreadcrumbJsonLd, type BreadcrumbJsonLdItem } from '@/components/seo/breadcrumb-json-ld';

afterEach(() => {
  cleanup();
});

const mockAppUrl = 'https://knowyouremoji.com';

describe('BreadcrumbJsonLd', () => {
  const defaultItems: BreadcrumbJsonLdItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Emojis', href: '/emoji' },
    { name: '💀 Skull' },
  ];

  describe('rendering', () => {
    it('renders a script tag with type application/ld+json', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });

    it('renders valid JSON-LD content', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const content = script?.textContent;
      expect(content).not.toBeNull();

      // Should parse without error
      const parsed = JSON.parse(content!);
      expect(parsed).toBeDefined();
    });
  });

  describe('JSON-LD structure', () => {
    it('includes @context with schema.org', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@context']).toBe('https://schema.org');
    });

    it('uses BreadcrumbList as the main type', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@type']).toBe('BreadcrumbList');
    });

    it('includes itemListElement array', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(Array.isArray(parsed.itemListElement)).toBe(true);
      expect(parsed.itemListElement.length).toBe(3);
    });

    it('each item has correct ListItem structure', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      parsed.itemListElement.forEach((item: Record<string, unknown>) => {
        expect(item['@type']).toBe('ListItem');
        expect(item.position).toBeDefined();
        expect(typeof item.position).toBe('number');
        expect(item.name).toBeDefined();
      });
    });

    it('items with href have item property with full URL', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      // First item has href
      expect(parsed.itemListElement[0].item).toBe('https://knowyouremoji.com/');
      // Second item has href
      expect(parsed.itemListElement[1].item).toBe('https://knowyouremoji.com/emoji');
    });

    it('last item without href does not have item property', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      // Last item has no href, so should not have item property
      expect(parsed.itemListElement[2].item).toBeUndefined();
      expect(parsed.itemListElement[2].name).toBe('💀 Skull');
    });

    it('positions are 1-indexed and sequential', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement[0].position).toBe(1);
      expect(parsed.itemListElement[1].position).toBe(2);
      expect(parsed.itemListElement[2].position).toBe(3);
    });
  });

  describe('URL construction', () => {
    it('constructs full URLs from relative paths', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement[0].item).toBe('https://knowyouremoji.com/');
      expect(parsed.itemListElement[1].item).toBe('https://knowyouremoji.com/emoji');
    });

    it('handles appUrl with trailing slash', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl="https://knowyouremoji.com/" />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      // Should not have double slashes
      expect(parsed.itemListElement[0].item).toBe('https://knowyouremoji.com/');
      expect(parsed.itemListElement[1].item).toBe('https://knowyouremoji.com/emoji');
    });

    it('handles paths without leading slash', () => {
      const itemsNoSlash: BreadcrumbJsonLdItem[] = [
        { name: 'Home', href: '/' },
        { name: 'Emojis', href: 'emoji' },
      ];

      render(<BreadcrumbJsonLd items={itemsNoSlash} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement[1].item).toBe('https://knowyouremoji.com/emoji');
    });
  });

  describe('edge cases', () => {
    it('handles single item', () => {
      const singleItem: BreadcrumbJsonLdItem[] = [{ name: 'Home', href: '/' }];

      render(<BreadcrumbJsonLd items={singleItem} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement.length).toBe(1);
      expect(parsed.itemListElement[0].position).toBe(1);
    });

    it('handles empty items array', () => {
      render(<BreadcrumbJsonLd items={[]} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement).toEqual([]);
    });

    it('handles items with special characters in name', () => {
      const specialItems: BreadcrumbJsonLdItem[] = [
        { name: 'Home', href: '/' },
        { name: "Emoji's & Meanings" },
      ];

      render(<BreadcrumbJsonLd items={specialItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      // Should parse without error
      const parsed = JSON.parse(script!.textContent!);
      expect(parsed.itemListElement[1].name).toBe("Emoji's & Meanings");
    });

    it('handles emoji characters in names', () => {
      const emojiItems: BreadcrumbJsonLdItem[] = [
        { name: 'Home', href: '/' },
        { name: '😀 Grinning Face' },
      ];

      render(<BreadcrumbJsonLd items={emojiItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement[1].name).toBe('😀 Grinning Face');
    });

    it('handles deep paths', () => {
      const deepItems: BreadcrumbJsonLdItem[] = [
        { name: 'Home', href: '/' },
        { name: 'Category', href: '/emoji/category' },
        { name: 'Faces', href: '/emoji/category/faces' },
        { name: '💀 Skull' },
      ];

      render(<BreadcrumbJsonLd items={deepItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement.length).toBe(4);
      expect(parsed.itemListElement[2].item).toBe('https://knowyouremoji.com/emoji/category/faces');
    });
  });

  describe('combo page integration', () => {
    it('generates correct structure for combo breadcrumbs', () => {
      const comboItems: BreadcrumbJsonLdItem[] = [
        { name: 'Home', href: '/' },
        { name: 'Combos', href: '/combo' },
        { name: '💀💀💀 Triple Skull' },
      ];

      render(<BreadcrumbJsonLd items={comboItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.itemListElement[0].name).toBe('Home');
      expect(parsed.itemListElement[1].name).toBe('Combos');
      expect(parsed.itemListElement[2].name).toBe('💀💀💀 Triple Skull');
    });
  });

  describe('SEO compliance', () => {
    it('follows Schema.org BreadcrumbList specification', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      // Required properties for BreadcrumbList
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(parsed.itemListElement).toBeDefined();

      // Each ListItem must have position and name
      parsed.itemListElement.forEach((item: Record<string, unknown>) => {
        expect(item['@type']).toBe('ListItem');
        expect(item.position).toBeDefined();
        expect(item.name).toBeDefined();
      });
    });

    it('generates Google-compliant breadcrumb markup', () => {
      render(<BreadcrumbJsonLd items={defaultItems} appUrl={mockAppUrl} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      // Google requires position to be an integer starting from 1
      expect(parsed.itemListElement[0].position).toBe(1);

      // Google requires item (URL) for all items except the last
      expect(parsed.itemListElement[0].item).toBeDefined();
      expect(parsed.itemListElement[1].item).toBeDefined();
    });
  });
});
