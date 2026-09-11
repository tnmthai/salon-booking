/**
 * Minimal JSX -> plain HTML extractor for the static content pages (blog posts).
 *
 * The blog articles are plain JSX with literal text, so we can pull the real
 * headings, paragraphs and list items out of the source file and emit them as
 * crawlable HTML. This is deliberately conservative: anything it cannot parse
 * is skipped, and a parse failure yields an empty string.
 */
const fs = require('fs');

const BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'li'];
const cache = new Map();

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Turn the inner JSX of one block element into plain text:
 * drop nested tags, drop `{...}` expressions, collapse whitespace.
 */
function innerText(jsx) {
  let out = '';
  let depth = 0; // depth of {} expression nesting
  let inTag = false;

  for (let i = 0; i < jsx.length; i++) {
    const ch = jsx[i];
    if (depth === 0 && ch === '<') { inTag = true; continue; }
    if (inTag) { if (ch === '>') inTag = false; continue; }
    if (ch === '{') { depth++; continue; }
    if (ch === '}') { if (depth > 0) depth--; continue; }
    if (depth === 0) out += ch;
  }
  return decode(out);
}

/**
 * Extract block-level text content from a JSX source file.
 * @returns {{tag: string, text: string}[]}
 */
function extractBlocks(filePath) {
  if (cache.has(filePath)) return cache.get(filePath);

  let blocks = [];
  try {
    const src = fs.readFileSync(filePath, 'utf8');
    const tagPattern = new RegExp(
      `<(${BLOCK_TAGS.join('|')})(\\s[^>]*)?>([\\s\\S]*?)</\\1>`,
      'g'
    );
    let match;
    while ((match = tagPattern.exec(src)) !== null) {
      const tag = match[1];
      const text = innerText(match[3]);
      // Skip empties and pure-expression nodes like `{t('foo')}`
      if (text && text.length > 1) blocks.push({ tag, text });
    }
  } catch (err) {
    console.warn('[seo] could not extract text from', filePath, err.message);
    blocks = [];
  }

  cache.set(filePath, blocks);
  return blocks;
}

/** Render extracted blocks as a crawlable HTML string. */
function blocksToHtml(blocks) {
  const parts = [];
  let openList = false;

  for (const { tag, text } of blocks) {
    if (tag === 'li') {
      if (!openList) { parts.push('<ul>'); openList = true; }
      parts.push(`<li>${escapeHtml(text)}</li>`);
      continue;
    }
    if (openList) { parts.push('</ul>'); openList = false; }
    parts.push(`<${tag}>${escapeHtml(text)}</${tag}>`);
  }
  if (openList) parts.push('</ul>');

  return parts.join('\n');
}

/** Plain-text summary (first paragraph) — handy for meta descriptions. */
function firstParagraph(blocks, max = 155) {
  const p = blocks.find(b => b.tag === 'p' && b.text.length > 40);
  if (!p) return '';
  return p.text.length > max ? `${p.text.slice(0, max - 1).trimEnd()}…` : p.text;
}

module.exports = { extractBlocks, blocksToHtml, firstParagraph, escapeHtml };
