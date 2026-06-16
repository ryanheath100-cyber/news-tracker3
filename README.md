# Daily News Tracker — now with REAL news (The Guardian)

This app pulls live headlines from **The Guardian Open Platform API** — a genuinely free,
browser-friendly news API (no credit card, 500 requests/day, works on a live site).

## File structure

```
news-tracker/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React entry
    ├── App.jsx         # the app UI
    └── guardian.js     # live news fetcher (The Guardian API)
```

## Get your free Guardian API key (2 minutes, one time)

1. Go to https://open-platform.theguardian.com/access
2. Fill in the short form (pick "Register developer key"). It's free, no card.
3. The key arrives by email instantly.

The app ships with the Guardian's shared `test` key as a fallback so it works out of the box,
but that key is rate-limited and shared — **use your own key for reliability.**

### Where to put the key

The key is read from an environment variable `VITE_GUARDIAN_KEY`. Two ways to set it:

**Local development** — create a file named `.env` in the project root:
```
VITE_GUARDIAN_KEY=your-key-here
```
(`.env` is already git-ignored, so your key won't be committed.)

**On Netlify (for the live site)** — Site settings → Environment variables → Add a variable:
- Key: `VITE_GUARDIAN_KEY`
- Value: your-key-here

Then trigger a redeploy (Deploys → Trigger deploy → Deploy site). Vite bakes the key in at build time.

## Run locally

```bash
cd news-tracker
npm install
npm run dev
```

You should see real Guardian headlines across Global, Markets, Technology, Economics, and Sport.
If live news can't be reached (no key, network issue, API down), the app shows a small amber
banner and falls back to demo content so it never breaks.

## How the categories map to The Guardian

| Section in app | Guardian source |
|----------------|-----------------|
| Global         | `world` section |
| Markets        | `business` section |
| Technology     | `technology` section |
| Economics      | `business/economics` tag |
| Sport          | combined: Premier League, **Chelsea** (`football/chelsea`), transfer window, rugby union, cricket |

Each sport story is tagged with its area (Chelsea FC, Rugby, Cricket, etc.) so you can see at a
glance what it's about. "View full story" links go to the real Guardian article.

## Deploy the update

Since you're connected through GitHub: replace `src/App.jsx`, **add** the new `src/guardian.js`,
commit, and Netlify auto-rebuilds. Don't forget to add the `VITE_GUARDIAN_KEY` environment
variable in Netlify (above) for reliable live news.

## Want to go further later

- More sources (BBC, Reuters, etc.) would need either their APIs or a small Netlify serverless
  function to combine feeds — happy to build that when you want it.
- Live sports scores/fixtures (as opposed to news articles) need a dedicated sports API; most
  good ones are paid, so that's a separate decision.
