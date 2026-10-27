import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { SiteJsonLd, buildSiteJsonLd, PUBLISHER_SAME_AS } from '@/components/seo/site-json-ld';

afterEach(() => {
  cleanup();
});

const appUrl = 'https://knowyouremoji.com';
const appName = 'KnowYourEmoji';
const description = 'What emojis actually mean in real conversations.';

describe('buildSiteJsonLd', () => {
  it('emits an Organization and a WebSite in a single graph', () => {
    const ld = buildSiteJsonLd(appUrl, appName, description);

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@graph']).toHaveLength(2);
    expect(ld['@graph'][0]['@type']).toBe('Organization');
    expect(ld['@graph'][1]['@type']).toBe('WebSite');
  });

  it('gives the organization a stable id, logo, and first-party sameAs profile', () => {
    const ld = buildSiteJsonLd(appUrl, appName, description);
    const organization = ld['@graph'][0];

    expect(organization['@id']).toBe('https://knowyouremoji.com/#organization');
    expect(organization.name).toBe(appName);
    expect(organization.url).toBe(appUrl);
    expect(organization.description).toBe(description);
    expect(organization.logo).toEqual({
      '@type': 'ImageObject',
      url: 'https://knowyouremoji.com/logo.png',
    });
    expect(organization.image).toEqual({
      '@type': 'ImageObject',
      url: 'https://knowyouremoji.com/logo.png',
    });
    expect(organization.sameAs).toEqual([...PUBLISHER_SAME_AS]);
  });

  it('only lists sameAs profiles that are first-party and verifiable', () => {
    for (const profile of PUBLISHER_SAME_AS) {
      expect(profile.startsWith('https://')).toBe(true);
    }
  });

  it('gives the website a search action pointing at the search page', () => {
    const ld = buildSiteJsonLd(appUrl, appName, description);
    const website = ld['@graph'][1];

    expect(website['@id']).toBe('https://knowyouremoji.com/#website');
    expect(website.inLanguage).toBe('en');
    expect(website.publisher).toEqual({ '@id': 'https://knowyouremoji.com/#organization' });
    expect(website.potentialAction['@type']).toBe('SearchAction');
    expect(website.potentialAction.target.urlTemplate).toBe(
      'https://knowyouremoji.com/search?q={search_term_string}'
    );
    expect(website.potentialAction['query-input']).toBe('required name=search_term_string');
  });

  it('does not double up the trailing slash', () => {
    const ld = buildSiteJsonLd('https://knowyouremoji.com/', appName, description);
    expect(ld['@graph'][0]['@id']).toBe('https://knowyouremoji.com/#organization');
    expect(ld['@graph'][0].logo.url).toBe('https://knowyouremoji.com/logo.png');
  });
});

describe('SiteJsonLd', () => {
  it('renders a JSON-LD script tag', () => {
    render(<SiteJsonLd appUrl={appUrl} appName={appName} description={description} />);

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const parsed = JSON.parse(script!.textContent!);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toHaveLength(2);
  });
});
