#!/usr/bin/env node
// Generates one draft newsletter post from the next unused topic in topics.json.
// Usage: node generate-post.mjs [--dry-run]

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const niche = readFileSync(join(root, 'config', 'niche.md'), 'utf8');
const { queue } = JSON.parse(readFileSync(join(root, 'topics.json'), 'utf8'));

const draftsDir = join(root, 'drafts');
if (!existsSync(draftsDir)) mkdirSync(draftsDir, { recursive: true });

const usedIds = new Set(
  readdirSync(draftsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''))
);

const nextTopic = queue.find((t) => !usedIds.has(t.id));
if (!nextTopic) {
  console.error('No unused topics left in topics.json — add more before the next run.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const outPath = join(draftsDir, `${today}-${nextTopic.id}.md`);

const prompt = `You are writing one issue of a weekly newsletter. Follow this niche brief exactly:

${niche}

Write this week's issue.
Topic: ${nextTopic.title}
Angle: ${nextTopic.angle}

Requirements:
- 500-800 words, plain markdown, no title heading (the title is added separately).
- End with a short, clearly-labelled "Affiliate disclosure" line noting that some links may be affiliate links, without inventing specific tool names or URLs I haven't confirmed — write [TOOL NAME] and [AFFILIATE LINK] as placeholders for me to fill in after I pick an actual program to sign up for.
- End with one line inviting readers to reply with questions or requests for next week's topic.`;

async function main() {
  if (dryRun) {
    console.log(`[dry-run] Would generate: ${nextTopic.title}`);
    console.log(`[dry-run] Would write to: ${outPath}`);
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set. Add it as a repo secret, or run with --dry-run to test without it.');
    process.exit(1);
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const body = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const frontMatter = [
    '---',
    `title: "${nextTopic.title.replace(/"/g, '\\"')}"`,
    `date: ${today}`,
    `topic_id: ${nextTopic.id}`,
    'status: draft',
    '---',
    '',
  ].join('\n');

  writeFileSync(outPath, frontMatter + body + '\n');
  console.log(`Wrote draft: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
