import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import {
  emojiEvents,
  comboEvents,
  interpreterEvents,
  navigationEvents,
  engagementEvents,
  errorEvents,
  shareEvents,
  conversionEvents,
} from '@/lib/analytics';

// Mock sendGAEvent from @next/third-parties/google
const mockSendGAEvent = mock(() => {});
mock.module('@next/third-parties/google', () => ({
  sendGAEvent: mockSendGAEvent,
}));

// Mock posthog-js
const mockPostHogCapture = mock(() => {});
mock.module('posthog-js', () => ({
  default: {
    capture: mockPostHogCapture,
    init: mock(() => {}),
    identify: mock(() => {}),
    reset: mock(() => {}),
  },
}));

describe('analytics', () => {
  beforeEach(() => {
    mockSendGAEvent.mockClear();
    mockPostHogCapture.mockClear();
  });

  afterEach(() => {
    mockSendGAEvent.mockClear();
    mockPostHogCapture.mockClear();
  });

  describe('emojiEvents', () => {
    it('tracks emoji view', () => {
      emojiEvents.view('🔥', 'fire', 'travel');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'emoji_view', {
        emoji: '🔥',
        slug: 'fire',
        category: 'travel',
      });
    });

    it('tracks emoji copy', () => {
      emojiEvents.copy('😀', 'grinning-face');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'emoji_copy', {
        emoji: '😀',
        slug: 'grinning-face',
      });
    });

    it('tracks emoji search', () => {
      emojiEvents.search('fire', 5);
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'emoji_search', {
        search_term: 'fire',
        result_count: 5,
      });
    });

    it('tracks search result click', () => {
      emojiEvents.searchResultClick('🔥', 'fire', 0);
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'emoji_search_result_click', {
        emoji: '🔥',
        slug: 'fire',
        position: 0,
      });
    });

    it('tracks related emoji click', () => {
      emojiEvents.relatedClick('✨', 'sparkles', 'fire');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'related_emoji_click', {
        emoji: '✨',
        slug: 'sparkles',
        source_slug: 'fire',
      });
    });
  });

  describe('comboEvents', () => {
    it('tracks combo view', () => {
      comboEvents.view('🔥💯', 'fire-hundred');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'combo_view', {
        combo: '🔥💯',
        slug: 'fire-hundred',
      });
    });

    it('tracks combo copy', () => {
      comboEvents.copy('🔥💯', 'fire-hundred');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'combo_copy', {
        combo: '🔥💯',
        slug: 'fire-hundred',
      });
    });

    it('tracks combo click', () => {
      comboEvents.click('🔥💯', 'fire-hundred', 'homepage');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'combo_click', {
        combo: '🔥💯',
        slug: 'fire-hundred',
        source: 'homepage',
      });
    });
  });

  describe('interpreterEvents', () => {
    it('tracks interpreter submit', () => {
      interpreterEvents.submit(50, 'INSTAGRAM');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'interpreter_submit', {
        message_length: 50,
        platform: 'INSTAGRAM',
      });
    });

    it('tracks result view', () => {
      interpreterEvents.resultView(true, 75);
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'interpreter_result_view', {
        has_red_flags: true,
        passive_aggression_score: 75,
      });
    });

    it('tracks platform select', () => {
      interpreterEvents.platformSelect('SLACK');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'interpreter_platform_select', {
        platform: 'SLACK',
      });
    });

    it('tracks rate limit reached', () => {
      interpreterEvents.rateLimitReached(3);
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'interpreter_rate_limit_reached', {
        usage_count: 3,
      });
    });
  });

  describe('navigationEvents', () => {
    it('tracks category view', () => {
      navigationEvents.categoryView('faces');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'category_view', {
        category: 'faces',
      });
    });

    it('tracks category click', () => {
      navigationEvents.categoryClick('faces', 'homepage');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'category_click', {
        category: 'faces',
        source: 'homepage',
      });
    });

    it('tracks theme toggle', () => {
      navigationEvents.themeToggle('dark');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'theme_toggle', {
        theme: 'dark',
      });
    });

    it('tracks mobile nav open', () => {
      navigationEvents.mobileNavOpen();
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'mobile_nav_open', {});
    });

    it('tracks breadcrumb click', () => {
      navigationEvents.breadcrumbClick('Emojis', '/emoji', 1);
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'breadcrumb_click', {
        label: 'Emojis',
        href: '/emoji',
        position: 1,
      });
    });
  });

  describe('engagementEvents', () => {
    it('tracks external link click', () => {
      engagementEvents.externalLinkClick('https://github.com', 'GitHub');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'external_link_click', {
        url: 'https://github.com',
        link_text: 'GitHub',
      });
    });

    it('tracks scroll depth', () => {
      engagementEvents.scrollDepth(50, '/emoji/fire');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'scroll_depth', {
        depth: 50,
        page_path: '/emoji/fire',
      });
    });
  });

  describe('errorEvents', () => {
    it('tracks search no results', () => {
      errorEvents.searchNoResults('asdfghjkl');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'search_no_results', {
        search_term: 'asdfghjkl',
      });
    });

    it('tracks page not found', () => {
      errorEvents.pageNotFound('/nonexistent-page');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'page_not_found', {
        attempted_path: '/nonexistent-page',
      });
    });
  });

  describe('shareEvents', () => {
    it('tracks content share', () => {
      shareEvents.share('twitter', 'https://knowyouremoji.com/emoji/fire', 'emoji');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'content_share', {
        platform: 'twitter',
        url: 'https://knowyouremoji.com/emoji/fire',
        content_type: 'emoji',
      });
    });

    it('tracks share link copy', () => {
      shareEvents.copyLink('https://knowyouremoji.com/emoji/fire', 'emoji');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'share_link_copy', {
        url: 'https://knowyouremoji.com/emoji/fire',
        content_type: 'emoji',
      });
    });
  });

  describe('PostHog integration', () => {
    // Helper to wait for async PostHog calls to complete
    const waitForPostHog = () => new Promise((resolve) => setTimeout(resolve, 10));

    it('sends emoji copy event to PostHog', async () => {
      emojiEvents.copy('😀', 'grinning-face');
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('emoji_copy', {
        emoji: '😀',
        slug: 'grinning-face',
      });
    });

    it('sends emoji search event to PostHog', async () => {
      emojiEvents.search('fire', 5);
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('emoji_search', {
        search_term: 'fire',
        result_count: 5,
      });
    });

    it('sends combo copy event to PostHog', async () => {
      comboEvents.copy('🔥💯', 'fire-hundred');
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('combo_copy', {
        combo: '🔥💯',
        slug: 'fire-hundred',
      });
    });

    it('sends interpreter submit event to PostHog', async () => {
      interpreterEvents.submit(50, 'INSTAGRAM');
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('interpreter_submit', {
        message_length: 50,
        platform: 'INSTAGRAM',
      });
    });

    it('sends interpreter result view event to PostHog', async () => {
      interpreterEvents.resultView(true, 75);
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('interpreter_result_view', {
        has_red_flags: true,
        passive_aggression_score: 75,
      });
    });

    it('sends share link copy event to PostHog', async () => {
      shareEvents.copyLink('https://knowyouremoji.com/emoji/fire', 'emoji');
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('share_link_copy', {
        url: 'https://knowyouremoji.com/emoji/fire',
        content_type: 'emoji',
      });
    });

    it('silently catches errors when posthog.capture throws', async () => {
      mockPostHogCapture.mockImplementation(() => {
        throw new Error('PostHog not loaded');
      });

      // Should not throw
      expect(() => emojiEvents.copy('🔥', 'fire')).not.toThrow();
      await waitForPostHog();

      // Reset mock
      mockPostHogCapture.mockImplementation(() => {});
    });

    it('sends upgrade click event to PostHog', async () => {
      conversionEvents.upgradeClick('pricing_page', 'pro');
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('upgrade_click', {
        source: 'pricing_page',
        plan: 'pro',
      });
    });

    it('sends payment success event to PostHog', async () => {
      conversionEvents.paymentSuccess('pro', 9.99, 'usd');
      await waitForPostHog();
      expect(mockPostHogCapture).toHaveBeenCalledWith('payment_success', {
        plan: 'pro',
        amount: 9.99,
        currency: 'usd',
      });
    });
  });

  describe('conversionEvents', () => {
    it('tracks upgrade click', () => {
      conversionEvents.upgradeClick('pricing_page', 'pro');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'upgrade_click', {
        source: 'pricing_page',
        plan: 'pro',
      });
    });

    it('tracks upgrade modal view', () => {
      conversionEvents.upgradeModalView('rate_limit');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'upgrade_modal_view', {
        trigger: 'rate_limit',
      });
    });

    it('tracks payment success', () => {
      conversionEvents.paymentSuccess('pro', 9.99, 'usd');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'payment_success', {
        plan: 'pro',
        amount: 9.99,
        currency: 'usd',
      });
    });

    it('tracks payment failed', () => {
      conversionEvents.paymentFailed('pro', 'card_declined');
      expect(mockSendGAEvent).toHaveBeenCalledWith('event', 'payment_failed', {
        plan: 'pro',
        error_type: 'card_declined',
      });
    });
  });

  describe('error handling', () => {
    it('silently catches errors when sendGAEvent throws', () => {
      // Make sendGAEvent throw an error
      mockSendGAEvent.mockImplementation(() => {
        throw new Error('GA not loaded');
      });

      // Should not throw
      expect(() => emojiEvents.view('🔥', 'fire', 'travel')).not.toThrow();
    });

    it('logs to console.debug in development when sendGAEvent throws', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const mockDebug = mock(() => {});
      const originalDebug = console.debug;
      console.debug = mockDebug;

      // Set development environment
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

      // Make sendGAEvent throw an error
      mockSendGAEvent.mockImplementation(() => {
        throw new Error('GA not loaded');
      });

      // Trigger an event
      emojiEvents.copy('😀', 'grinning');

      // Verify console.debug was called
      expect(mockDebug).toHaveBeenCalled();

      // Restore
      console.debug = originalDebug;
      (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    });

    it('does not log to console.debug in production when sendGAEvent throws', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const mockDebug = mock(() => {});
      const originalDebug = console.debug;
      console.debug = mockDebug;

      // Set production environment
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

      // Make sendGAEvent throw an error
      mockSendGAEvent.mockImplementation(() => {
        throw new Error('GA not loaded');
      });

      // Trigger an event
      emojiEvents.search('test', 5);

      // Verify console.debug was NOT called
      expect(mockDebug).not.toHaveBeenCalled();

      // Restore
      console.debug = originalDebug;
      (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    });
  });
});
