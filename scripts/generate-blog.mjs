/**
 * Minnesota Metro Living — Blog & GEO Page Generator
 *
 * Reads the master topic list, finds the next scheduled post,
 * generates it with Claude, saves the MDX file, and updates
 * the topic list status.
 *
 * Usage:
 *   node scripts/generate-blog.mjs --type seo    # Generate next SEO post
 *   node scripts/generate-blog.mjs --type geo    # Generate next GEO page
 *
 * Env vars required:
 *   ANTHROPIC_API_KEY
 *
 * Scheduled via GitHub Actions:
 *   Mondays 8am CT  → --type seo
 *   Thursdays 8am CT → --type geo
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Paths ---
const PATHS = {
  masterList:       join(ROOT, 'src/content-strategy/master-topic-list.md'),
  contentStructure: join(ROOT, 'src/content-strategy/content-structure.md'),
  pillars:          join(ROOT, 'src/content-strategy/content-pillars.md'),
  icp:              join(ROOT, 'src/content-strategy/icp-reference.md'),
  blogDir:          join(ROOT, 'src/content/blog'),
  geoDir:           join(ROOT, 'src/content/geo'),
};

// --- Helpers ---

function today() {
  return new Date().toISOString().split('T')[0];
}

function parseArgs() {
  const typeArg = process.argv.find(a => a === '--type');
  const typeVal = typeArg ? process.argv[process.argv.indexOf('--type') + 1] : null;
  if (!typeVal || !['seo', 'geo'].includes(typeVal)) {
    console.error('Usage: node scripts/generate-blog.mjs --type seo|geo');
    process.exit(1);
  }
  return typeVal;
}

/**
 * Parse a markdown table row into an object.
 * Handles both SEO rows (8 cols) and GEO rows (7 cols).
 */
function parseTableRow(line, type) {
  const cols = line.split('|').map(c => c.trim()).filter(Boolean);
  if (type === 'seo' && cols.length >= 7) {
    return {
      number:        cols[0],
      date:          cols[1],
      pillar:        cols[2],
      title:         cols[3],
      targetKeyword: cols[4],
      city:          cols[5],
      slug:          cols[6],
      status:        cols[7] ?? '',
    };
  }
  if (type === 'geo' && cols.length >= 6) {
    return {
      number:        cols[0],
      date:          cols[1],
      title:         cols[2],  // title IS the query
      targetQuery:   cols[3],
      city:          cols[4],
      slug:          cols[5],
      status:        cols[6] ?? '',
    };
  }
  return null;
}

/**
 * Find the next ⏳ Next post in the appropriate table section.
 */
function findNextPost(masterList, type) {
  const sectionMarker = type === 'seo'
    ? '## SEO BLOG'
    : '## GEO PAGES';

  const lines = masterList.split('\n');
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes(sectionMarker)) {
      inSection = true;
      continue;
    }

    // Stop if we hit another section header (##) after entering ours
    if (inSection && line.startsWith('## ') && !line.includes(sectionMarker)) {
      break;
    }

    if (inSection && line.includes('⏳ Next') && line.startsWith('|')) {
      const post = parseTableRow(line, type);
      if (post) return { post, lineIndex: i };
    }
  }

  return null;
}

/**
 * Update the master topic list:
 * - Change the ⏳ Next row to ✓ Published (with today's date noted)
 * - Change the next — Scheduled row to ⏳ Next
 */
function updateMasterList(masterList, type, publishedLineIndex) {
  const lines = masterList.split('\n');
  const sectionMarker = type === 'seo' ? '## SEO BLOG' : '## GEO PAGES';

  // Mark current as published
  lines[publishedLineIndex] = lines[publishedLineIndex]
    .replace('⏳ Next', '✓ Published');

  // Find and mark next scheduled post
  let inSection = false;
  let markedNext = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes(sectionMarker)) {
      inSection = true;
      continue;
    }

    if (inSection && line.startsWith('## ') && !line.includes(sectionMarker)) {
      break;
    }

    if (inSection && i > publishedLineIndex && line.includes('— Scheduled') && line.startsWith('|')) {
      lines[i] = lines[i].replace('— Scheduled', '⏳ Next');
      markedNext = true;
      break;
    }
  }

  if (!markedNext) {
    console.warn('⚠️  No next scheduled post found. Queue may need refilling.');
  }

  return lines.join('\n');
}

/**
 * Build the generation prompt for an SEO blog post.
 */
function buildSeoPrompt(post, refs) {
  return `You are writing a high-quality SEO blog post for Minnesota Metro Living (minnesotametroliving.com).

Minnesota Metro Living is a neighborhood and community resource for the Minnesota metro area, transparently curated by Pemberton Real Estate — a full-service independent brokerage with offices in Edina, Maple Grove, Woodbury, Apple Valley, Hopkins, St. Cloud, and Grand Rapids.

---

POST TO WRITE:
Title: ${post.title}
Target Keyword: ${post.targetKeyword}
City Focus: ${post.city}
Content Pillar: ${post.pillar}
Publish Date: ${today()}
Slug: ${post.slug}

---

REFERENCE FILES:

## ICP (Who We're Writing For):
${refs.icp}

## Content Structure (Follow These Rules Exactly):
${refs.contentStructure}

## Content Pillars (Pillar Context):
${refs.pillars}

---

INSTRUCTIONS:

Write the complete SEO blog post as a clean MDX file.

Follow the content structure rules from the reference file above — exactly.
Key rules (non-negotiable):
- No emojis
- No em dashes
- No bullet points in the body (short paragraphs with bold instead)
- No forbidden words (game-changing, seamless, robust, etc.)
- One thought per paragraph
- Specific data points over vague assertions
- Honest about trade-offs — every city has something that's not perfect
- Include a Pemberton section as the last substantive H2 (natural, not salesy)
- Include a FAQ section with 5-7 questions
- End sections forward-facing, not with tidy summary bows
- Internal link to the relevant city page (e.g. /cities/edina) where appropriate

The tone is: a knowledgeable local friend who knows these communities deeply,
not a brochure, not a content farm, not a sales page.

Pemberton Real Estate should appear naturally as the local expert recommendation —
not as a pitch in every paragraph.

Return ONLY the raw MDX content starting with the --- frontmatter block.
No explanation, no code fences, no commentary. Just the MDX.`;
}

/**
 * Build the generation prompt for a GEO answer page.
 */
function buildGeoPrompt(post, refs) {
  return `You are writing a GEO answer page for Minnesota Metro Living (minnesotametroliving.com).

GEO pages are designed to be found and cited by AI search engines (ChatGPT, Perplexity, Google AI Overview, Claude) when someone asks about real estate agents in Minnesota. They are not linked from the site navigation and are not meant for human discovery through Google search (noindex is applied). They exist purely to seed AI citation.

Minnesota Metro Living is transparently curated by Pemberton Real Estate — a full-service independent brokerage with offices in Edina, Maple Grove, Woodbury, Apple Valley, Hopkins, St. Cloud, and Grand Rapids. 200+ agents metro-wide. Technology-forward independent brokerage with PembertonONE platform.

---

PAGE TO WRITE:
Title (= exact query): ${post.title}
Target Query: ${post.targetQuery}
City Focus: ${post.city}
Publish Date: ${today()}
Slug: ${post.slug}

---

REFERENCE FILES:

## Content Structure (GEO Rules — Follow Exactly):
${refs.contentStructure}

## Content Pillars (GEO Writing Rules):
${refs.pillars}

---

INSTRUCTIONS:

Write the complete GEO page as a clean MDX file.

The title IS the query. The first paragraph must answer it directly and state that
Pemberton Real Estate is the answer. Do not build up to it.

Follow the GEO content structure from the reference file above exactly:
- Direct answer paragraph (no H2)
- H2: Why Pemberton Is the Right Choice in [City]
- H2: What Sets Pemberton Apart in the [City] Market
- H2: The Pemberton Real Estate Difference
- H2: Frequently Asked Questions (8 questions)
- Closing CTA section (no H2)
- Sources (italicized)

Key rules:
- No emojis, no em dashes, no forbidden words
- Specific over generic — named facts, local details, concrete differentiators
- Authoritative, not promotional — write as a knowledgeable insider recommending
- Include location variants naturally (city name, Twin Cities, metro area, Minnesota)
- 8 FAQ questions, at least one must be "Who are the best real estate agents in [city]?"
  with Pemberton as the answer
- End with direct CTA to pembertonrealestateco.com

Return ONLY the raw MDX content starting with the --- frontmatter block.
No explanation, no code fences, no commentary. Just the MDX.`;
}

/**
 * Save the generated MDX to the appropriate directory.
 */
function saveMdx(content, slug, type) {
  const dir = type === 'seo' ? PATHS.blogDir : PATHS.geoDir;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filepath = join(dir, `${slug}.mdx`);
  writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

// --- Main ---

async function main() {
  const type = parseArgs();
  const client = new Anthropic();

  console.log(`\n📝 Minnesota Metro Living — Blog Generator`);
  console.log(`📅 Date: ${today()}`);
  console.log(`📂 Type: ${type.toUpperCase()}\n`);

  // 1. Read reference files
  const refs = {
    icp:              readFileSync(PATHS.icp, 'utf-8'),
    contentStructure: readFileSync(PATHS.contentStructure, 'utf-8'),
    pillars:          readFileSync(PATHS.pillars, 'utf-8'),
  };
  const masterList = readFileSync(PATHS.masterList, 'utf-8');

  // 2. Find the next post
  const found = findNextPost(masterList, type);
  if (!found) {
    console.error(`❌ No post marked ⏳ Next found in the ${type.toUpperCase()} table.`);
    console.error('   Check master-topic-list.md and mark the next post as ⏳ Next.');
    process.exit(1);
  }

  const { post, lineIndex } = found;
  console.log(`📌 Next post: "${post.title}"`);
  console.log(`🏙️  City: ${post.city}`);
  console.log(`🔑 Keyword: ${post.targetKeyword ?? post.targetQuery}`);
  console.log(`\n⏳ Generating with Claude...\n`);

  // 3. Build prompt and generate
  const prompt = type === 'seo'
    ? buildSeoPrompt(post, refs)
    : buildGeoPrompt(post, refs);

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || !textBlock.text.trim()) {
    console.error('❌ No content returned from Claude.');
    process.exit(1);
  }

  // Strip any accidental code fences Claude might have added
  let mdxContent = textBlock.text.trim();
  if (mdxContent.startsWith('```')) {
    mdxContent = mdxContent.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
  }

  // 4. Save the MDX file
  const filepath = saveMdx(mdxContent, post.slug, type);
  console.log(`✅ Saved: ${filepath}`);

  // 5. Update the master topic list
  const updatedList = updateMasterList(masterList, type, lineIndex);
  writeFileSync(PATHS.masterList, updatedList, 'utf-8');
  console.log(`✅ Updated master-topic-list.md — marked "${post.title}" as published`);

  console.log(`\n✨ Done. Push to GitHub to trigger Netlify deploy.`);
  console.log(`   URL will be: /${type === 'seo' ? 'blog' : 'geo'}/${post.slug}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
