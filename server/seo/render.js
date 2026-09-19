/**
 * Takes the built SPA shell (client/dist/index.html) and returns a copy with
 * per-page title, meta, canonical, structured data and crawlable body content.
 *
 * Every failure path falls back to the untouched shell, so the worst case is
 * exactly the behaviour we had before.
 */
const fs = require('fs');
const path = require('path');
const { SITE, OG_IMAGE, getPage, escapeHtml } = require('./pages');

let templateCache = null;
let templatePath = null;

function loadTemplate(clientPath) {
  const file = path.join(clientPath, 'index.html');
  if (templateCache && templatePath === file) return templateCache;
  templateCache = fs.readFileSync(file, 'utf8');
  templatePath = file;
  return templateCache;
}

/** Replace the value of a tag if it exists, otherwise append it to <head>. */
function upsert(html, pattern, replacement, fallbackTag) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `  ${fallbackTag}\n  </head>`);
}

function setMeta(html, { title, description, canonical, type, image, robots, keywords }) {
  let out = html;

  if (title) {
    const safe = escapeHtml(title);
    out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${safe}</title>`);
    out = upsert(out, /(<meta property="og:title" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta property="og:title" content="${safe}" />`);
    out = upsert(out, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta name="twitter:title" content="${safe}" />`);
  }

  if (keywords) {
    const safe = escapeHtml(keywords);
    out = upsert(out, /(<meta name="keywords" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta name="keywords" content="${safe}" />`);
  }

  if (description) {
    const safe = escapeHtml(description);
    out = upsert(out, /(<meta name="description" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta name="description" content="${safe}" />`);
    out = upsert(out, /(<meta property="og:description" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta property="og:description" content="${safe}" />`);
    out = upsert(out, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta name="twitter:description" content="${safe}" />`);
  }

  if (canonical) {
    const safe = escapeHtml(canonical);
    out = upsert(out, /(<link rel="canonical" href=")[^"]*(")/, `$1${safe}$2`,
      `<link rel="canonical" href="${safe}" />`);
    out = upsert(out, /(<meta property="og:url" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta property="og:url" content="${safe}" />`);
    out = upsert(out, /(<meta name="twitter:url" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta name="twitter:url" content="${safe}" />`);
  }

  if (type) {
    out = upsert(out, /(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`,
      `<meta property="og:type" content="${type}" />`);
  }

  if (image) {
    const safe = escapeHtml(image);
    out = upsert(out, /(<meta property="og:image" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta property="og:image" content="${safe}" />`);
    out = upsert(out, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${safe}$2`,
      `<meta name="twitter:image" content="${safe}" />`);
  }

  if (robots) {
    out = upsert(out, /(<meta name="robots" content=")[^"]*(")/, `$1${robots}$2`,
      `<meta name="robots" content="${robots}" />`);
  }

  return out;
}

/** Replace the shell's default JSON-LD with the page-specific graph. */
function setJsonLd(html, jsonLd) {
  if (!jsonLd || !jsonLd.length) return html;
  const scripts = jsonLd
    .map(obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
  // Drop the generic site-wide block that ships in index.html, then insert ours.
  const stripped = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    ''
  );
  return stripped.replace('</head>', `  ${scripts}\n  </head>`);
}

// Visually hidden but still present in the DOM: crawlers and screen readers
// read it, sighted users never see it flash before React mounts and clears
// the container.
const SEO_PRERENDER_STYLE = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';

/**
 * Inject crawlable markup into #root. React's createRoot() clears the container
 * on mount, so visitors see the normal app; crawlers that do not run JS see the
 * real content instead of an empty div.
 */
function setBody(html, contentHtml) {
  if (!contentHtml) return html;
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root"><div id="seo-prerender" style="${SEO_PRERENDER_STYLE}">${contentHtml}</div></div>`
  );
}

/**
 * @param {string} clientPath  path to client/dist
 * @param {string} pathname    request path
 * @param {object} [overrides] {title, description, canonical, type, image, robots, jsonLd, content}
 * @returns {string|null} rendered HTML, or null if it could not be produced
 */
function renderPage(clientPath, pathname, overrides = {}) {
  try {
    const page = getPage(pathname) || {};
    const canonical = overrides.canonical
      || `${SITE}${pathname === '/' ? '' : pathname.replace(/\/+$/, '')}`;

    let html = loadTemplate(clientPath);

    html = setMeta(html, {
      title: overrides.title || page.title,
      description: overrides.description || page.description,
      canonical,
      type: overrides.type || page.type || 'website',
      image: overrides.image || page.image || OG_IMAGE,
      robots: overrides.robots || page.robots || 'index, follow',
      keywords: overrides.keywords || page.keywords,
    });

    html = setJsonLd(html, overrides.jsonLd || page.jsonLd);

    let content = overrides.content;
    if (content === undefined && typeof page.content === 'function') {
      try { content = page.content(); } catch (err) {
        console.warn('[seo] content builder failed for', pathname, err.message);
      }
    }
    html = setBody(html, content);

    return html;
  } catch (err) {
    console.warn('[seo] renderPage failed for', pathname, err.message);
    return null;
  }
}

module.exports = { renderPage, setMeta, setJsonLd, setBody };
