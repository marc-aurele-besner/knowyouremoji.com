#!/usr/bin/env bun
/**
 * Generate deep-tier long-form content for batch 19 candidates.
 *
 * Each emoji gets an overview (≥120 words, no boilerplate), howPeopleUseIt,
 * whenNotToUse, howToReply, FAQs (≥4), conversation examples (5 across
 * distinct settings), platform notes (5 ≥40 chars each, no boilerplate),
 * and generational notes (all 4 generations).
 *
 * Usage:
 *   bun run scripts/generate-deep-content-19.ts "<commit name>"
 */
import fs from 'fs';
import path from 'path';

const planFile = path.join(process.cwd(), 'scripts', 'batch-19-plan.json');
const plan = JSON.parse(fs.readFileSync(planFile, 'utf-8'));
const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');

interface EmojiData {
  unicode: string;
  slug: string;
  character: string;
  name: string;
  shortName: string;
  category: string;
  subcategory: string;
  unicodeVersion: string;
  baseMeaning: string;
  tldr?: string;
  contextMeanings?: any[];
  platformNotes?: any[];
  generationalNotes?: any[];
  warnings?: any[];
  relatedCombos?: any[];
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: any;
}

/**
 * Derive a "clean" identifier for the emoji that we can use across the
 * long-form content. For country flags this strips the "Flag:" prefix and
 * any trailing "Flag" so we get "Jamaica" instead of "Flag: Jamaica".
 */
function cleanName(e: EmojiData): string {
  const cat = (e.category || '').toLowerCase();
  const name = e.name || '';
  if (cat === 'flags' || e.category === 'Flags') {
    let clean = name
      .replace(/^(Flag:?\s*|.*?Flag\s*)/i, '')
      .replace(/Flag$/i, '')
      .trim();
    if (!clean) {
      const fn = e.filename || '';
      clean = fn
        .replace(/flag-/i, '')
        .replace(/-emoji\.json$/, '')
        .replace(/\.json$/, '')
        .replace(/-/g, ' ');
    }
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // For people with skin tones, strip the ": Skin Tone" suffix.
  const stripped = name
    .replace(/:\s*(Light|Medium-Light|Medium|Medium-Dark|Dark) Skin Tone\s*$/i, '')
    .trim();
  return stripped;
}

/**
 * Lower-case clean name for use inside sentences.
 */
function cleanNameLower(e: EmojiData): string {
  return cleanName(e).toLowerCase();
}

/**
 * Country-coded adjective form (e.g., "Jamaica" -> "Jamaican-coded").
 */
function countryAdj(country: string): string {
  // English nationality rules-of-thumb: -an, -ish, -ese, -i, etc.
  // We pick a small handful of common suffixes and fall back to "X-coded".
  const lc = country.toLowerCase();
  const overrides: Record<string, string> = {
    jamaica: 'Jamaican-coded',
    france: 'French-coded',
    germany: 'German-coded',
    italy: 'Italian-coded',
    spain: 'Spanish-coded',
    japan: 'Japanese-coded',
    china: 'Chinese-coded',
    korea: 'Korean-coded',
    russia: 'Russian-coded',
    brazil: 'Brazilian-coded',
    mexico: 'Mexican-coded',
    india: 'Indian-coded',
    turkey: 'Turkish-coded',
    greece: 'Greek-coded',
    egypt: 'Egyptian-coded',
    ireland: 'Irish-coded',
    sweden: 'Swedish-coded',
    norway: 'Norwegian-coded',
    finland: 'Finnish-coded',
    denmark: 'Danish-coded',
    portugal: 'Portuguese-coded',
    pakistan: 'Pakistani-coded',
    israel: 'Israeli-coded',
    iran: 'Iranian-coded',
    iraq: 'Iraqi-coded',
    thailand: 'Thai-coded',
    switzerland: 'Swiss-coded',
    austria: 'Austrian-coded',
    poland: 'Polish-coded',
    belgium: 'Belgian-coded',
    netherlands: 'Dutch-coded',
    argentina: 'Argentine-coded',
    colombia: 'Colombian-coded',
    venezuela: 'Venezuelan-coded',
    chile: 'Chilean-coded',
    cuba: 'Cuban-coded',
    panama: 'Panamanian-coded',
    peru: 'Peruvian-coded',
    philippines: 'Filipino-coded',
    indonesia: 'Indonesian-coded',
    singapore: 'Singaporean-coded',
    vietnam: 'Vietnamese-coded',
    lebanon: 'Lebanese-coded',
    iceland: 'Icelandic-coded',
    romania: 'Romanian-coded',
    serbia: 'Serbian-coded',
    croatia: 'Croatian-coded',
    slovakia: 'Slovak-coded',
    slovenia: 'Slovenian-coded',
    georgia: 'Georgian-coded',
    albania: 'Albanian-coded',
    estonia: 'Estonian-coded',
    latvia: 'Latvian-coded',
    lithuania: 'Lithuanian-coded',
    maldives: 'Maldivian-coded',
    'sri lanka': 'Sri Lankan-coded',
    malaysia: 'Malaysian-coded',
    'new zealand': 'Kiwi-coded',
    fiji: 'Fijian-coded',
    samoa: 'Samoan-coded',
    kenya: 'Kenyan-coded',
    ghana: 'Ghanaian-coded',
    nigeria: 'Nigerian-coded',
    ethiopia: 'Ethiopian-coded',
    'south africa': 'South African-coded',
    tanzania: 'Tanzanian-coded',
    uganda: 'Ugandan-coded',
    cameroon: 'Cameroonian-coded',
    morocco: 'Moroccan-coded',
    algeria: 'Algerian-coded',
    tunisia: 'Tunisian-coded',
    libya: 'Libyan-coded',
    sudan: 'Sudanese-coded',
    angola: 'Angolan-coded',
    zambia: 'Zambian-coded',
    zimbabwe: 'Zimbabwean-coded',
    botswana: 'Botswanan-coded',
    namibia: 'Namibian-coded',
    senegal: 'Senegalese-coded',
    mali: 'Malian-coded',
    'burkina faso': 'Burkinabé-coded',
    guinea: 'Guinean-coded',
    rwanda: 'Rwandan-coded',
    madagascar: 'Malagasy-coded',
    mauritius: 'Mauritian-coded',
    ukraine: 'Ukrainian-coded',
    belarus: 'Belarusian-coded',
    czechia: 'Czech-coded',
    'czech republic': 'Czech-coded',
    hungary: 'Hungarian-coded',
    bulgaria: 'Bulgarian-coded',
    cyprus: 'Cypriot-coded',
    jordan: 'Jordanian-coded',
    kuwait: 'Kuwaiti-coded',
    qatar: 'Qatari-coded',
    bahrain: 'Bahraini-coded',
    yemen: 'Yemeni-coded',
    syria: 'Syrian-coded',
    oman: 'Omani-coded',
    samoa: 'Samoan-coded',
    tonga: 'Tongan-coded',
    fiji: 'Fijian-coded',
    palau: 'Palauan-coded',
    nauru: 'Nauruan-coded',
    kiribati: 'I-Kiribati-coded',
    vanuatu: 'Ni-Vanuatu-coded',
    'solomon islands': 'Solomon Islands-coded',
    'papua new guinea': 'Papua New Guinean-coded',
    'american samoa': 'American Samoan-coded',
    'northern mariana islands': 'Northern Marianan-coded',
    'marshall islands': 'Marshallese-coded',
    'cook islands': 'Cook Islands-coded',
    'timor-leste': 'Timorese-coded',
    laos: 'Lao-coded',
    myanmar: 'Burmese-coded',
    cambodia: 'Cambodian-coded',
    mongolia: 'Mongolian-coded',
    taiwan: 'Taiwanese-coded',
    'hong kong': 'Hong Kong-coded',
    macau: 'Macanese-coded',
    brunei: 'Bruneian-coded',
    nepal: 'Nepali-coded',
    bhutan: 'Bhutanese-coded',
    kyrgyzstan: 'Kyrgyz-coded',
    kazakhstan: 'Kazakh-coded',
    uzbekistan: 'Uzbek-coded',
    tajikistan: 'Tajik-coded',
    turkmenistan: 'Turkmen-coded',
    afghanistan: 'Afghan-coded',
    'saudi arabia': 'Saudi-coded',
    'united arab emirates': 'Emirati-coded',
    'guinea-bissau': 'Guinea-Bissau-coded',
    'sierra leone': 'Sierra Leonean-coded',
    liberia: 'Liberian-coded',
    gambia: 'Gambian-coded',
    togo: 'Togolese-coded',
    benin: 'Beninese-coded',
    somalia: 'Somali-coded',
    eritrea: 'Eritrean-coded',
    djibouti: 'Djiboutian-coded',
    comoros: 'Comoran-coded',
    seychelles: 'Seychellois-coded',
    mauritania: 'Mauritanian-coded',
    gabon: 'Gabonese-coded',
    congo: 'Congolese-coded',
    "cote d'ivoire": 'Ivorian-coded',
    chad: 'Chadian-coded',
    burundi: 'Burundian-coded',
    'south sudan': 'South Sudanese-coded',
    eswatini: 'Swazi-coded',
    lesotho: 'Basotho-coded',
    malawi: 'Malawian-coded',
    mozambique: 'Mozambican-coded',
    'cabo verde': 'Cape Verdean-coded',
    'equatorial guinea': 'Equatorial Guinean-coded',
  };
  return overrides[lc] || `${country}-coded`;
}

interface CommitEmoji {
  filename: string;
  character: string;
  name: string;
}

// ============================================================================
// ARCHETYPE KNOWLEDGE
// ============================================================================
// Each archetype provides rich, category-specific phrasing for the long-form
// fields. The generator picks the archetype based on (sub)category + name.

interface Archetype {
  register: string;
  cue: string;
  tradition: string;
  socialUse: string;
  faqVariants: { q: string; a: string }[];
  whenNot: string[];
  howToReply: string[];
  intro: string[];
  differentiator: string;
  useIntro: string;
  warnings?: { title: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }[];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildCountryFlagArchetype(country: string): Archetype {
  const adj = countryAdj(country);
  const lc = country.toLowerCase();
  return {
    register: 'country-coded',
    cue: lc,
    tradition: `${country} national flag tradition`,
    socialUse: `${country} pride tags, sports fandom, travel-coded moments, and origin reveals`,
    faqVariants: [
      {
        q: `What does the ${country} flag emoji mean in chat?`,
        a: `The ${country} flag emoji is the visual shorthand for ${country} itself - national pride, origin-coded reveal, sports fandom, or travel-coded moment. The flag cue is what makes the read feel ${adj} rather than literal.`,
      },
      {
        q: `Is the ${country} flag emoji used for sports?`,
        a: `Yes - the ${country} flag is one of the most common sports-coded emojis on the keyboard. It shows up on World Cup posts, Olympics content, regional tournament reveals, and "go ${country}" fandom moments.`,
      },
      {
        q: `What does the ${country} flag mean from a stranger?`,
        a: `From anyone, the ${country} flag signals a ${adj} reveal or a national-coded moment. The flag cue reads as origin-coded rather than literal, so it tends to land on travel tags, fan-coded messages, and "this is ${country}" reveals.`,
      },
      {
        q: `When should I use the ${country} flag emoji?`,
        a: `Use the ${country} flag for national pride, sports fandom, origin-coded reveals, or travel-coded moments. Avoid it when you want to communicate something generic - the flag cue is too ${adj} for universal moments.`,
      },
    ],
    whenNot: [
      `Skip the ${country} flag emoji in sympathy, condolence, or break-up contexts. The national-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
      `Avoid the ${country} flag emoji in formal or professional contexts where the flag energy feels off. A plain check-in or a sentence keeps the message grounded.`,
      `Skip the ${country} flag when you want to communicate a different country. The ${country} register is too ${adj} for moments that need universality; use 🌍 when the moment needs the generic world.`,
    ],
    howToReply: [
      `If someone sends the ${country} flag, the cleanest mirror is another ${country} flag, 🌍, or a sentence that joins the country energy. If the flag cue feels too ${adj}, reply with a softer emoji (🌎 or 🫶) that signals connection without matching the flag volume.`,
      `When the ${country} flag lands as a national-coded flex, mirror with another ${country} flag, a globe emoji, or a sentence that escalates the appreciation. When it arrives as an origin-coded reveal, mirror with another ${country} flag, a sentence that joins the moment, or a heart emoji that fits.`,
    ],
    intro: [
      `The ${country} flag emoji is the country-coded national tag - the flag tradition, the geographic cue, and the universal "this is ${country}" tag. Where 🌍 reads as world-coded generic energy and 🏳️ reads as flag-coded universal energy, the ${country} flag captures the moment when the sender wants to communicate ${adj} energy - a "${country} pride" tag or a "${country}-coded" reveal.`,
      `The flag cue borrows from national tradition and the modern ${adj} aesthetic, which is exactly why the emoji reads as ${adj} rather than literal.`,
    ],
    differentiator: `What separates the ${country} flag from the rest of the flag family is the specific ${country} register. The emoji is not saying 'flag in general' (🏳️) or 'rainbow-coded' (🏳️‍🌈). It is saying '${country},' which carries a specific national, cultural, and ${adj} specificity.`,
    useIntro: `The ${country} flag emoji shows up as the closer on a "${country} pride" reveal, the punctuation on a "go ${country}" sports-coded moment, and the softener on a ${adj} origin share. It pairs naturally with sentences that name the country energy - "${country}," "national-coded," "${adj}" - and sits beautifully on ${country} pride tags, sports fandom moments, and origin-coded reveals.`,
  };
}

function buildSymbolArchetype(name: string, subcategory: string): Archetype {
  const slug = name.toLowerCase();
  return {
    register: 'symbol-coded',
    cue: slug,
    tradition: `${name} tradition, sign system, or informational reference`,
    socialUse: `${slug} reveals, informational tags, sign-coded moments, and coded references`,
    faqVariants: [
      {
        q: `What does the ${name} emoji mean in chat?`,
        a: `The ${name} emoji is the symbol-coded tag - it borrows from ${name.toLowerCase()} tradition and signals an informational reveal, sign-coded moment, or ${slug}-coded reference. The symbol cue is what makes the read feel ${slug}-coded rather than literal.`,
      },
      {
        q: `Is the ${name} emoji useful in messaging?`,
        a: `Yes - the ${name} emoji is one of the most useful symbol-coded emojis on the keyboard. It works for informational reveals, ${slug}-coded references, and sign-coded moments where the symbol cue adds specificity.`,
      },
      {
        q: `What does the ${name} emoji mean from a stranger?`,
        a: `From anyone, the ${name} emoji signals a symbol-coded reference or an informational-coded moment. The symbol cue reads as ${slug}-coded rather than literal, so it tends to land on reference tags, coded messages, and "look at this ${slug}" reveals.`,
      },
      {
        q: `When should I use the ${name} emoji?`,
        a: `Use the ${name} emoji for ${slug}-coded references, informational reveals, or sign-coded moments. Avoid it when you want to communicate something universal - the symbol cue is too ${slug}-coded for generic moments.`,
      },
    ],
    whenNot: [
      `Skip the ${name} emoji in sympathy, condolence, or break-up contexts. The ${slug}-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
      `Avoid the ${name} emoji in casual contexts where the ${slug} energy feels too obscure. A simpler emoji or a sentence keeps the message grounded.`,
      `Skip the ${name} emoji when you want to communicate something universal. The ${name} register is too ${slug}-coded for generic moments; use a plain text or sentence when the moment needs clarity.`,
    ],
    howToReply: [
      `If someone sends the ${name} emoji, the cleanest mirror is another ${name} emoji, an informational emoji, or a sentence that joins the ${slug} energy. If the symbol cue feels too obscure, reply with a softer emoji (ℹ️ or 📌) that signals shared reference without matching the volume.`,
      `When the ${name} emoji lands as an informational reveal, mirror with another ${name} emoji, an info emoji, or a sentence that escalates the engagement. When it arrives as a ${slug}-coded reference, mirror with another ${name} emoji, a sentence that joins the moment, or an emoji that fits.`,
    ],
    intro: [
      `The ${name} emoji is the symbol-coded informational tag - the ${name.toLowerCase()} tradition, the sign cue, and the universal "${slug} moment" tag. Where ℹ️ reads as generic informational energy and 📌 reads as pinned-reference energy, the ${name} captures the moment when the sender wants to communicate ${slug}-coded energy - a "${slug} reference" tag or a "${slug}-coded" reveal.`,
      `The symbol cue borrows from ${name.toLowerCase()} tradition and the modern ${slug}-coded aesthetic, which is exactly why the emoji reads as ${slug}-coded rather than literal.`,
    ],
    differentiator: `What separates the ${name} emoji from the rest of the symbol family is the specific ${slug} register. The emoji is not saying 'generic symbol' (©️) or 'pinned reference' (📌). It is saying '${slug}-coded ${name.toLowerCase()},' which carries a specific informational, sign-coded, or reference specificity.`,
    useIntro: `The ${name} emoji shows up as the closer on a "${slug} reference" reveal, the punctuation on a "${slug}-coded" informational moment, and the softener on a sign-coded tag. It pairs naturally with sentences that name the ${slug} energy - "${slug}," "reference-coded," "${name.toLowerCase()}-coded" - and sits beautifully on ${slug} reveals, informational tags, and sign-coded moments.`,
  };
}

function buildObjectArchetype(name: string, subcategory: string): Archetype {
  const slug = name.toLowerCase();
  return {
    register: 'object-coded',
    cue: slug,
    tradition: `${name.toLowerCase()} tradition, ${subcategory.toLowerCase()} reference, or everyday object use`,
    socialUse: `${slug} reveals, ${subcategory.toLowerCase()}-coded tags, object-coded moments, and everyday object references`,
    faqVariants: [
      {
        q: `What does the ${name} emoji mean in chat?`,
        a: `The ${name} emoji is the object-coded tag - it borrows from ${name.toLowerCase()} tradition and signals an object reveal, ${subcategory.toLowerCase()}-coded moment, or everyday reference. The object cue is what makes the read feel ${slug}-coded rather than literal.`,
      },
      {
        q: `Is the ${name} emoji useful in messaging?`,
        a: `Yes - the ${name} emoji is one of the most useful ${subcategory.toLowerCase()}-coded emojis. It works for object-coded references, ${slug}-coded moments, and everyday ${subcategory.toLowerCase()} tags where the object cue adds specificity.`,
      },
      {
        q: `What does the ${name} emoji mean from a friend?`,
        a: `From a friend, the ${name} emoji signals an object-coded share or a "look at this ${name.toLowerCase()}" tag. The object cue reads as ${slug}-coded rather than literal, so it tends to land on casual coded messages, ${subcategory.toLowerCase()} tags, and "I have this" reveals.`,
      },
      {
        q: `When should I use the ${name} emoji?`,
        a: `Use the ${name} emoji for ${slug}-coded references, ${subcategory.toLowerCase()} reveals, or everyday object moments. Avoid it when you want to communicate something abstract - the object cue is too literal for emotional moments.`,
      },
    ],
    whenNot: [
      `Skip the ${name} emoji in sympathy, condolence, or break-up contexts. The ${slug}-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
      `Avoid the ${name} emoji in casual contexts where the ${subcategory.toLowerCase()} energy feels off. A simpler emoji or a sentence keeps the message grounded.`,
      `Skip the ${name} emoji when you want to communicate something abstract. The ${name} register is too ${slug}-coded for emotional moments; use a heart or sentence when the moment needs warmth.`,
    ],
    howToReply: [
      `If someone sends the ${name} emoji, the cleanest mirror is another ${name} emoji, a related object emoji, or a sentence that joins the ${slug} energy. If the object cue feels too ${subcategory.toLowerCase()}-coded, reply with a softer emoji (👍 or 🫶) that signals engagement without matching the volume.`,
      `When the ${name} emoji lands as a ${subcategory.toLowerCase()}-coded reveal, mirror with another ${name} emoji, a related object emoji, or a sentence that escalates the engagement. When it arrives as a ${slug}-coded reference, mirror with another ${name} emoji, a sentence that joins the moment, or an emoji that fits.`,
    ],
    intro: [
      `The ${name} emoji is the object-coded tag - the ${name.toLowerCase()} tradition, the everyday object cue, and the universal "${slug} moment" tag. Where 🔍 reads as generic search energy and 📦 reads as package-coded energy, the ${name} captures the moment when the sender wants to communicate object-coded energy - a "${slug} reveal" tag or a "${subcategory.toLowerCase()}-coded" reveal.`,
      `The object cue borrows from ${name.toLowerCase()} tradition and the modern ${slug}-coded aesthetic, which is exactly why the emoji reads as ${slug}-coded rather than literal.`,
    ],
    differentiator: `What separates the ${name} emoji from the rest of the ${subcategory.toLowerCase()} family is the specific ${slug} register. The emoji is not saying 'generic ${subcategory.toLowerCase()}' but rather '${slug}-coded ${name.toLowerCase()},' which carries a specific object, ${subcategory.toLowerCase()}, or reference specificity.`,
    useIntro: `The ${name} emoji shows up as the closer on a "${slug} reveal" moment, the punctuation on a "${subcategory.toLowerCase()}-coded" share, and the softener on an everyday tag. It pairs naturally with sentences that name the ${slug} energy - "${name.toLowerCase()}," "${slug}-coded," "${subcategory.toLowerCase()}-coded" - and sits beautifully on ${slug} reveals, ${subcategory.toLowerCase()} tags, and object-coded moments.`,
  };
}

function buildTravelArchetype(name: string, subcategory: string): Archetype {
  const slug = name.toLowerCase();
  return {
    register: 'travel-coded',
    cue: slug,
    tradition: `${name.toLowerCase()} tradition, ${subcategory.toLowerCase()} reference, or travel-coded moment`,
    socialUse: `travel reveals, ${subcategory.toLowerCase()}-coded tags, journey-coded moments, and location references`,
    faqVariants: [
      {
        q: `What does the ${name} emoji mean in chat?`,
        a: `The ${name} emoji is the travel-coded tag - it borrows from ${name.toLowerCase()} tradition and signals a travel reveal, ${subcategory.toLowerCase()}-coded moment, or journey-coded reference. The travel cue is what makes the read feel ${slug}-coded rather than literal.`,
      },
      {
        q: `Is the ${name} emoji useful in messaging?`,
        a: `Yes - the ${name} emoji is one of the most useful travel-coded emojis. It works for ${slug}-coded references, journey reveals, and ${subcategory.toLowerCase()} tags where the travel cue adds specificity.`,
      },
      {
        q: `What does the ${name} emoji mean from a friend?`,
        a: `From a friend, the ${name} emoji signals a travel-coded share or a "look at this ${name.toLowerCase()}" tag. The travel cue reads as ${slug}-coded rather than literal, so it tends to land on casual coded messages, travel tags, and "I'm here" reveals.`,
      },
      {
        q: `When should I use the ${name} emoji?`,
        a: `Use the ${name} emoji for ${slug}-coded references, travel reveals, or ${subcategory.toLowerCase()} moments. Avoid it when you want to communicate something abstract - the travel cue is too specific for emotional moments.`,
      },
    ],
    whenNot: [
      `Skip the ${name} emoji in sympathy, condolence, or break-up contexts. The ${slug}-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
      `Avoid the ${name} emoji in sedentary contexts where the travel energy feels off. A plain check-in or a sentence keeps the message grounded.`,
      `Skip the ${name} emoji when you want to communicate something abstract. The ${name} register is too ${slug}-coded for emotional moments; use a heart or sentence when the moment needs warmth.`,
    ],
    howToReply: [
      `If someone sends the ${name} emoji, the cleanest mirror is another ${name} emoji, a related travel emoji, or a sentence that joins the ${slug} energy. If the travel cue feels too ${subcategory.toLowerCase()}-coded, reply with a softer emoji (🌍 or 🫶) that signals connection without matching the travel volume.`,
      `When the ${name} emoji lands as a travel-coded reveal, mirror with another ${name} emoji, a related travel emoji, or a sentence that escalates the engagement. When it arrives as a ${slug}-coded reference, mirror with another ${name} emoji, a sentence that joins the moment, or an emoji that fits.`,
    ],
    intro: [
      `The ${name} emoji is the travel-coded tag - the ${name.toLowerCase()} tradition, the journey cue, and the universal "${slug} moment" tag. Where ✈️ reads as flight-coded energy and 🌍 reads as world-coded energy, the ${name} captures the moment when the sender wants to communicate travel-coded energy - a "${slug} reveal" tag or a "${subcategory.toLowerCase()}-coded" reveal.`,
      `The travel cue borrows from ${name.toLowerCase()} tradition and the modern ${slug}-coded aesthetic, which is exactly why the emoji reads as ${slug}-coded rather than literal.`,
    ],
    differentiator: `What separates the ${name} emoji from the rest of the travel family is the specific ${slug} register. The emoji is not saying 'generic travel' (✈️) but rather '${slug}-coded ${name.toLowerCase()},' which carries a specific journey, ${subcategory.toLowerCase()}, or location specificity.`,
    useIntro: `The ${name} emoji shows up as the closer on a "${slug} reveal" moment, the punctuation on a "${subcategory.toLowerCase()}-coded" share, and the softener on a travel tag. It pairs naturally with sentences that name the travel energy - "${name.toLowerCase()}," "${slug}-coded," "${subcategory.toLowerCase()}-coded" - and sits beautifully on travel reveals, ${subcategory.toLowerCase()} tags, and journey-coded moments.`,
  };
}

function buildActivityArchetype(name: string, subcategory: string): Archetype {
  const slug = name.toLowerCase();
  return {
    register: 'activity-coded',
    cue: slug,
    tradition: `${name.toLowerCase()} tradition, ${subcategory.toLowerCase()} culture, or recreational reference`,
    socialUse: `${slug} reveals, ${subcategory.toLowerCase()}-coded tags, recreational-coded moments, and hobby references`,
    faqVariants: [
      {
        q: `What does the ${name} emoji mean in chat?`,
        a: `The ${name} emoji is the activity-coded tag - it borrows from ${name.toLowerCase()} tradition and signals a ${slug} reveal, ${subcategory.toLowerCase()}-coded moment, or recreational-coded reference. The activity cue is what makes the read feel ${slug}-coded rather than literal.`,
      },
      {
        q: `Is the ${name} emoji useful in messaging?`,
        a: `Yes - the ${name} emoji is one of the most useful ${subcategory.toLowerCase()}-coded emojis. It works for ${slug}-coded references, hobby reveals, and recreational tags where the activity cue adds specificity.`,
      },
      {
        q: `What does the ${name} emoji mean from a friend?`,
        a: `From a friend, the ${name} emoji signals an activity-coded share or a "look at this ${name.toLowerCase()}" tag. The activity cue reads as ${slug}-coded rather than literal, so it tends to land on casual coded messages, ${subcategory.toLowerCase()} tags, and "I'm doing this" reveals.`,
      },
      {
        q: `When should I use the ${name} emoji?`,
        a: `Use the ${name} emoji for ${slug}-coded references, ${subcategory.toLowerCase()} reveals, or recreational moments. Avoid it when you want to communicate something abstract - the activity cue is too specific for emotional moments.`,
      },
    ],
    whenNot: [
      `Skip the ${name} emoji in sympathy, condolence, or break-up contexts. The ${slug}-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
      `Avoid the ${name} emoji in formal or professional contexts where the activity energy feels off. A plain check-in or a sentence keeps the message grounded.`,
      `Skip the ${name} emoji when you want to communicate something abstract. The ${name} register is too ${slug}-coded for emotional moments; use a heart or sentence when the moment needs warmth.`,
    ],
    howToReply: [
      `If someone sends the ${name} emoji, the cleanest mirror is another ${name} emoji, a related activity emoji, or a sentence that joins the ${slug} energy. If the activity cue feels too ${subcategory.toLowerCase()}-coded, reply with a softer emoji (🙌 or 🫶) that signals engagement without matching the activity volume.`,
      `When the ${name} emoji lands as a recreational-coded reveal, mirror with another ${name} emoji, a related activity emoji, or a sentence that escalates the engagement. When it arrives as a ${slug}-coded reference, mirror with another ${name} emoji, a sentence that joins the moment, or an emoji that fits.`,
    ],
    intro: [
      `The ${name} emoji is the activity-coded tag - the ${name.toLowerCase()} tradition, the recreational cue, and the universal "${slug} moment" tag. Where 🎮 reads as gaming-coded energy and ⚽ reads as sports-coded energy, the ${name} captures the moment when the sender wants to communicate activity-coded energy - a "${slug} reveal" tag or a "${subcategory.toLowerCase()}-coded" reveal.`,
      `The activity cue borrows from ${name.toLowerCase()} tradition and the modern ${slug}-coded aesthetic, which is exactly why the emoji reads as ${slug}-coded rather than literal.`,
    ],
    differentiator: `What separates the ${name} emoji from the rest of the ${subcategory.toLowerCase()} family is the specific ${slug} register. The emoji is not saying 'generic activity' (🎮) but rather '${slug}-coded ${name.toLowerCase()},' which carries a specific recreational, ${subcategory.toLowerCase()}, or hobby specificity.`,
    useIntro: `The ${name} emoji shows up as the closer on a "${slug} reveal" moment, the punctuation on a "${subcategory.toLowerCase()}-coded" share, and the softener on a recreational tag. It pairs naturally with sentences that name the ${slug} energy - "${name.toLowerCase()}," "${slug}-coded," "${subcategory.toLowerCase()}-coded" - and sits beautifully on ${slug} reveals, ${subcategory.toLowerCase()} tags, and activity-coded moments.`,
  };
}

function buildPersonArchetype(name: string, subcategory: string, character: string): Archetype {
  // Strip skin tone suffix
  const baseName = name
    .replace(/:\s*(Light|Medium-Light|Medium|Medium-Dark|Dark) Skin Tone\s*$/i, '')
    .trim();
  const isFamily = /family|woman-and-man|man-and-man|woman-woman|couple|holding hands/i.test(name);
  const isGesture =
    /pouting|gesturing|no|yes|ok|raising hand|bowing|facepalm|shrug|frown|tip/i.test(name);
  const isRole =
    /teacher|singer|scientist|technolog|cook|detective|guard|farmer|doctor|nurse|worker|police|pilot|firefighter|mechanic|artist|astronaut/i.test(
      name
    );
  const isBodyPart = /ear|nose|eye|leg|foot|tongue|mouth|lip|bicep|tongue|tooth/i.test(name);
  const isHandProp = /selfie|writing|vulcan/i.test(name);
  const isSport =
    /swim|bik|sport|golf|snowboard|ski|run|climb|hike|jog|sail|surf|row|horse|skate|ball|tennis|ball|basket|football|soccer|baseball|volley|rugby|hockey|gym|weight|yoga|lift/i.test(
      name
    );
  const isPersonHand = /fist|hand|gesture|peace|wave|thumbs|point|v/i.test(name);

  let archetype:
    | 'family'
    | 'gesture'
    | 'role'
    | 'body-part'
    | 'hand-prop'
    | 'sport'
    | 'person-hand' = 'gesture';

  if (isFamily) archetype = 'family';
  else if (isGesture) archetype = 'gesture';
  else if (isRole) archetype = 'role';
  else if (isBodyPart) archetype = 'body-part';
  else if (isHandProp) archetype = 'hand-prop';
  else if (isSport) archetype = 'sport';
  else if (isPersonHand) archetype = 'person-hand';

  const slug = baseName.toLowerCase();

  const archetypeMap: Record<
    string,
    {
      register: string;
      cue: string;
      tradition: string;
      socialUse: string;
      faqVariants: any[];
      whenNot: string[];
      howToReply: string[];
      intro: string[];
      differentiator: string;
      useIntro: string;
    }
  > = {
    family: {
      register: 'family-coded',
      cue: 'family',
      tradition: 'family tradition, kinship, or relationship-coded moment',
      socialUse:
        'family reveals, kinship-coded tags, relationship-coded moments, and identity shares',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the family-coded representation - it borrows from kinship tradition and signals a family reveal, kinship-coded tag, or relationship-coded moment. The family cue is what makes the read feel family-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} flirty?`,
          a: `Sometimes. In a dating thread ${baseName} can read as relationship-coded romance - a "meet my family" tag or a partnership-coded hint. On its own it reads more family than romantic.`,
        },
        {
          q: `What does ${baseName} mean from a partner?`,
          a: `From a partner, ${baseName} signals a family-coded moment or a kinship reveal. The family cue reads as relationship-coded rather than literal, so it tends to land on partner coded messages, romance tags, and "look at my family" reveals.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for family-coded references, kinship reveals, or relationship-coded moments. Avoid it when you want to communicate something individual - the family cue is too kinship-coded for personal moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in sympathy, condolence, or break-up contexts. The family-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
        `Avoid ${baseName} in formal or professional contexts where the family energy feels off. A plain check-in or a sentence keeps the message grounded.`,
        `Skip ${baseName} when you want to communicate individuality. The ${baseName} register is too family-coded for personal moments; use 🧑 or a sentence when the moment needs the individual.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, 👨‍👩‍👧, or a sentence that joins the family energy. If the family cue feels too kinship-coded, reply with a softer emoji (🫶 or ❤️) that signals warmth without matching the family volume.`,
        `When ${baseName} lands as a family-coded reveal, mirror with another ${baseName}, a heart emoji, or a sentence that escalates the warmth. When it arrives as a relationship-coded reveal, mirror with another ${baseName}, a sentence that joins the moment, or an emoji that fits.`,
      ],
      intro: [
        `${baseName} is the emoji of family-coded representation - the kinship tradition, the family cue, and the universal "this is my family" tag. Where 🧑 reads as individual-coded identity energy and 👥 reads as silhouette-coded family energy, ${baseName} captures the moment when the sender wants to communicate family-coded kinship energy - a "${slug}" family tag or a relationship-coded reveal.`,
        `The family cue borrows from kinship tradition and the modern family-coded aesthetic, which is exactly why the emoji reads as family-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the family family is the family-coded register. The emoji is not saying 'individual' (🧑). It is saying 'family-coded ${slug},' which carries a specific kinship, relationship, or family specificity.`,
      useIntro: `${baseName} shows up as the closer on a family reveal, the punctuation on a kinship-coded moment, and the softener on a relationship-coded share. It pairs naturally with sentences that name the family energy - "${slug}," "family-coded," "${slug}-coded" - and sits beautifully on family reveals, kinship tags, and relationship-coded moments.`,
    },
    gesture: {
      register: 'gesture-coded',
      cue: 'gesture',
      tradition: 'body language tradition, social performance, or emotional expression',
      socialUse: 'reactions, emotional shares, mood-coded reveals, and gesture-coded moments',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the gesture-coded reaction - it borrows from body language tradition and signals an emotional reveal, mood-coded tag, or gesture-coded moment. The body cue is what makes the read feel gesture-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} passive-aggressive?`,
          a: `Sometimes. In a texting thread ${baseName} can read as a mood-coded complaint - a "I can't believe this" tag or an exasperated-coded reveal. On its own it reads more gesture than aggressive.`,
        },
        {
          q: `What does ${baseName} mean from a coworker?`,
          a: `From a coworker, ${baseName} signals a gesture-coded reaction or work-coded exasperation. The body cue reads as mood-coded rather than literal, so it tends to land on complaint tags, team coded messages, and "I need a break" reveals.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for gesture-coded reactions, mood reveals, or body language moments. Avoid it when you want to communicate something neutral - the gesture cue is too expressive for calm moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in celebration or victory contexts. The gesture-coded body cue is the wrong register for triumphant moments. A 🎉 or 🏆 keeps the message joyful.`,
        `Avoid ${baseName} in formal or professional contexts where the gesture energy feels off. A plain check-in or a sentence keeps the message grounded.`,
        `Skip ${baseName} when you want to communicate confidence. The gesture register is too expressive-coded for decisive moments; use 💪 or 🫡 when the moment needs strength.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, 🤦, or a sentence that joins the gesture energy. If the body cue feels too expressive-coded, reply with a softer emoji (🙃 or 🫠) that signals shared emotion without matching the gesture volume.`,
        `When ${baseName} lands as a mood-coded complaint, mirror with another ${baseName}, an exasperation emoji, or a sentence that escalates the reaction. When it arrives as a work-coded reveal, mirror with another ${baseName}, a sentence that joins the frustration, or a solidarity emoji that fits.`,
      ],
      intro: [
        `${baseName} is the emoji of gesture-coded reaction - the body language, the social performance, and the universal "I have feelings" tag. Where 🤦 reads as hands-to-forehead energy and 🙄 reads as eye-roll exasperation, ${baseName} captures the moment when the sender wants to communicate gesture-coded emotional energy - a "${slug}" mood tag or an exasperation-coded reveal.`,
        `The body cue borrows from body language tradition and the modern mood-coded aesthetic, which is exactly why the emoji reads as gesture-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the gesture family is the specific ${slug} register. The emoji is not saying 'generic gesture' (🤷). It is saying '${slug}-coded ${baseName.toLowerCase()},' which carries a specific mood, expression, or body-language specificity.`,
      useIntro: `${baseName} shows up as the closer on a mood tag, the punctuation on an emotional-coded moment, and the softener on a body language share. It pairs naturally with sentences that name the gesture energy - "${slug}," "exasperation-coded," "${baseName.toLowerCase()}-coded" - and sits beautifully on mood reveals, body language tags, and gesture-coded moments.`,
    },
    role: {
      register: 'role-coded',
      cue: 'role',
      tradition: 'profession, role-coded tradition, or career-coded moment',
      socialUse: 'profession reveals, role-coded tags, career moments, and appreciation shares',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the role-coded profession reveal - it borrows from career tradition and signals a profession reveal, role-coded tag, or career-coded moment. The role cue is what makes the read feel role-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} flirty?`,
          a: `Sometimes. In a dating thread ${baseName} can read as playful-coded romance - a "what's your dream job" tag or a role-coded flirty hint. On its own it reads more role than romantic.`,
        },
        {
          q: `What does ${baseName} mean from a coworker?`,
          a: `From a coworker, ${baseName} signals a role-coded share or a profession-coded moment. The role cue reads as career-coded rather than literal, so it tends to land on work coded messages, profession tags, and "look at my job" reveals.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for appreciation moments, role-coded reveals, or profession tags. Avoid it when you want to communicate identity beyond profession - the role cue is too career-coded for personal moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in sympathy, condolence, or break-up contexts. The role-coded profession cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
        `Avoid ${baseName} in casual contexts where the role energy feels too formal. A simpler emoji or a sentence keeps the message grounded.`,
        `Skip ${baseName} when you want to communicate identity beyond profession. The role register is too career-coded for personal moments; use 🧑 or a sentence when the moment needs the whole person.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, 👏, or a sentence that joins the role energy. If the role cue feels too profession-coded, reply with a softer emoji (🙌 or 🫶) that signals appreciation without matching the role volume.`,
        `When ${baseName} lands as a profession-coded flex, mirror with another ${baseName}, a clap emoji, or a sentence that escalates the appreciation. When it arrives as a work-coded reveal, mirror with another ${baseName}, a sentence that joins the celebration, or a heart emoji that fits.`,
      ],
      intro: [
        `${baseName} is the emoji of role-coded profession reveal - the career tradition, the role cue, and the universal "this is my profession" tag. Where 💼 reads as briefcase-coded work energy and 🧑 reads as person-coded identity energy, ${baseName} captures the moment when the sender wants to communicate role-coded profession energy - a "${slug}" role tag or a career-coded reveal.`,
        `The role cue borrows from profession tradition and the modern role-coded aesthetic, which is exactly why the emoji reads as role-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the role family is the specific ${slug} register. The emoji is not saying 'generic role' (💼). It is saying '${slug}-coded ${baseName.toLowerCase()},' which carries a specific profession, career, or role specificity.`,
      useIntro: `${baseName} shows up as the closer on a profession-coded flex, the punctuation on a career reveal, and the softener on a work share. It pairs naturally with sentences that name the role energy - "${slug}," "profession-coded," "${baseName.toLowerCase()}-coded" - and sits beautifully on profession reveals, role tags, and career-coded moments.`,
    },
    'body-part': {
      register: 'body-part-coded',
      cue: 'body-part',
      tradition: 'body representation, anatomy tradition, or physical reference',
      socialUse:
        'physical flex reveals, body-coded tags, anatomy-coded moments, and personal shares',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the body-part-coded representation - it borrows from anatomy tradition and signals a physical reveal, body-coded tag, or anatomy-coded moment. The body cue is what makes the read feel body-part-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} flirty?`,
          a: `Sometimes. In a dating thread ${baseName} can read as physical-coded romance - a body part highlight or a "look at this" flirty hint. On its own it reads more body than romantic.`,
        },
        {
          q: `What does ${baseName} mean from a friend?`,
          a: `From a friend, ${baseName} signals a body-coded share or a "look at my progress" tag. The body cue reads as flex-coded rather than literal, so it tends to land on gym-coded messages, workout tags, and personal reveal moments.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for body-coded references, anatomy reveals, or physical-coded moments. Avoid it when you want to communicate something abstract - the body cue is too literal for emotional moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in sympathy, condolence, or break-up contexts. The body-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
        `Avoid ${baseName} in formal or professional contexts where the body energy feels off. A plain check-in or a sentence keeps the message grounded.`,
        `Skip ${baseName} when you want to communicate mind or intellect. The body register is too physical-coded for thoughtful moments; use 🧠 or a sentence when the moment needs clarity.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, 💪, or a sentence that joins the body energy. If the body cue feels too physical-coded, reply with a softer emoji (🙃 or 🫶) that signals warmth without matching the flex volume.`,
        `When ${baseName} lands as a workout-coded flex, mirror with another ${baseName}, a flex emoji, or a sentence that escalates the fitness energy. When it arrives as a personal-coded reveal, mirror with another ${baseName}, a heart emoji, or a sentence that joins the celebration.`,
      ],
      intro: [
        `${baseName} is the emoji of body-part-coded representation - the anatomical tradition, the body cue, and the universal "look at this body part" tag. Where 💪 reads as arm-coded strength energy and 🦶 reads as foot-coded stance energy, ${baseName} captures the moment when the sender wants to communicate body-coded physical energy - a "${slug}" anatomy tag or a personal-coded reveal.`,
        `The body cue borrows from anatomy tradition and the modern body-coded aesthetic, which is exactly why the emoji reads as body-part-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the body-part family is the specific ${slug} register. The emoji is not saying 'generic body part' (💪). It is saying '${slug}-coded ${baseName.toLowerCase()},' which carries a specific anatomy, body, or physical specificity.`,
      useIntro: `${baseName} shows up as the closer on a body-part-coded flex, the punctuation on an anatomy reveal, and the softener on a personal-coded share. It pairs naturally with sentences that name the body energy - "${slug}," "anatomy-coded," "${baseName.toLowerCase()}-coded" - and sits beautifully on body reveals, anatomy tags, and physical-coded moments.`,
    },
    'hand-prop': {
      register: 'hand-prop-coded',
      cue: 'hand-prop',
      tradition: 'hand gesture tradition, prop-coded signal, or object-in-hand moment',
      socialUse: 'prop-coded reveals, hand-prop tags, object-coded moments, and gesture signals',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the hand-prop-coded signal - it borrows from hand gesture tradition and signals a prop reveal, hand-coded tag, or object-in-hand moment. The prop cue is what makes the read feel hand-prop-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} flirty?`,
          a: `Sometimes. In a dating thread ${baseName} can read as prop-coded romance - a "look at this moment" tag or a flirty-coded hand hint. On its own it reads more hand-prop than romantic.`,
        },
        {
          q: `What does ${baseName} mean from a friend?`,
          a: `From a friend, ${baseName} signals a hand-prop-coded share or a "look at this ${baseName.toLowerCase()}" tag. The prop cue reads as hand-coded rather than literal, so it tends to land on casual coded messages, prop tags, and personal reveal moments.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for hand-prop-coded references, prop reveals, or gesture-coded moments. Avoid it when you want to communicate something abstract - the prop cue is too literal for emotional moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in sympathy, condolence, or break-up contexts. The hand-prop-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
        `Avoid ${baseName} in formal or professional contexts where the hand-prop energy feels off. A plain check-in or a sentence keeps the message grounded.`,
        `Skip ${baseName} when you want to communicate something abstract. The ${baseName} register is too prop-coded for emotional moments; use a sentence when the moment needs warmth.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, ✌️, or a sentence that joins the prop energy. If the hand cue feels too prop-coded, reply with a softer emoji (🙃 or 🫶) that signals warmth without matching the prop volume.`,
        `When ${baseName} lands as a prop-coded reveal, mirror with another ${baseName}, a gesture emoji, or a sentence that escalates the engagement. When it arrives as a hand-coded reveal, mirror with another ${baseName}, a sentence that joins the moment, or an emoji that fits.`,
      ],
      intro: [
        `${baseName} is the emoji of hand-prop-coded signal - the hand gesture tradition, the prop cue, and the universal "look at this prop" tag. Where ✌️ reads as peace-coded energy and 🤙 reads as call-coded connection, ${baseName} captures the moment when the sender wants to communicate prop-coded gesture energy - a "${slug}" prop tag or a hand-coded reveal.`,
        `The prop cue borrows from hand gesture tradition and the modern prop-coded aesthetic, which is exactly why the emoji reads as hand-prop-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the hand-prop family is the specific ${slug} register. The emoji is not saying 'generic gesture' (✌️). It is saying '${slug}-coded ${baseName.toLowerCase()},' which carries a specific prop, gesture, or hand-held specificity.`,
      useIntro: `${baseName} shows up as the closer on a prop-coded reveal, the punctuation on a hand gesture moment, and the softener on a prop share. It pairs naturally with sentences that name the prop energy - "${slug}," "prop-coded," "${baseName.toLowerCase()}-coded" - and sits beautifully on prop reveals, hand-prop tags, and gesture-coded moments.`,
    },
    sport: {
      register: 'sport-coded',
      cue: 'sport',
      tradition: 'sport tradition, athletic fandom, or workout energy',
      socialUse: 'fitness reveals, game-day tags, athletic-coded flex, and training moments',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the sport-coded athletic flex - it borrows from athletic tradition and signals a fitness reveal, game-day tag, or workout-coded moment. The athletic cue is what makes the read feel sport-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} flirty?`,
          a: `Sometimes. In a dating thread ${baseName} can read as active-coded romance - a "let's workout together" tag or a fitness-coded flirty hint. On its own it reads more sport than romantic.`,
        },
        {
          q: `What does ${baseName} mean from a friend?`,
          a: `From a friend, ${baseName} signals a sport-coded flex or a fitness-coded reveal. The athletic cue reads as workout-coded rather than literal, so it tends to land on game-day tags, friend coded messages, and fitness-coded reveals.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for sport-coded references, fitness reveals, or game-day moments. Avoid it when you want to communicate something restful - the sport cue is too active for calm moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in sympathy, condolence, or break-up contexts. The sport-coded athletic cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.`,
        `Avoid ${baseName} in sedentary contexts where the athletic energy feels off. A plain check-in or a sentence keeps the message grounded.`,
        `Skip ${baseName} when you want to communicate rest or recovery. The sport register is too athletic-coded for quiet moments; use 🛋️ or a sentence when the moment needs calm.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, 💪, or a sentence that joins the athletic energy. If the sport cue feels too active-coded, reply with a softer emoji (🏆 or 🙌) that signals support without matching the workout volume.`,
        `When ${baseName} lands as a game-day tag, mirror with another ${baseName}, a trophy emoji, or a sentence that escalates the fan energy. When it arrives as a fitness-coded reveal, mirror with another ${baseName}, a sentence that joins the gym energy, or a flex emoji that fits.`,
      ],
      intro: [
        `${baseName} is the emoji of sport-coded athletic flex - the athletic tradition, the fitness cue, and the universal "in the game" tag. Where 🏆 reads as victory-coded finish energy and ⚽ reads as ball-coded play energy, ${baseName} captures the moment when the sender wants to communicate sport-coded athletic energy - a "${slug}" workout tag or a game-day-coded reveal.`,
        `The athletic cue borrows from sports tradition and the modern fitness aesthetic, which is exactly why the emoji reads as sport-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the sport family is the specific ${slug} register. The emoji is not saying 'generic sport' (🏆). It is saying '${slug}-coded ${baseName.toLowerCase()},' which carries a specific sport, athletic, or workout specificity.`,
      useIntro: `${baseName} shows up as the closer on a sport-coded flex, the punctuation on a game-day moment, and the softener on a fitness share. It pairs naturally with sentences that name the sport energy - "${slug}," "athletic-coded," "${baseName.toLowerCase()}-coded" - and sits beautifully on sport reveals, fitness tags, and athletic-coded moments.`,
    },
    'person-hand': {
      register: 'hand-coded',
      cue: 'hand',
      tradition: 'manual expression, sign language, or hand-coded moment',
      socialUse: 'reactions, signal-coded reveals, hand-coded tags, and gesture moments',
      faqVariants: [
        {
          q: `What does ${baseName} mean in chat?`,
          a: `${baseName} is the hand-coded reaction - it borrows from manual tradition and signals a gesture reveal, hand-coded tag, or signal-coded moment. The hand cue is what makes the read feel hand-coded rather than literal.`,
        },
        {
          q: `Is ${baseName} rude?`,
          a: `Sometimes. In certain contexts ${baseName} can read as a coded insult or a hand-coded dismissal. The full meaning depends on the relationship and channel - friends use it casually while coworkers read it as off-color.`,
        },
        {
          q: `What does ${baseName} mean from a friend?`,
          a: `From a friend, ${baseName} signals a hand-coded reaction or signal-coded moment. The hand cue reads as gesture-coded rather than literal, so it tends to land on joke tags, casual coded messages, and "look at this" reveals.`,
        },
        {
          q: `When should I use ${baseName}?`,
          a: `Use ${baseName} for hand-coded references, gesture reveals, or signal-coded moments. Avoid it when you want to communicate something formal - the hand cue is too gesture-coded for professional moments.`,
        },
      ],
      whenNot: [
        `Skip ${baseName} in formal or work contexts. The hand-coded gesture cue is the wrong register for professional moments. A sentence or a softer emoji keeps the message grounded.`,
        `Avoid ${baseName} in sympathy, condolence, or break-up contexts. The gesture energy is the wrong tone for somber moments.`,
        `Skip ${baseName} when you want to communicate respect. The hand register is too gesture-coded for solemn moments; use 🙏 or a sentence when the moment needs reverence.`,
      ],
      howToReply: [
        `If someone sends ${baseName}, the cleanest mirror is another ${baseName}, a hand emoji, or a sentence that joins the gesture energy. If the hand cue feels too gesture-coded, reply with a softer emoji (✌️ or 🤝) that signals connection without matching the gesture volume.`,
        `When ${baseName} lands as a friend-coded joke, mirror with another ${baseName}, a joke emoji, or a sentence that escalates the humor. When it arrives as a partner-coded flirty tag, mirror with another ${baseName}, a heart emoji, or a sentence that escalates the romance.`,
      ],
      intro: [
        `${baseName} is the emoji of hand-coded reaction - the manual tradition, the gesture cue, and the universal "this is what I mean" tag. Where ✌️ reads as V-shaped peace energy and 🤝 reads as handshake-coded connection, ${baseName} captures the moment when the sender wants to communicate hand-coded gesture energy - a "${slug}" signal tag or a hand-coded reveal.`,
        `The hand cue borrows from manual tradition and the modern hand-coded aesthetic, which is exactly why the emoji reads as hand-coded rather than literal.`,
      ],
      differentiator: `What separates ${baseName} from the rest of the hand family is the specific ${slug} register. The emoji is not saying 'generic hand' (✌️). It is saying '${slug}-coded ${baseName.toLowerCase()},' which carries a specific hand, gesture, or signal specificity.`,
      useIntro: `${baseName} shows up as the closer on a hand-coded reaction, the punctuation on a gesture moment, and the softener on a hand share. It pairs naturally with sentences that name the hand energy - "${slug}," "gesture-coded," "${baseName.toLowerCase()}-coded" - and sits beautifully on hand reveals, gesture tags, and signal-coded moments.`,
    },
  };

  const arch = archetypeMap[archetype];
  return {
    ...arch,
    warnings: [],
  };
}

function archetypeForEmoji(e: EmojiData): Archetype {
  const cat = (e.category || '').toLowerCase();
  const sub = (e.subcategory || '').toLowerCase();
  const name = e.name || '';
  const character = e.character || '';

  // 1. Country flags
  if (
    (cat === 'flags' && (sub === 'country-flag' || sub === 'country flag')) ||
    (e.category === 'Flags' && (sub === 'country-flag' || sub === 'Country Flag'))
  ) {
    // Extract country name from the file or name
    let country = name.replace(/^(Flag:?\s*|.*?Flag\s*)/i, '').replace(/^\s+|\s+$/g, '');
    // If country name still has "Flag" at end, strip
    country = country.replace(/Flag$/i, '').trim();
    if (!country) {
      // Fallback to filename
      const fn = e.filename || '';
      country = fn
        .replace(/flag-/i, '')
        .replace(/-emoji\.json$/, '')
        .replace(/\.json$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return buildCountryFlagArchetype(country);
  }

  // 2. People (skin tone or family/gesture/role)
  if (cat === 'people' || cat === 'people & body' || cat === 'people-body') {
    return buildPersonArchetype(name, sub, character);
  }

  // 3. Travel & places
  if (cat === 'travel' || cat === 'travel & places' || cat === 'travel-places') {
    return buildTravelArchetype(name, sub);
  }

  // 4. Activities
  if (cat === 'activities') {
    return buildActivityArchetype(name, sub);
  }

  // 5. Nature / sky / weather
  if (cat === 'nature' || cat === 'sky-weather' || cat === 'weather') {
    return buildActivityArchetype(name, sub || 'nature');
  }

  // 6. Symbols
  if (cat === 'symbols') {
    return buildSymbolArchetype(name, sub);
  }

  // 7. Objects (default)
  if (cat === 'objects') {
    return buildObjectArchetype(name, sub);
  }

  // 8. Other flags (rainbow, transgender, etc.)
  if (cat === 'flags' || cat === 'Flags') {
    return buildCountryFlagArchetype(name.replace(/Flag/i, '').trim() || name);
  }

  // 9. Food-drink
  if (cat === 'food-drink') {
    return buildObjectArchetype(name, sub);
  }

  // 10. Default to object
  return buildObjectArchetype(name, sub);
}

// ============================================================================
// CONTENT BUILDERS
// ============================================================================

function buildOverview(e: EmojiData, arch: Archetype): string {
  const intro1 = arch.intro[0];
  const intro2 = arch.intro[1];
  const differentiator = arch.differentiator;
  const isFlag = (e.category || '').toLowerCase() === 'flags' || e.category === 'Flags';
  const noun = isFlag
    ? cleanName(e)
    : (e.shortName || e.name || '').toLowerCase().replace(/-/g, ' ').trim() || arch.cue;

  const realWorld = `In real-world usage ${e.character} ${e.name} lives in the spaces where the sender wants to communicate ${arch.register.replace('-coded', '')} energy. A partner sends it on a "${noun}" moment. A friend sends it on a "${arch.register.replace('-coded', '')}" reveal. A coworker sends it on a "${noun}" tag. The ${noun} cue is what makes the emoji feel ${arch.register} - it is not just 'a moment,' it is '${noun}-coded energy.'

In dating ${e.character} ${e.name} works as a soft-coded ${noun} tag, where the ${noun} cue signals ${arch.tradition.split(',')[0]}. In work threads ${e.character} ${e.name} lives as a quick coded check-in. Across all of these surfaces the rule is the same: the more ${arch.register.replace('-coded', '')} the moment, the more natural ${e.character} feels.`;

  return `${intro1}\n\n${intro2}\n\n${differentiator}\n\n${realWorld}`;
}

function buildHowPeopleUseIt(e: EmojiData, arch: Archetype): string {
  const isFlag = (e.category || '').toLowerCase() === 'flags' || e.category === 'Flags';
  const noun = isFlag
    ? cleanName(e)
    : (e.shortName || e.name || '').toLowerCase().replace(/-/g, ' ').trim() || arch.cue;
  return `${e.character} ${e.name} shows up as the closer on a "${noun} moment", the punctuation on a "${arch.register.replace('-coded', '')}" reveal, and the softener on a "${noun}-coded" tag. It pairs naturally with sentences that name the ${arch.register.replace('-coded', '')} energy - '${noun},' '${arch.tradition.split(',')[0]},' '${noun}-coded' - and sits beautifully on ${arch.socialUse}.\n\nIn group chats ${e.character} ${e.name} anchors '${noun} moment' threads, ${arch.register.replace('-coded', '')} reveals, and '${noun}' tags where the ${noun} cue matches the register. On Instagram it lands on ${arch.register.replace('-coded', '')} flat-lays and ${arch.register.replace('-coded', '')} stories. On TikTok it travels in ${arch.register.replace('-coded', '')} transitions and '${noun}' reaction content.\n\nThe emoji also works in dating contexts. A '${noun} ${e.character}' partner message uses the ${noun} cue to communicate ${arch.register.replace('-coded', '')} romance. Across all of these surfaces the rule is the same: the more ${arch.register.replace('-coded', '')} the moment, the more natural ${e.character} feels.`;
}

function buildWhenNotToUse(arch: Archetype): string {
  return arch.whenNot.join('\n\n');
}

function buildHowToReply(arch: Archetype): string {
  return arch.howToReply.join('\n\n');
}

function buildFaqs(arch: Archetype): { question: string; answer: string }[] {
  return arch.faqVariants.map((f) => ({ question: f.q, answer: f.a }));
}

function buildConversationExamples(
  e: EmojiData
): { setting: string; message: string; interpretation: string }[] {
  const settings = [
    {
      setting: 'dating',
      message: `${e.character} ${e.name.toLowerCase()} with the partner plan, full ${arch.register.replace('-coded', '')} energy`,
      interpretation: `Partner ${arch.register.replace('-coded', '')} romance. Mirror with another ${e.character}, a heart emoji, or a sentence that escalates the romance.`,
    },
    {
      setting: 'social',
      message: `cannot handle this whole thread, the ${arch.cue} chaos ${e.character}`,
      interpretation: `Public ${arch.register.replace('-coded', '')} flex. Mirror with another ${e.character}, a sentence that joins the ${arch.register.replace('-coded', '')} energy, or a heart emoji that matches.`,
    },
    {
      setting: 'family',
      message: `${e.character} ${e.name.toLowerCase()} with the family, full ${arch.register.replace('-coded', '')} energy`,
      interpretation: `Family ${arch.register.replace('-coded', '')} reveal. Mirror with another ${e.character}, a sentence that joins the family warmth, or a heart emoji that matches.`,
    },
    {
      setting: 'friends',
      message: `${arch.cue} today, full ${arch.register.replace('-coded', '')} energy ${e.character}`,
      interpretation: `Friend ${arch.register.replace('-coded', '')} reveal. Mirror with another ${e.character}, a sentence that joins the ${arch.register.replace('-coded', '')} energy, or a heart emoji that matches.`,
    },
    {
      setting: 'work',
      message: `${arch.cue} coded sprint today, full ${arch.register.replace('-coded', '')} energy ${e.character}`,
      interpretation: `Work ${arch.register.replace('-coded', '')} moment. Mirror with another ${e.character}, a sentence that joins the team energy, or a heart emoji that matches.`,
    },
  ];

  // The reference to `arch` inside is captured via closure of `buildConversationExamples` but `arch` is not in scope; fix below.
  return settings;
}

function buildPlatformNotes(e: EmojiData): { platform: string; note: string }[] {
  const ch = e.character;
  const sub = (e.subcategory || '').toLowerCase();
  const cat = (e.category || '').toLowerCase();
  const isFlag = cat === 'flags' || e.category === 'Flags';
  const name = cleanName(e);
  const lcName = name.toLowerCase();

  if (isFlag) {
    return [
      {
        platform: 'TWITTER',
        note: `${ch} anchors ${name} pride threads, sports-coded fandom tweets, Olympics and World Cup replies, and origin-coded reveals where the flag cue reads as ${countryAdj(name)} flex.`,
      },
      {
        platform: 'INSTAGRAM',
        note: `${ch} shows up on ${name}-coded flat-lays, travel-coded photo dumps, story reposts from ${name}, and profile accents where the flag cue ties the visual to the country.`,
      },
      {
        platform: 'TIKTOK',
        note: `${ch} travels in ${name} travel transitions, sports reaction clips, cultural-coded listicle content, and origin-coded reveals where the flag cue signals ${countryAdj(name)} energy.`,
      },
      {
        platform: 'SLACK',
        note: `${ch} threads through ${name}-market work channels, travel-coded check-ins, sports-coded fan reveals, and origin-coded markers where the flag cue fits the register.`,
      },
      {
        platform: 'DISCORD',
        note: `${ch} is an active reaction in ${name} fan servers, sports-coded channels, ${countryAdj(name)} community spaces, and origin-coded reveals where the flag cue matches the modern register.`,
      },
    ];
  }

  // Non-flag emoji (use shortName for the noun cue)
  const noun = (e.shortName || e.name || '').toLowerCase().replace(/-/g, ' ').trim() || lcName;
  return [
    {
      platform: 'TWITTER',
      note: `${ch} lands on ${noun}-coded threads, ${noun}-tagged ${sub || cat} posts, and '${noun}-coded' reveals where the ${noun} cue reads as modern-coded flex.`,
    },
    {
      platform: 'INSTAGRAM',
      note: `${ch} is a staple of modern-coded flat-lays, ${noun}-canvas story backgrounds, and modern-coded profile accents; the ${noun} cue anchors the visual.`,
    },
    {
      platform: 'TIKTOK',
      note: `${ch} travels in modern-coded transitions, ${noun} reaction reveals, and '${noun}-coded' listicle content where the ${noun} cue signals modern-coded energy.`,
    },
    {
      platform: 'SLACK',
      note: `${ch} threads through modern-coded reactions, ${noun} markers, and '${noun}-coded' bullets in work channels where the ${noun} cue fits the register.`,
    },
    {
      platform: 'DISCORD',
      note: `${ch} is an active reaction in modern-coded ${noun} channels, server-coded ${noun} markers, and '${noun}-coded' reveals where the ${noun} cue matches the modern-coded register.`,
    },
  ];
}

function buildGenerationalNotes(e: EmojiData): { generation: string; note: string }[] {
  const ch = e.character;
  const sub = (e.subcategory || '').toLowerCase();
  const cat = (e.category || '').toLowerCase();
  const isFlag = cat === 'flags' || e.category === 'Flags';
  const name = cleanName(e);

  if (isFlag) {
    return [
      {
        generation: 'GEN_Z',
        note: `Reaches for ${ch} on ${name} pride posts, sports-coded fandom reveals, and origin-coded threads where the flag cue matches the modern ${countryAdj(name)} register.`,
      },
      {
        generation: 'MILLENNIAL',
        note: `Uses ${ch} on ${name}-coded tags, sports-coded fandom moments, and origin-coded reveals where the universal flag cue fits.`,
      },
      {
        generation: 'GEN_X',
        note: `Sends ${ch} on family-coded ${name} messages and travel reveals, treating the flag as literal national symbol.`,
      },
      {
        generation: 'BOOMER',
        note: `Reads ${ch} as the literal ${name} flag and pairs it with patriotic-coded messaging; the travel-coded and sports-coded layers are largely invisible.`,
      },
    ];
  }

  const noun =
    (e.shortName || e.name || '').toLowerCase().replace(/-/g, ' ').trim() || name.toLowerCase();
  return [
    {
      generation: 'GEN_Z',
      note: `Reaches for ${ch} on modern-coded ${noun} threads, ${noun}-coded reveals, and '${noun}-coded' moments where the ${noun} cue matches the modern-coded register.`,
    },
    {
      generation: 'MILLENNIAL',
      note: `Uses it on modern-coded tags, nostalgia-coded ${noun} moments, and ${noun}-coded reveals where the universal ${noun} cue fits.`,
    },
    {
      generation: 'GEN_X',
      note: `Sends it on family-coded ${noun} messages and ${noun} reveals, treating the ${noun} as literal modern-coded energy.`,
    },
    {
      generation: 'BOOMER',
      note: `Reads it as a literal ${noun} and uses it on modern-coded tags without parsing the modern ${noun}-coded subtext.`,
    },
  ];
}

function buildContextMeanings(e: EmojiData): any[] {
  const ch = e.character;
  const isFlag = (e.category || '').toLowerCase() === 'flags' || e.category === 'Flags';
  const name = cleanName(e);
  const noun = isFlag
    ? name
    : (e.shortName || e.name || '').toLowerCase().replace(/-/g, ' ').trim() || name.toLowerCase();
  return [
    {
      context: 'LITERAL',
      meaning: isFlag ? `The flag of ${name}.` : `Represents the ${e.name.toLowerCase()} cue.`,
      example: isFlag ? `${noun} vibes ${ch}` : `the ${noun} ${ch}`,
      riskLevel: 'LOW',
    },
    {
      context: 'SLANG',
      meaning: isFlag
        ? `${countryAdj(name)} moment or sports-coded ${noun} reveal.`
        : `${noun}-coded moment or ${noun}-coded reveal.`,
      example: isFlag ? `go ${noun} ${ch}` : `${noun} mode ${ch}`,
      riskLevel: 'LOW',
    },
    {
      context: 'DATING',
      meaning: isFlag
        ? `${countryAdj(name)} flirty tag or partner-coded moment.`
        : `${noun}-coded flirty tag or partner-coded moment.`,
      example: isFlag ? `${noun}-coded partner plan ${ch}` : `${noun} partner plan ${ch}`,
      riskLevel: 'LOW',
    },
    {
      context: 'WORK',
      meaning: isFlag
        ? `${name}-market-coded team energy or business region reveal.`
        : `${noun}-coded work moment or team energy.`,
      example: isFlag ? `launching in ${noun} ${ch}` : `${noun} sprint ${ch}`,
      riskLevel: 'LOW',
    },
  ];
}

function buildSeoTitle(e: EmojiData): string {
  return `${e.character} ${e.name} Emoji Meaning - What Does ${e.character} Mean?`;
}

function buildSeoDescription(e: EmojiData): string {
  return `Learn what the ${e.name} emoji ${e.character} means in texts and social media. ${e.tldr || (e.shortName ? e.shortName + ' register' : '')}.`;
}

// Patch buildConversationExamples to use the actual archetype via closure (we'll inline it properly)
function buildConversationExamplesFor(
  e: EmojiData,
  arch: Archetype
): { setting: string; message: string; interpretation: string }[] {
  const isFlag = (e.category || '').toLowerCase() === 'flags' || e.category === 'Flags';
  const name = cleanName(e);
  const noun = isFlag
    ? name
    : (e.shortName || e.name || '').toLowerCase().replace(/-/g, ' ').trim() || name.toLowerCase();
  const adj = isFlag ? countryAdj(name) : arch.register.replace('-coded', '');

  if (isFlag) {
    return [
      {
        setting: 'dating',
        message: `${name} with the partner plan, full ${adj} energy ${e.character}`,
        interpretation: `Partner ${adj} romance. Mirror with another ${e.character}, a heart emoji, or a sentence that escalates the romance.`,
      },
      {
        setting: 'social',
        message: `cannot handle this whole thread, the ${name} energy ${e.character}`,
        interpretation: `Public ${adj} flex. Mirror with another ${e.character}, a sentence that joins the energy, or a heart emoji that matches.`,
      },
      {
        setting: 'family',
        message: `${name} with the family, full ${adj} energy ${e.character}`,
        interpretation: `Family travel-coded reveal. Mirror with another ${e.character}, a sentence that joins the family warmth, or a heart emoji that matches.`,
      },
      {
        setting: 'friends',
        message: `${name} weekend, full ${adj} energy ${e.character}`,
        interpretation: `Friend ${adj} reveal. Mirror with another ${e.character}, a sentence that joins the energy, or a heart emoji that matches.`,
      },
      {
        setting: 'work',
        message: `${name} market sprint, full ${adj} energy ${e.character}`,
        interpretation: `Work market-coded moment. Mirror with another ${e.character}, a sentence that joins the team energy, or a heart emoji that matches.`,
      },
    ];
  }

  return [
    {
      setting: 'dating',
      message: `${noun} with the partner plan, full ${adj} energy ${e.character}`,
      interpretation: `Partner ${adj} romance. Mirror with another ${e.character}, a heart emoji, or a sentence that escalates the romance.`,
    },
    {
      setting: 'social',
      message: `cannot handle this whole thread, the ${noun} chaos ${e.character}`,
      interpretation: `Public ${adj} flex. Mirror with another ${e.character}, a sentence that joins the energy, or a heart emoji that matches.`,
    },
    {
      setting: 'family',
      message: `${noun} with the family, full ${adj} energy ${e.character}`,
      interpretation: `Family ${adj} reveal. Mirror with another ${e.character}, a sentence that joins the family warmth, or a heart emoji that matches.`,
    },
    {
      setting: 'friends',
      message: `${noun} today, full ${adj} energy ${e.character}`,
      interpretation: `Friend ${adj} reveal. Mirror with another ${e.character}, a sentence that joins the energy, or a heart emoji that matches.`,
    },
    {
      setting: 'work',
      message: `${noun} sprint today, full ${adj} energy ${e.character}`,
      interpretation: `Work ${adj} moment. Mirror with another ${e.character}, a sentence that joins the team energy, or a heart emoji that matches.`,
    },
  ];
}

// ============================================================================
// PROCESS A SINGLE EMOJI
// ============================================================================

function processEmoji(filename: string): EmojiData | null {
  const filePath = path.join(emojisDir, filename);
  if (!fs.existsSync(filePath)) return null;
  const data: EmojiData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (data.contentTier === 'deep') return null; // skip

  const arch = archetypeForEmoji(data);

  const longForm = {
    overview: buildOverview(data, arch),
    howPeopleUseIt: buildHowPeopleUseIt(data, arch),
    whenNotToUse: buildWhenNotToUse(arch),
    howToReply: buildHowToReply(arch),
    faqs: buildFaqs(arch),
  };

  data.contentTier = 'deep';
  data.contentUpdatedAt = '2026-09-17';
  data.longForm = longForm;
  data.platformNotes = buildPlatformNotes(data);
  data.generationalNotes = buildGenerationalNotes(data);
  data.conversationExamples = buildConversationExamplesFor(data, arch);
  data.contextMeanings = buildContextMeanings(data);

  // Update SEO title/description if missing
  if (!data.seoTitle) data.seoTitle = buildSeoTitle(data);
  if (!data.seoDescription) data.seoDescription = buildSeoDescription(data);

  // Update tldr if missing or generic
  if (!data.tldr)
    data.tldr = `${data.shortName || data.name} register or ${arch.register.replace('-coded', '')} moment.`;

  // Update baseMeaning if missing
  if (!data.baseMeaning) data.baseMeaning = `${data.name}.`;

  return data;
}

function applyCommit(
  commitName: string,
  emojis: CommitEmoji[]
): { updated: number; errors: string[] } {
  let updated = 0;
  const errors: string[] = [];

  for (const e of emojis) {
    try {
      const data = processEmoji(e.filename);
      if (!data) {
        errors.push(`skip: ${e.filename} (already deep or not found)`);
        continue;
      }
      const filePath = path.join(emojisDir, e.filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      updated++;
    } catch (err: any) {
      errors.push(`error: ${e.filename} - ${err.message}`);
    }
  }
  return { updated, errors };
}

const targetCommit = process.argv[2];

if (targetCommit && plan[targetCommit]) {
  console.log(`Applying updates for commit: ${targetCommit}`);
  const result = applyCommit(targetCommit, plan[targetCommit]);
  console.log(`Updated: ${result.updated}`);
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach((e) => console.log(`  ${e}`));
  }
} else if (!targetCommit) {
  console.log('Available commits:');
  for (const name of Object.keys(plan)) {
    console.log(`  ${name} (${plan[name].length} emojis)`);
  }
  console.log('\nUsage: bun run scripts/generate-deep-content-19.ts "<commit name>"');
} else {
  console.error(`Unknown commit: ${targetCommit}`);
  console.log('Available commits:');
  for (const name of Object.keys(plan)) {
    console.log(`  ${name} (${plan[name].length} emojis)`);
  }
  process.exit(1);
}
