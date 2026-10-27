import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import {
  SoftwareApplicationJsonLd,
  buildSoftwareApplicationJsonLd,
} from '@/components/seo/software-application-json-ld';

afterEach(() => {
  cleanup();
});

const appUrl = 'https://knowyouremoji.com';
const appName = 'KnowYourEmoji';
const description = 'Decode the hidden meaning and tone of a message containing emojis.';
const features = ['Tone detection', 'Sarcasm detection', 'Suggested reply'];

describe('buildSoftwareApplicationJsonLd', () => {
  it('builds a SoftwareApplication pointing at the interpreter', () => {
    const ld = buildSoftwareApplicationJsonLd({ appUrl, appName, description, features });

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('SoftwareApplication');
    expect(ld.name).toBe('KnowYourEmoji Emoji Interpreter');
    expect(ld.url).toBe('https://knowyouremoji.com/interpreter');
    expect(ld.description).toBe(description);
  });

  it('declares the app category, language, and feature list', () => {
    const ld = buildSoftwareApplicationJsonLd({ appUrl, appName, description, features });

    expect(ld.applicationCategory).toBe('UtilitiesApplication');
    expect(ld.operatingSystem).toBe('Any');
    expect(ld.inLanguage).toBe('en');
    expect(ld.featureList).toEqual(features);
  });

  it('advertises the free offer', () => {
    const ld = buildSoftwareApplicationJsonLd({ appUrl, appName, description, features });

    expect(ld.offers).toEqual({
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    });
  });

  it('names the publisher', () => {
    const ld = buildSoftwareApplicationJsonLd({ appUrl, appName, description, features });

    expect(ld.publisher).toEqual({
      '@type': 'Organization',
      name: 'KnowYourEmoji',
      url: 'https://knowyouremoji.com',
    });
  });

  it('does not double up the trailing slash', () => {
    const ld = buildSoftwareApplicationJsonLd({
      appUrl: 'https://knowyouremoji.com/',
      appName,
      description,
      features,
    });

    expect(ld.url).toBe('https://knowyouremoji.com/interpreter');
    expect(ld.publisher.url).toBe('https://knowyouremoji.com');
  });
});

describe('SoftwareApplicationJsonLd', () => {
  it('renders a JSON-LD script tag', () => {
    render(
      <SoftwareApplicationJsonLd
        appUrl={appUrl}
        appName={appName}
        description={description}
        features={features}
      />
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const parsed = JSON.parse(script!.textContent!);
    expect(parsed['@type']).toBe('SoftwareApplication');
  });
});
