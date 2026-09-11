/**
 * Loads the English translation dictionary straight out of the client source
 * (client/src/utils/i18n.jsx) so the server-rendered SEO content never drifts
 * away from what the React app actually shows.
 *
 * Everything here is best-effort: if parsing fails for any reason we return an
 * empty dictionary and the caller falls back to the plain SPA shell.
 */
const fs = require('fs');
const path = require('path');

const I18N_FILE = path.join(__dirname, '..', '..', 'client', 'src', 'utils', 'i18n.jsx');

let cache = null;

/** Extract the object literal that follows `const <name> = ` by brace matching. */
function extractObjectLiteral(src, name) {
  const start = src.indexOf(`const ${name} = {`);
  if (start === -1) return null;
  const open = src.indexOf('{', start);
  let depth = 0;
  let inString = null;
  let escaped = false;

  for (let i = open; i < src.length; i++) {
    const ch = src[i];

    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return null;
}

/** @returns {Record<string,string>} the `en` dictionary, or {} if unavailable. */
function loadEn() {
  if (cache) return cache;
  try {
    const src = fs.readFileSync(I18N_FILE, 'utf8');
    const literal = extractObjectLiteral(src, 'en');
    if (!literal) throw new Error('en dictionary not found');
    // The literal is a plain data object from our own repo (string values only).
    // eslint-disable-next-line no-new-func
    const obj = new Function(`return (${literal});`)();
    cache = obj && typeof obj === 'object' ? obj : {};
  } catch (err) {
    console.warn('[seo] could not load i18n dictionary:', err.message);
    cache = {};
  }
  return cache;
}

/** Translate a key, falling back to the supplied default (or '' ). */
function t(key, fallback = '') {
  const dict = loadEn();
  return dict[key] || fallback;
}

module.exports = { loadEn, t };
