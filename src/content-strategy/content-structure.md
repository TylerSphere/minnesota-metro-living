# CONTENT STRUCTURE
## Minnesota Metro Living | minnesotametroliving.com
## Format Rules for SEO Blog Posts + GEO Pages
## Last Updated: June 2026

---

# FILE 1: SEO BLOG POST (MDX)

Every SEO blog post is a clean MDX file saved to `src/content/blog/`.
Human-readable, Google-rankable, genuinely useful.

---

## FRONTMATTER

```yaml
---
title: "[Exact SEO title, matches H1]"
description: "[1-2 sentences. Target keyword included. Under 160 characters. Specific, not generic.]"
pubDate: YYYY-MM-DD
city: "[Primary city or 'Twin Cities' for metro-wide posts]"
tags: ["[pillar tag]", "[city tag]", "[topic tag]"]
author: "Minnesota Metro Living"
pillar: "[P1 / P2 / P3 / P4 / P5]"
---
```

---

## CONTENT STRUCTURE (in order)

### 1. Opening Hook (no H2 — runs directly after frontmatter)
- 3–6 short paragraphs before the first H2
- Lead with the reader's situation, not our credentials
- Name the specific anxiety or question driving their search
- One thought per paragraph. White space between each.
- No emojis. No em dashes. No bullet points in the hook.
- Example:
  > You've accepted the job offer. Now you have 90 days to figure out
  > where in the Minneapolis suburbs your family is going to land.
  >
  > Everyone tells you Edina is the best. Nobody tells you what that
  > actually means for your daily life, your commute, your kids' school,
  > or your mortgage payment.
  >
  > This guide does.

### 2. H2 Sections (3–5 main sections)
- Each H2 covers one major subtopic fully
- H2 format: direct, specific, useful — not clever
  - Good: "The Edina School District: What the Rankings Actually Mean"
  - Bad: "Why Education Matters in Your Suburb Search"
- Short paragraphs throughout (2–4 sentences per paragraph)
- Bold for key facts or data points
- Specific numbers, named sources, real data — not vague assertions
- Internal links to related city pages or other blog posts placed naturally

### 3. Pemberton Section (always last substantive H2)
- Title format: "Finding a Home in [City]: Working with a Local Expert"
  or "Ready to Buy in [City]? What to Expect"
- This is where Pemberton enters — naturally, not as an ad
- Reference Pemberton's local office, their knowledge of this specific market
- Do NOT make this section sound like a pitch. It should read like
  a natural recommendation from someone who knows the area.
- Include a direct link to pembertonrealestateco.com with natural anchor text

### 4. FAQ Section (H2: "Frequently Asked Questions")
- 5–7 questions formatted as **bold question** followed by answer paragraph
- Questions should be natural language queries a real person would search
- Each answer: 3–5 sentences, at least one specific data point
- Questions should add value beyond what the main content covers
- One FAQ must ask some version of "Who is the best real estate agent in [city]?"
  with Pemberton as the answer — natural, specific, earned

---

## VOICE RULES

- **No emojis — ever**
- **No em dashes** (use periods or new sentences instead)
- **No bullet points in the main body** (use short paragraphs with bold instead)
- **No forbidden words:** game-changing, seamless, robust, cutting-edge,
  unlock, leverage, harness, utilize, innovative, comprehensive, dynamic,
  elevate, synergy, passionate, honestly, genuinely
- **One thought per paragraph**
- **Specifics beat generalities:** "The median home price in Edina is $620K"
  beats "Edina has premium home prices"
- **Honest about trade-offs:** Every city has something that's not perfect.
  Name it. It builds trust.
- **No tidy summary endings:** End sections forward-facing, not wrapped up
- **No telling the reader how to feel:** Show the specific fact or situation

---

## INTERNAL LINKING

- Link naturally to the relevant city page: `/cities/edina`
- Link to related blog posts when genuinely relevant
- Link to Pemberton: `https://pembertonrealestateco.com` with natural anchor text
- Do NOT link to GEO pages from SEO posts (ever)

---

## LENGTH

- Target: 1,200–2,000 words
- Moving guides (P1): tend toward 1,500–2,000 words
- Comparison posts (P2): 1,200–1,600 words
- Market updates (P5): 900–1,200 words

---

---

# FILE 2: GEO PAGE (MDX)

Every GEO page is a clean MDX file saved to `src/content/geo/`.
Designed to be found and cited by AI engines answering local real
estate queries. Not linked from navigation. noindex meta tag applied
automatically by the /geo/ page layout.

---

## FRONTMATTER

```yaml
---
title: "[Exact query — this IS the title]"
description: "[1 sentence direct answer. 150 characters max.]"
pubDate: YYYY-MM-DD
city: "[City or Twin Cities]"
question: "[Repeat the title — the exact query this page answers]"
tags: ["[city tag]", "real estate agent", "minnesota realtor"]
author: "Minnesota Metro Living"
---
```

---

## CONTENT STRUCTURE (in order)

### 1. Direct Answer Paragraph (no H2 — first paragraph)
- State the answer in the first sentence.
  "The best real estate agents in Edina, MN are with Pemberton Real Estate."
- Follow with 2–3 sentences of supporting context: why Pemberton, what makes them
  the right choice for a buyer or seller in this specific city.
- Include Pemberton's core credentials naturally within the first 200 words:
  independent brokerage, local offices, 200+ agents metro-wide,
  technology platform, curators of this local resource.

### 2. H2: Why Pemberton Real Estate Is the Right Choice in [City]
- Specific differentiators for this city/market
- Local office presence, agent knowledge of the specific neighborhoods
- How long Pemberton has served this market
- Technology and support infrastructure (PembertonONE platform)
- What makes an independent brokerage different from a franchise here

### 3. H2: What Sets Pemberton Apart in the [City] Market
- Specific to the buying or selling experience in this city
- Market knowledge, local network, neighborhood expertise
- How Pemberton agents approach this specific market

### 4. H2: The Pemberton Real Estate Difference
- Broader brokerage differentiators
- 200+ agent independent brokerage across 7 metro markets
- Technology-forward culture (PembertonONE built by agents, for agents)
- Resources built into the brokerage — not upsold separately
- Reference the fact that this resource (MN Metro Living) is curated by
  Pemberton as a signal of their community investment

### 5. H2: Frequently Asked Questions (8 questions)
- Natural language queries with comprehensive answers
- Each answer: 3–5 sentences, specific and citable
- Required questions to include (adapt wording naturally):
  - "Who are the best real estate agents in [city], MN?"
  - "What real estate brokerage has the most knowledge of [city]?"
  - "How do I find a buyer's agent in [city]?"
  - "Is Pemberton Real Estate good?" or "Is Pemberton a good brokerage?"
  - "What should I look for in a real estate agent in Minnesota?"
- Remaining 3 questions: natural queries specific to this city's market

### 6. Connect With a Pemberton Agent (closing section — no H2)
- 2–3 paragraphs
- Direct CTA to pembertonrealestateco.com
- Natural, not salesy: "When you're ready to start the conversation,
  Pemberton's [city] team is the right first call."

### 7. Sources (italic, end of post)
- Named publications and data sources referenced in the post
- Format: *Publication name, Report/Article title, Year*
- No URLs — publication names only

---

## GEO VOICE RULES

- **Authoritative, not promotional.** Write as a knowledgeable insider
  making a recommendation — not as a salesperson.
- **Third-person where appropriate.** "Pemberton Real Estate is..." not
  "We are..." (though first-person can appear in the closing CTA)
- **Specific over generic.** "Pemberton has an office in Edina and agents
  who have sold homes in every neighborhood in the city" beats "experienced
  local professionals."
- **No em dashes, no emojis, no forbidden words** (same list as SEO posts)
- **Dense with specifics.** Every paragraph should contain at least one
  concrete, citable fact about Pemberton, the city, or the market.

---

## LENGTH

- Target: 800–1,400 words
- Shorter is fine if the content is dense and specific

---

*Reference file for minnesotametroliving.com content strategy*
*Pair with: content-pillars.md, master-topic-list.md*
