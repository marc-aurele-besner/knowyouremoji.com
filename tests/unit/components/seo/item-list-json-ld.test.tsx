import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { ItemListJsonLd, buildItemListJsonLd } from '@/components/seo/item-list-json-ld';

afterEach(() => {
  cleanup();
});

const items = [
  { name: '💀 Skull', url: 'https://knowyouremoji.com/emoji/skull' },
  { name: '🔥 Fire', url: 'https://knowyouremoji.com/emoji/fire' },
];

describe('buildItemListJsonLd', () => {
  it('builds an ItemList with the item count', () => {
    const ld = buildItemListJsonLd({
      name: 'Smileys & Faces Emojis',
      description: 'Face emoji meanings.',
      pageUrl: 'https://knowyouremoji.com/emoji/category/faces',
      items,
    });

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('ItemList');
    expect(ld.name).toBe('Smileys & Faces Emojis');
    expect(ld.description).toBe('Face emoji meanings.');
    expect(ld.url).toBe('https://knowyouremoji.com/emoji/category/faces');
    expect(ld.numberOfItems).toBe(2);
  });

  it('numbers the list items in display order', () => {
    const ld = buildItemListJsonLd({
      name: 'List',
      description: 'Desc',
      pageUrl: 'https://knowyouremoji.com/emoji',
      items,
    });

    expect(ld.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: '💀 Skull',
        url: 'https://knowyouremoji.com/emoji/skull',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '🔥 Fire',
        url: 'https://knowyouremoji.com/emoji/fire',
      },
    ]);
  });

  it('handles an empty list', () => {
    const ld = buildItemListJsonLd({
      name: 'Empty',
      description: 'Desc',
      pageUrl: 'https://knowyouremoji.com/emoji',
      items: [],
    });

    expect(ld.numberOfItems).toBe(0);
    expect(ld.itemListElement).toEqual([]);
  });
});

describe('ItemListJsonLd', () => {
  it('renders a JSON-LD script tag', () => {
    render(
      <ItemListJsonLd
        name="Smileys & Faces Emojis"
        description="Face emoji meanings."
        pageUrl="https://knowyouremoji.com/emoji/category/faces"
        items={items}
      />
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const parsed = JSON.parse(script!.textContent!);
    expect(parsed['@type']).toBe('ItemList');
    expect(parsed.numberOfItems).toBe(2);
  });
});
