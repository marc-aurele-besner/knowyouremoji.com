# Amazon affiliate links

How the site builds Amazon Associates links to our own books, where the tracking ID comes from,
and how to set it up. For hosting and the other environment variables, see
[`deployment.md`](./deployment.md).

## Overview

Our books (Claire Vance's _Know Your Emoji_ titles) are sold on Amazon through KDP. Every link to
them, on [`/books`](../src/app/books/page.tsx) and in the book banners across the site, is a
direct product link carrying our Associates tracking ID (the `tag` query parameter), so a sale
through the site earns the Associates commission on top of the KDP royalty.

Since we know each book's ASIN, there is no search link or Product Advertising API: the link is
always `https://www.<storefront>/dp/<ASIN>?tag=<tag>`, on the storefront closest to the visitor.

The code:

| File                                        | Role                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/amazon-affiliate.ts`               | Storefronts, country → storefront mapping, tracking IDs (`tagFor`), `amazonProductUrl`, the disclosure text and link `rel` |
| `src/lib/book-banners.ts`                   | The book catalog (`BOOKS`, one `asin` per book) and the banner variants                                                    |
| `src/app/api/geo/route.ts`                  | `GET /api/geo`: the visitor's country from Vercel's `x-vercel-ip-country` header                                           |
| `src/hooks/use-amazon-storefront.ts`        | `useAmazonStorefront`: looks the country up once and caches it                                                             |
| `src/components/books/amazon-book-link.tsx` | `AmazonBookLink`: the only component that renders an Amazon link                                                           |

## Setup

### 1. Amazon Associates account

1. Sign up at https://affiliate-program.amazon.com and note the tracking ID (for example
   `knowyouremoji-20`).
2. Add `knowyouremoji.com` to the account's website list.
3. Under **Earning by country** (OneLink), link the storefronts the site sends visitors to: CA, UK,
   DE, FR, IT, ES and NL. With that setting, one tracking ID earns on each linked storefront, so a
   single `NEXT_PUBLIC_AMZN_TAG` covers them.
4. Optional: AU, JP, IN, BR and MX are separate Associates programs that OneLink does not cover.
   Join each one you care about and set its own tracking ID (step 2). Without it, visitors there
   still get a working link to their local store, it just carries no tag.

### 2. Tracking ID in production

Set these in Vercel (Project Settings → Environment Variables) for Production, and Preview if you
want tagged links there too:

| Variable                                                                                                   | Required | Used for                                                                         |
| ---------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_AMZN_TAG`                                                                                     | Yes      | Every storefront linked with Earning by country (US, CA, GB, DE, FR, IT, ES, NL) |
| `NEXT_PUBLIC_AMZN_TAG_<CC>` (`US`, `CA`, `GB`, `DE`, `FR`, `IT`, `ES`, `NL`, `AU`, `JP`, `IN`, `BR`, `MX`) | No       | A different ID for one storefront; the only way to tag AU, JP, IN, BR and MX     |

They are `NEXT_PUBLIC_` variables, inlined into the build: **redeploy after changing them.** They
are not secrets, the tracking ID is public and appears in every link.

If no tracking ID is set, the links still work but earn nothing, and the disclosure (see
[Compliance](#compliance)) is hidden because it would not be true.

### 3. Tracking ID locally

Copy the `NEXT_PUBLIC_AMZN_TAG*` lines from `.env.example` into `.env.local`. Local and preview
links count as clicks in Associates reports, so leave them empty unless you are testing the tags.

### 4. Check it

Open `/books` on the deployed site and hover a **Get it on Amazon** button: the link should end in
`?tag=<your tag>`, and the footer should show the disclosure. Associates Central shows clicks
within a few hours.

## How a visitor gets a link

1. **Build.** `/books` and every page with a banner are rendered with amazon.com links
   (`DEFAULT_STOREFRONT`). They work with no JavaScript.
2. **Country.** In the browser, `useAmazonStorefront` calls `GET /api/geo`, which returns the
   country from Vercel's `x-vercel-ip-country` header. The answer is kept in localStorage under
   `kye_country` for 30 days, and one request is shared by every link on the page. A failed lookup
   is not cached, so it is retried on the next page.
3. **Localized link.** `AmazonBookLink` swaps the `href` to the visitor's storefront. If the
   lookup fails, the amazon.com link stays.

### Country → storefront

`storefrontFor` in `amazon-affiliate.ts`:

- A country with its own storefront where KDP sells the books uses it: US, CA, GB, DE, FR, IT, ES,
  NL, AU, JP, IN, BR, MX.
- Some nearby countries use the store their Kindle accounts are attached to:

  | Storefront    | Countries                         |
  | ------------- | --------------------------------- |
  | amazon.co.uk  | GB (and `UK`), IE, IM, JE, GG, GI |
  | amazon.de     | AT, CH, LI, LU                    |
  | amazon.fr     | MC                                |
  | amazon.it     | SM, VA                            |
  | amazon.es     | AD                                |
  | amazon.com.au | NZ                                |

- Everyone else gets amazon.com, which sells Kindle books worldwide.

KDP eBooks keep the same ASIN on every storefront, so one `asin` per book is enough. If a book is
not enabled on a storefront in KDP, its link there is a 404: keep KDP's territory rights set to
worldwide.

To add a storefront: add it to `STOREFRONTS` (domain, and `oneLink: true` only if Earning by country
covers it), add its `NEXT_PUBLIC_AMZN_TAG_<CC>` line to `storefrontTags` and `.env.example`, and
move any countries it now serves out of `NEAREST_STOREFRONT`.

### To add a book

Add it to `BOOKS` in `src/lib/book-banners.ts` with its `asin` (the 10-character ID in the
`/dp/<ASIN>` part of its Amazon URL), then any banners for it. `/books` lists every entry.

## Compliance

Amazon Associates Operating Agreement requirements. Keep them when changing a book link:

- **Disclosure.** `AMAZON_DISCLOSURE` ("As an Amazon Associate, KnowYourEmoji earns from qualifying
  purchases.") is shown in the site footer and under the book list on `/books`, whenever a tracking
  ID is configured. Book banners are also labelled "Sponsored".
- **Link attributes.** Every Amazon link goes through `AmazonBookLink`: the direct Amazon URL (no
  redirect, shortener or cloaking), `target="_blank"` and `rel="nofollow sponsored noopener"`.
  (No `noreferrer`: Amazon can see the clicks come from our registered site.)
- **No prices.** The site never shows Amazon prices, so the 24-hour price-freshness rule does not
  apply. If you add prices, they must come from the Product Advertising API and show their
  timestamp.
- **No incentives.** Do not offer anything in exchange for buying through our links, and do not
  put them in emails or ebooks (Associates links are only allowed on the registered site).
- **Privacy.** The privacy policy (section 4) mentions the country lookup and Amazon's cookies.

## Click tracking

Each click on an `AmazonBookLink` sends an `affiliate_click` event (`book`, `storefront`,
`placement`) to GA and PostHog via `engagementEvents.affiliateClick` in `src/lib/analytics.ts`.
`placement` is `books-page` or the banner variant id. Banners also keep recording their views and
clicks in the `book_banner_events` table, shown on the admin analytics page.

## Tests

- `tests/unit/lib/amazon-affiliate.test.ts`: storefront mapping, tags and overrides, URL format.
- `tests/unit/app/api/geo/route.test.ts`: country header parsing.
- `tests/unit/hooks/use-amazon-storefront.test.ts`: lookup, caching, failures.
- `tests/unit/components/books/amazon-book-link.test.tsx`: link attributes, localization, tracking.
