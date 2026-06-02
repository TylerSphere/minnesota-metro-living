/**
 * Minnesota Metro Living — Automated News Generator
 *
 * This script uses the Anthropic API (with web search) to find recent local news
 * across the 7 Pemberton markets and generates MDX files for the site.
 *
 * Run manually:  node scripts/generate-news.mjs
 * Scheduled:     GitHub Actions cron (see .github/workflows/scheduled-news.yml)
 *
 * Env vars required:
 *   ANTHROPIC_API_KEY   — Your Anthropic API key
 *   GITHUB_TOKEN        — GitHub token with repo write access (for CI auto-commit)
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'src', 'content', 'news');

const CITIES = [
  'Edina, Minnesota',
  'Maple Grove, Minnesota',
  'Woodbury, Minnesota',
  'Apple Valley, Minnesota',
  'Hopkins, Minnesota',
  'St. Cloud, Minnesota',
  'Grand Rapids, Minnesota',
];

const client = new Anthropic();

/**
 * Slugify a title for the filename
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // strip periods, dots, punctuation
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function citySlug(cityName) {
  // e.g. "St. Cloud, Minnesota" → "st-cloud"
  return cityName
    .split(',')[0]
    .toLowerCase()
    .replace(/\./g, '')   // remove periods (St. → st)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format today's date as YYYY-MM-DD
 */
function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate a news article for a given city using Claude with web search
 */
async function generateNewsForCity(city) {
  console.log(`\n📰 Searching for news in ${city}...`);

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [
      {
        role: 'user',
        content: `Search for recent local news (within the past 2 weeks) about ${city}.

Focus on:
- Real estate market updates or development projects
- New businesses opening
- School or education news
- Infrastructure, parks, or community projects
- Community events of note

Then write a 350–450 word news summary article in MDX format with this exact frontmatter:

---
title: "[Short, specific headline about the news]"
description: "[1–2 sentence summary for search snippets, 150 chars max]"
pubDate: ${today()}
city: "${city.split(',')[0]}"
tags: ["local news", "${citySlug(city)}"]
source: "[Name of source publication if found]"
---

After the frontmatter, write the article body in plain markdown. Be factual, informative, and local. Do NOT include the word "Pemberton" or any real estate agent recommendations in the news content itself — this is a news article, not an ad.

Return ONLY the raw MDX content — no extra explanation, no code fences.`,
      },
    ],
  });

  // Extract the text content from the response
  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock) {
    console.warn(`  ⚠️  No text response for ${city}`);
    return null;
  }

  let mdx = textBlock.text.trim();

  // Strip any preamble Claude added before the frontmatter delimiter.
  // The MDX file must start with --- on the very first line.
  const frontmatterStart = mdx.indexOf('---');
  if (frontmatterStart > 0) {
    mdx = mdx.slice(frontmatterStart);
  }

  // Strip accidental code fences
  if (mdx.startsWith('```')) {
    mdx = mdx.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
  }

  return mdx;
}

/**
 * Save MDX content to the news directory
 */
function saveMdxFile(content, city) {
  const slug = citySlug(city);
  const dateStr = today();

  // Extract title from frontmatter to create a meaningful filename
  const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const titleSlug = titleMatch ? slugify(titleMatch[1]) : `news-${dateStr}`;

  const filename = `${dateStr}-${slug}-${titleSlug}.mdx`;
  const filepath = join(CONTENT_DIR, filename);

  if (!existsSync(CONTENT_DIR)) {
    mkdirSync(CONTENT_DIR, { recursive: true });
  }

  writeFileSync(filepath, content, 'utf-8');
  console.log(`  ✅  Saved: ${filename}`);
  return filename;
}

/**
 * Main entry point
 */
async function main() {
  console.log('🏙️  Minnesota Metro Living — News Generator');
  console.log(`📅  Date: ${today()}`);
  console.log(`🏘️  Cities: ${CITIES.length}\n`);

  const results = [];

  for (const city of CITIES) {
    try {
      const content = await generateNewsForCity(city);
      if (content) {
        const filename = saveMdxFile(content, city);
        results.push({ city, filename, status: 'success' });
      }
    } catch (err) {
      console.error(`  ❌  Error for ${city}:`, err.message);
      results.push({ city, status: 'error', error: err.message });
    }

    // Small delay between cities to be respectful of API rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n📊  Summary:');
  results.forEach(r => {
    const icon = r.status === 'success' ? '✅' : '❌';
    console.log(`  ${icon}  ${r.city}: ${r.filename ?? r.error}`);
  });

  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n✨  Done. ${successCount}/${CITIES.length} articles generated.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
