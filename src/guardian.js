// Guardian Open Platform API client.
// Free key: https://open-platform.theguardian.com/access (no card, 500 calls/day, CORS-enabled).
// The "test" key below works for light use; replace with your own for reliability.

const API_KEY = import.meta.env.VITE_GUARDIAN_KEY || 'test';
const BASE = 'https://content.guardianapis.com/search';

// Each category maps to Guardian query params. `tag`/`section` target the right content;
// we always request fields we render: headline, trailText (summary), bodyText (snippet), byline.
const CATEGORY_QUERIES = {
  global:    { section: 'world' },
  market:    { section: 'business' },
  tech:      { section: 'technology' },
  economics: { tag: 'business/economics' },
};

// Sport is assembled from several targeted queries so we get your exact interests.
const SPORT_QUERIES = [
  { label: 'Premier League', params: { tag: 'football/premierleague' } },
  { label: 'Chelsea FC',     params: { tag: 'football/chelsea' } },
  { label: 'Transfers',      params: { tag: 'football/transfer-window' } },
  { label: 'Rugby',          params: { section: 'sport', tag: 'sport/rugby-union' } },
  { label: 'Cricket',        params: { section: 'sport', tag: 'sport/cricket' } },
];

function buildUrl(params, pageSize) {
  const u = new URL(BASE);
  u.searchParams.set('api-key', API_KEY);
  u.searchParams.set('show-fields', 'headline,trailText,bodyText,byline');
  u.searchParams.set('order-by', 'newest');
  u.searchParams.set('page-size', String(pageSize));
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function toItem(result, extra = {}) {
  const f = result.fields || {};
  const summary = stripHtml(f.trailText) || (f.headline || result.webTitle);
  const body = stripHtml(f.bodyText);
  const snippet = body ? body.slice(0, 320) + (body.length > 320 ? '…' : '') : summary;
  return {
    title: f.headline || result.webTitle,
    summary,
    snippet,
    url: result.webUrl,                 // real link to the actual article
    source: 'The Guardian',
    ...extra,
  };
}

async function fetchQuery(params, pageSize, extra = {}) {
  const res = await fetch(buildUrl(params, pageSize));
  if (!res.ok) throw new Error('Guardian API ' + res.status);
  const data = await res.json();
  const results = data?.response?.results || [];
  return results.map((r) => toItem(r, extra));
}

// Public: fetch a full day's digest across all categories.
export async function fetchGuardianNews(date) {
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const [global, market, tech, economics] = await Promise.all([
    fetchQuery(CATEGORY_QUERIES.global, 4),
    fetchQuery(CATEGORY_QUERIES.market, 4),
    fetchQuery(CATEGORY_QUERIES.tech, 4),
    fetchQuery(CATEGORY_QUERIES.economics, 4),
  ]);

  const sportArrays = await Promise.all(
    SPORT_QUERIES.map((q) => fetchQuery(q.params, 2, { league: q.label }).catch(() => []))
  );
  const sport = sportArrays.flat();

  return {
    date: dateStr,
    generated: new Date().toLocaleTimeString(),
    global, market, tech, economics, sport,
  };
}
