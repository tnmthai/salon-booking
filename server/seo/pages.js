/**
 * Per-route SEO definitions.
 *
 * Timia is a client-rendered SPA, which means that without this module every
 * URL returns the same empty <div id="root"></div> with the same <title> and
 * the same canonical pointing at the homepage. Search engines and social
 * crawlers therefore saw one page, not twenty.
 *
 * For each public route we declare:
 *   - title / description / canonical / og:type  (unique per page)
 *   - jsonLd: structured data
 *   - content(): crawlable HTML injected into #root
 *
 * The injected HTML is built from the very same strings the React app renders
 * (client/src/utils/i18n.jsx, or the blog JSX itself), so it always matches
 * what a human visitor sees. React replaces it on mount.
 */
const path = require('path');
const { t } = require('./i18n');
const { extractBlocks, blocksToHtml, escapeHtml } = require('./jsx-text');

const SITE = process.env.SITE_URL || 'https://www.timia.nz';
const OG_IMAGE = `${SITE}/og-image.png`;
const BLOG_DIR = path.join(__dirname, '..', '..', 'client', 'src', 'pages', 'blog');

/* ------------------------------------------------------------------ helpers */

const h = (tag, key, fallback) => {
  const text = t(key, fallback);
  return text ? `<${tag}>${escapeHtml(text)}</${tag}>` : '';
};

/** Render a list of [tag, i18nKey] pairs. */
const block = (pairs) => pairs.map(([tag, key]) => h(tag, key)).join('\n');

/** Render an <ul> from a list of i18n keys. */
const list = (keys) => {
  const items = keys.map(k => t(k)).filter(Boolean);
  if (!items.length) return '';
  return `<ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
};

/** Site-wide navigation, so crawlers can reach every page from any page. */
const siteNav = () => `
<nav aria-label="Site">
  <a href="${SITE}/">Home</a>
  <a href="${SITE}/features">Features</a>
  <a href="${SITE}/pricing">Pricing</a>
  <a href="${SITE}/explore">Explore salons</a>
  <a href="${SITE}/blog">Blog</a>
  <a href="${SITE}/compare/timely">Timia vs Timely</a>
  <a href="${SITE}/about">About</a>
  <a href="${SITE}/contact">Contact</a>
  <a href="${SITE}/register">Sign up</a>
</nav>`;

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Timia',
  url: SITE,
  logo: `${SITE}/logo.png`,
  areaServed: 'NZ',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lincoln',
    addressRegion: 'Canterbury',
    addressCountry: 'NZ',
  },
};

const breadcrumbLd = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE}${item.path}`,
  })),
});

/* -------------------------------------------------------------- blog posts */

const BLOG_POSTS = [
  {
    path: '/blog/best-booking-software-nz',
    file: 'BestBookingSoftwareNZ.jsx',
    title: 'Best Booking Software for Salons in New Zealand (2026)',
    description: 'Compare Timely, Fresha, Booksy and Timia. Find the best free booking software for your NZ salon.',
    datePublished: '2026-06-01',
  },
  {
    path: '/blog/how-to-reduce-no-shows',
    file: 'HowToReduceNoShows.jsx',
    title: 'How to Reduce No-Shows at Your Salon (Proven Strategies)',
    description: 'No-shows cost NZ salons $3,000–$8,000 a year. Seven proven strategies to cut them by half.',
    datePublished: '2026-06-01',
  },
  {
    path: '/blog/start-salon-business-nz',
    file: 'StartSalonBusinessNZ.jsx',
    title: 'How to Start a Salon Business in New Zealand (2026 Guide)',
    description: 'A complete guide to starting a salon in NZ — registration, costs, tools and your first client.',
    datePublished: '2026-06-01',
  },
];

function blogPageDef(post) {
  return {
    title: `${post.title} | Timia`,
    description: post.description,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: OG_IMAGE,
        datePublished: post.datePublished,
        dateModified: post.datePublished,
        author: { '@type': 'Organization', name: 'Timia', url: SITE },
        publisher: organizationLd,
        mainEntityOfPage: `${SITE}${post.path}`,
      },
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path: post.path },
      ]),
    ],
    content: () => {
      const body = blocksToHtml(extractBlocks(path.join(BLOG_DIR, post.file)));
      return `<article>${body}</article>${siteNav()}`;
    },
  };
}

/* ------------------------------------------------------------ page registry */

const PAGES = {
  '/': {
    title: 'Timia — Online Booking Platform for NZ Salons',
    description: t('landing_hero_subtitle', 'Run your salon without the hassle. Timia handles bookings, payments, and loyalty.').slice(0, 155),
    type: 'website',
    jsonLd: [
      organizationLd,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Timia',
        url: SITE,
        description: 'Online booking platform for salons, nail studios, spas and beauty businesses in New Zealand.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'NZD' },
      },
    ],
    content: () => `
${`<h1>${escapeHtml(`${t('landing_hero_title_1', 'Get booked, get paid,')}${t('landing_hero_title_2', ' and keep clients coming back.')}`)}</h1>`}
${h('p', 'landing_hero_subtitle')}
${block([
      ['h2', 'landing_features_title'],
      ['p', 'landing_features_subtitle'],
      ['h3', 'landing_f1_title'], ['p', 'landing_f1_desc'],
      ['h3', 'landing_f2_title'], ['p', 'landing_f2_desc'],
      ['h3', 'landing_f3_title'], ['p', 'landing_f3_desc'],
      ['h2', 'landing_how_title'],
      ['p', 'landing_how_subtitle'],
      ['h3', 'landing_step1_title'], ['p', 'landing_step1_desc'],
      ['h3', 'landing_step2_title'], ['p', 'landing_step2_desc'],
      ['h3', 'landing_step3_title'], ['p', 'landing_step3_desc'],
      ['h2', 'landing_timely_title'],
      ['p', 'landing_timely_subtitle'],
      ['h3', 'landing_timely_50_title'], ['p', 'landing_timely_50_desc'],
      ['h3', 'landing_timely_setup_title'], ['p', 'landing_timely_setup_desc'],
      ['h3', 'landing_timely_nz_title'], ['p', 'landing_timely_nz_desc'],
      ['h2', 'landing_cta_title'],
      ['p', 'landing_cta_subtitle'],
    ])}
${siteNav()}`,
  },

  '/features': {
    title: 'Features — Everything you need to manage your salon | Timia',
    description: t('features_subtitle', 'From online booking to team management, Timia gives you all the tools to run and grow your business.').slice(0, 155),
    type: 'website',
    jsonLd: [breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }])],
    content: () => `
${`<h1>${escapeHtml(`${t('features_title_1', 'Everything you need to')}${t('features_title_2', ' manage your salon')}`)}</h1>`}
${h('p', 'features_subtitle')}
${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
${h('h2', `features_f${n}_title`)}
${h('p', `features_f${n}_desc`)}
${list([`features_f${n}_d1`, `features_f${n}_d2`, `features_f${n}_d3`])}`).join('')}
${siteNav()}`,
  },

  '/pricing': {
    title: 'Pricing — Plans that grow with you | Timia',
    description: t('pricing_subtitle', 'Start for free, upgrade when you need more. No credit card required.').slice(0, 155),
    type: 'website',
    jsonLd: [
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [1, 2, 3, 4, 5, 6, 7]
          .map(n => ({ q: t(`pricing_faq${n}_q`), a: t(`pricing_faq${n}_a`) }))
          .filter(x => x.q && x.a)
          .map(x => ({
            '@type': 'Question',
            name: x.q,
            acceptedAnswer: { '@type': 'Answer', text: x.a },
          })),
      },
    ],
    content: () => `
${`<h1>${escapeHtml(`${t('pricing_title_1', 'Plans that')}${t('pricing_title_2', ' grow with you')}`)}</h1>`}
${h('p', 'pricing_subtitle')}
${['starter', 'plus', 'growth'].map(plan => `
${h('h2', `pricing_${plan}_name`)}
${h('p', `pricing_${plan}_desc`)}
${list([1, 2, 3, 4, 5, 6, 7].map(n => `pricing_${plan}_f${n}`))}`).join('')}
${block([['h2', 'pricing_bonus_title'], ['p', 'pricing_bonus_desc'],
      ['h2', 'pricing_referral_title'], ['p', 'pricing_referral_desc'],
      ['h2', 'pricing_faq_title']])}
${[1, 2, 3, 4, 5, 6, 7].map(n => `${h('h3', `pricing_faq${n}_q`)}${h('p', `pricing_faq${n}_a`)}`).join('')}
${siteNav()}`,
  },

  '/about': {
    title: 'About Timia — Booking software built in New Zealand',
    description: t('about_subtitle', 'Timia was born from a simple observation: salon owners spend too much time on admin.').slice(0, 155),
    type: 'website',
    jsonLd: [organizationLd, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])],
    content: () => `
${`<h1>${escapeHtml(`${t('about_title_1', "We're making")}${t('about_title_2', ' business management simple')}`)}</h1>`}
${block([
      ['p', 'about_subtitle'],
      ['h2', 'about_why_title'],
      ['p', 'about_why_p1'], ['p', 'about_why_p2'], ['p', 'about_why_p3'],
      ['h2', 'about_values_title'], ['p', 'about_values_subtitle'],
      ['h3', 'about_v1_title'], ['p', 'about_v1_desc'],
      ['h3', 'about_v2_title'], ['p', 'about_v2_desc'],
      ['h3', 'about_v3_title'], ['p', 'about_v3_desc'],
      ['h3', 'about_v4_title'], ['p', 'about_v4_desc'],
      ['h2', 'about_team_title'], ['p', 'about_team_subtitle'],
    ])}
${siteNav()}`,
  },

  '/contact': {
    title: 'Contact Timia — Local support in New Zealand',
    description: t('contact_subtitle', "Have a question? Want to partner? We'd love to hear from you.").slice(0, 155),
    type: 'website',
    jsonLd: [organizationLd, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])],
    content: () => `
${`<h1>${escapeHtml(`${t('contact_title_1', 'Get in')}${t('contact_title_2', ' touch')}`)}</h1>`}
${block([
      ['p', 'contact_subtitle'],
      ['h2', 'contact_email_title'], ['p', 'contact_email_desc'],
      ['h2', 'contact_location_title'], ['p', 'contact_location_value'],
      ['h2', 'contact_hours_title'], ['p', 'contact_hours_value'],
    ])}
${siteNav()}`,
  },

  '/explore': {
    title: 'Explore salons in New Zealand — book online | Timia',
    description: t('explore_subtitle', 'Find your perfect salon and book instantly.').slice(0, 155),
    type: 'website',
    jsonLd: [breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Explore', path: '/explore' }])],
    // Salon cards are injected at request time (see index.js) because they come
    // from the database.
    content: () => `
${`<h1>${escapeHtml(`${t('explore_title_1', 'Explore ')}${t('explore_title_2', 'salons')}`)}</h1>`}
${h('p', 'explore_subtitle')}
${siteNav()}`,
  },

  '/compare/timely': {
    title: 'Timia vs Timely — honest comparison for NZ salons (2026)',
    description: t('compare_subtitle', "How Timia compares with Timely for small NZ salons — price, setup time and support.").slice(0, 155),
    type: 'article',
    jsonLd: [breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Timia vs Timely', path: '/compare/timely' },
    ])],
    content: () => {
      const rows = [];
      for (let n = 1; n <= 15; n++) {
        const feature = t(`compare_row${n}_feature`);
        if (!feature) continue;
        rows.push(`<tr><td>${escapeHtml(feature)}</td><td>${escapeHtml(t(`compare_row${n}_timia`))}</td><td>${escapeHtml(t(`compare_row${n}_timely`))}</td></tr>`);
      }
      const table = rows.length
        ? `<table><thead><tr><th>${escapeHtml(t('compare_feature_header', 'Feature'))}</th><th>${escapeHtml(t('compare_timia_header', 'Timia'))}</th><th>${escapeHtml(t('compare_timely_header', 'Timely'))}</th></tr></thead><tbody>${rows.join('')}</tbody></table>`
        : '';
      return `
${h('h1', 'compare_title', 'Timia vs Timely')}
${block([
        ['p', 'compare_subtitle'],
        ['h2', 'compare_short_version'],
        ['p', 'compare_short_desc_1'],
        ['p', 'compare_short_desc_2'],
      ])}
${table}
${h('p', 'compare_disclaimer')}
${block([['h2', 'compare_when_title'], ['h3', 'compare_choose_timely_title'], ['h3', 'compare_choose_timia_title']])}
${siteNav()}`;
    },
  },

  '/blog': {
    title: 'Timia Blog — tips and guides for NZ salon owners',
    description: 'Tips, guides and insights for salon owners in New Zealand: booking software, no-shows, and starting a salon.',
    type: 'website',
    jsonLd: [breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])],
    content: () => `
<h1>Timia Blog</h1>
<p>Tips, guides, and insights for salon owners in New Zealand.</p>
${BLOG_POSTS.map(p => `<h2><a href="${SITE}${p.path}">${escapeHtml(p.title)}</a></h2><p>${escapeHtml(p.description)}</p>`).join('')}
${siteNav()}`,
  },

  '/register': {
    title: 'Sign up your salon — free forever plan | Timia',
    description: 'Create your Timia account and start taking online bookings in minutes. Free to start, no credit card.',
    type: 'website',
    noindexFollow: false,
    content: () => `<h1>Sign up your business</h1><p>Create an account and start receiving bookings. Free to start, no credit card required.</p>${siteNav()}`,
  },

  '/terms': { title: 'Terms of Service | Timia', description: 'The terms that apply when you use Timia.', type: 'website' },
  '/privacy': { title: 'Privacy Policy | Timia', description: 'How Timia collects, uses and protects your data.', type: 'website' },
  '/cookies': { title: 'Cookie Policy | Timia', description: 'How Timia uses cookies and similar technologies.', type: 'website' },
  '/legal': { title: 'Legal | Timia', description: 'Legal information about Timia and its services.', type: 'website' },
  '/kiosk-guide': { title: 'Kiosk check-in guide | Timia', description: 'How to set up and use the Timia kiosk check-in screen in your salon.', type: 'website' },
};

for (const post of BLOG_POSTS) PAGES[post.path] = blogPageDef(post);

/* ------------------------------------------------------------------ lookups */

/** Normalise a request path: strip trailing slash, lowercase, drop query. */
function normalise(pathname) {
  if (!pathname) return '/';
  const clean = pathname.split('?')[0].replace(/\/+$/, '');
  return clean === '' ? '/' : clean.toLowerCase();
}

function getPage(pathname) {
  return PAGES[normalise(pathname)] || null;
}

/**
 * Routes the SPA handles but that we do not pre-render (they are private,
 * dynamic, or not worth indexing). They must still return 200 + the SPA shell
 * rather than a 404.
 */
const DYNAMIC_ROUTE_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/login$/,
  /^\/lookup$/,
  /^\/kiosk\/[^/]+$/,
  /^\/[^/]+\/book$/,
  /^\/[^/]+\/gift-card$/,
];

function isKnownRoute(pathname) {
  const p = normalise(pathname);
  if (PAGES[p]) return true;
  return DYNAMIC_ROUTE_PATTERNS.some(re => re.test(p));
}

module.exports = {
  SITE,
  OG_IMAGE,
  PAGES,
  BLOG_POSTS,
  getPage,
  isKnownRoute,
  normalise,
  organizationLd,
  breadcrumbLd,
  siteNav,
  escapeHtml,
};
