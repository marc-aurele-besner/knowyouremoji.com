import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import {
  emojiEvents,
  comboEvents,
  interpreterEvents,
  navigationEvents,
  engagementEvents,
  errorEvents,
} from '@/lib/analytics';

// Mock sendGAEvent from @next/third-parties/google
const mockSendGAEvent = mock(() => {});
mock.module('@next/third-parties/google', () => ({
  sendGAEvent: mockSendGAEvent,
}));

describe('analytics', () => {
  beforeEach(() => {
    mockSendGAEvent.mockClear();
  });

  afterEach(() => {
    mockSendGAEvent.mockClear();
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
});
