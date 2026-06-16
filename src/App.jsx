import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Globe, BarChart3, Zap, Trophy, ChevronDown, ExternalLink } from 'lucide-react';
import { fetchGuardianNews } from './guardian.js';

const CATEGORY_CONFIG = {
  global:    { icon: Globe,      label: 'Global Headlines', text: 'text-blue-600',   bg: 'bg-blue-50',   border: '#2563eb' },
  market:    { icon: TrendingUp, label: 'Markets',          text: 'text-green-600',  bg: 'bg-green-50',  border: '#16a34a' },
  tech:      { icon: Zap,        label: 'Technology',       text: 'text-purple-600', bg: 'bg-purple-50', border: '#9333ea' },
  economics: { icon: BarChart3,  label: 'Economics',        text: 'text-orange-600', bg: 'bg-orange-50', border: '#ea580c' },
  sport:     { icon: Trophy,     label: 'Sport',            text: 'text-rose-600',   bg: 'bg-rose-50',   border: '#e11d48' },
};

const CATEGORY_ORDER = ['global', 'market', 'tech', 'economics', 'sport'];

function searchUrl(title) {
  return 'https://news.google.com/search?q=' + encodeURIComponent(title);
}

function generateMockNews(date) {
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return {
    date: dateStr,
    generated: new Date().toLocaleTimeString(),
    global: [
      { title: 'Global markets rally on geopolitical de-escalation', summary: 'International markets showed strength as tensions ease in key regions.', snippet: 'Equity indices across Europe and Asia advanced after diplomatic talks signalled a thaw in a long-running regional standoff. Investors rotated back into risk assets, with cyclical sectors leading gains while safe-haven demand for gold and government bonds softened.', source: 'Global News Network' },
      { title: 'Tech giants announce AI infrastructure investments', summary: 'Major cloud providers commit $50B+ to data center expansion.', snippet: 'A wave of capital-expenditure announcements points to sustained demand for AI compute. The new data centres focus on high-density GPU clusters and improved power efficiency, with several sites tied to dedicated renewable energy agreements to manage soaring electricity needs.', source: 'Tech Daily' },
      { title: 'European Union passes digital regulation package', summary: 'New AI and data privacy rules take effect across EU member states.', snippet: 'The legislation introduces tiered obligations based on system risk, mandatory transparency for automated decision-making, and stiffer penalties for data-handling breaches. Companies operating in the bloc have a phased compliance window to adapt their products.', source: 'EU News' },
    ],
    market: [
      { title: 'S&P 500 closes at record high', summary: 'Index gains 1.8% as inflation concerns ease.', snippet: 'Softer-than-expected inflation data revived hopes of an earlier rate cut, sending megacap technology and consumer discretionary names higher. Breadth improved notably, with the majority of constituents finishing the session in positive territory.', metric: '+1.8%', value: '7,654', source: 'Market Wire' },
      { title: 'Tech stocks lead rally', summary: 'NASDAQ composite up 2.3% on strong earnings reports.', snippet: 'A run of upbeat quarterly results from semiconductor and software firms lifted sentiment across the sector. Forward guidance citing resilient enterprise spending on AI tooling reassured investors who had feared a slowdown.', metric: '+2.3%', value: '26,847', source: 'Market Wire' },
      { title: 'Energy sector retreats on oil price decline', summary: 'Crude prices down 3% as supply concerns ease.', snippet: 'Brent and WTI both slipped after reports of rising inventories and easing supply-side risk. Integrated oil majors and oilfield-services names were among the weakest performers on the day.', metric: '-3%', value: '$79.50/bbl', source: 'Market Wire' },
    ],
    tech: [
      { title: 'NVIDIA expands AI semiconductor partnership', summary: 'New collaboration on advanced chip manufacturing and optimization.', snippet: 'The expanded agreement brings AI-assisted design and defect-inspection tooling deeper into the fabrication process, aiming to improve yields at leading-edge nodes and shorten time-to-volume for next-generation accelerators.', impact: 'High', source: 'Tech Daily' },
      { title: 'SpaceX continues IPO momentum', summary: 'Space infrastructure company extends market gains.', snippet: 'Shares built on a strong debut as investors bet on growing demand for launch capacity and satellite connectivity. Analysts pointed to a robust order backlog as a key support for the valuation.', impact: 'Medium', source: 'Tech Daily' },
      { title: 'AI chip market projected to hit $500B in 2026', summary: 'Industry report shows unprecedented growth trajectory.', snippet: 'A new industry study attributes the surge to data-centre build-outs and inference workloads moving into production. The report cautions that power availability and advanced-packaging capacity remain the key bottlenecks.', impact: 'High', source: 'Industry Report' },
    ],
    economics: [
      { title: 'Inflation data released — CPI at 3.8%', summary: 'Inflation remains elevated but trending toward Fed target.', snippet: 'Headline consumer prices cooled on an annual basis, though core services inflation stayed sticky. Economists remain divided on how quickly the central bank can ease without reigniting price pressures.', direction: 'Stable', source: 'Econ Watch' },
      { title: 'Federal Reserve maintains rates', summary: 'Central bank holds steady amid conflicting economic signals.', snippet: 'Policymakers kept the benchmark rate unchanged and emphasised data dependence. The accompanying projections trimmed the number of expected cuts this year, citing resilient growth and a still-firm labour market.', direction: 'Hold', source: 'Econ Watch' },
      { title: 'Q2 GDP growth accelerates to 2.1%', summary: 'Economic expansion driven by investment and consumer spending.', snippet: 'Business investment, particularly in AI infrastructure, was the largest contributor to the quarter. Consumer spending held up better than feared, though high borrowing costs continued to weigh on housing activity.', direction: 'Up', source: 'Econ Watch' },
    ],
    sport: [
      { title: 'Premier League title race tightens with three games to go', summary: 'Top two separated by a single point heading into the run-in.', snippet: 'A dramatic weekend of results blew the title race wide open, with the leaders dropping points away from home while their nearest rivals ground out a narrow win. The remaining fixtures include a pivotal head-to-head that could decide the championship.', league: 'Premier League', source: 'Football Daily' },
      { title: 'Chelsea close in on summer midfield signing', summary: 'Blues reportedly agree personal terms with target ahead of transfer window.', snippet: 'Chelsea are said to have made significant progress on a deal for a highly-rated midfielder, with personal terms broadly agreed and clubs negotiating a fee. The move signals continued investment in the squad as the club looks to push back toward the top four.', league: 'Chelsea FC', source: 'Transfer News' },
      { title: 'Transfer window: clubs brace for record spending', summary: 'Premier League sides expected to break previous outlay records.', snippet: 'Early indications point to another summer of heavy expenditure across the league, with several clubs lining up marquee additions. Agents report intense activity as sides look to strengthen before the campaign begins.', league: 'Transfers', source: 'Transfer News' },
      { title: 'Six Nations form guide: rugby powers gear up', summary: 'Northern hemisphere sides ramp up preparation amid selection debates.', snippet: 'Coaches are weighing experience against emerging talent as the international rugby calendar approaches. Injuries to key forwards have opened the door for uncapped players, sparking debate among pundits over the strongest available lineups.', league: 'Rugby', source: 'Rugby Report' },
      { title: 'Cricket: thrilling Test finish goes down to the wire', summary: 'Final session drama as bowlers defend a modest total.', snippet: 'A tense final day saw the match swing repeatedly before a late flurry of wickets settled it. The result reshapes the standings and sets up a compelling remainder to the series, with both sides claiming positives.', league: 'Cricket', source: 'Cricket Desk' },
    ],
  };
}

function NewsCard({ item, borderColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded p-4 border-l-4" style={{ borderColor }}>
      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{item.summary}</p>

      {item.snippet && open && (
        <p className="text-gray-700 text-sm mb-3 bg-gray-50 rounded p-3 border border-gray-100">{item.snippet}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {item.snippet && (
          <button onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium">
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            {open ? 'Hide summary' : 'Read summary'}
          </button>
        )}
        <a href={item.url || searchUrl(item.title)} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
          View full story <ExternalLink className="w-4 h-4" />
        </a>

        {(item.metric || item.impact || item.direction || item.league) && <span className="flex-1" />}

        {item.metric && (
          <span className="inline-flex items-center gap-2">
            <span className="text-gray-500">{item.value}</span>
            <span className={item.metric.includes('-') ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{item.metric}</span>
          </span>
        )}
        {item.impact && (
          <span className={item.impact === 'High' ? 'text-red-600 font-semibold' : 'text-yellow-600 font-semibold'}>{item.impact} impact</span>
        )}
        {item.direction && (
          <span className={item.direction === 'Up' ? 'text-green-600' : item.direction === 'Down' ? 'text-red-600' : 'text-gray-500'}>{item.direction}</span>
        )}
        {item.league && (
          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">{item.league}</span>
        )}
      </div>
    </div>
  );
}

export default function NewsTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newsHistory, setNewsHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('newsHistory');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const dateKey = currentDate.toISOString().split('T')[0];
  const currentNews = newsHistory[dateKey];

  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      let fresh;
      try {
        fresh = await fetchGuardianNews(currentDate);
        const totalStories = ['global','market','tech','economics','sport']
          .reduce((n, k) => n + (fresh[k]?.length || 0), 0);
        if (totalStories === 0) throw new Error('No stories returned');
      } catch (apiErr) {
        // Network/API failure or missing key — fall back to demo content so the app still works
        setError('Live news unavailable right now — showing demo content. Check your Guardian API key.');
        fresh = generateMockNews(currentDate);
      }
      setNewsHistory((prev) => {
        const updated = { ...prev, [dateKey]: fresh };
        try { localStorage.setItem('newsHistory', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!newsHistory[dateKey]) fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  const previousDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) setCurrentDate(d);
  };

  const todayKey = new Date().toISOString().split('T')[0];
  const isToday = dateKey === todayKey;
  const canGoNext = !isToday;

  const categories = selectedCategory === 'all' ? CATEGORY_ORDER : [selectedCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily News Tracker</h1>
              <p className="text-gray-500 text-sm mt-1">Global headlines, markets, tech, economics &amp; sport</p>
            </div>
            {currentNews && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Last updated</p>
                <p className="text-sm text-gray-600">{currentNews.generated}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <button onClick={previousDay} className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Previous day">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">{currentNews?.date || 'Loading…'}</h2>
              {isToday && <span className="text-xs text-blue-600 font-semibold">TODAY</span>}
            </div>
            <button onClick={nextDay} disabled={!canGoNext}
              className={`p-2 rounded-lg transition ${canGoNext ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
              aria-label="Next day">
              <ChevronRight className={`w-5 h-5 ${canGoNext ? 'text-gray-600' : 'text-gray-300'}`} />
            </button>
          </div>

          <div className="flex justify-center">
            <button onClick={fetchNews} disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition ${loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {loading ? 'Refreshing…' : 'Refresh news'}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[['all','All news'],['global','Global'],['market','Markets'],['tech','Technology'],['economics','Economics'],['sport','Sport']].map(([val,label]) => (
              <button key={val} onClick={() => setSelectedCategory(val)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">{error}</div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : !currentNews ? (
          <div className="text-center py-12 text-gray-500">No news data available</div>
        ) : (
          categories.map((category) => {
            const items = currentNews[category] || [];
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            return (
              <div key={category} className="mb-8">
                <div className={`${config.bg} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className={`${config.text} w-6 h-6`} />
                    <h2 className={`${config.text} font-bold text-lg`}>{config.label}</h2>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <NewsCard key={idx} item={item} borderColor={config.border} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">History</h3>
          {Object.keys(newsHistory).length === 0 ? (
            <p className="text-sm text-gray-400">No history yet — days you view are saved here.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(newsHistory)
                .sort(([a],[b]) => b.localeCompare(a))
                .slice(0, 10)
                .map(([date]) => (
                  <button key={date} onClick={() => setCurrentDate(new Date(date + 'T00:00:00'))}
                    className={`text-sm px-3 py-1 rounded transition ${date === dateKey ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 text-center py-6">
        <p className="text-sm">Daily News Tracker · runs entirely in your browser</p>
        <p className="text-xs mt-2 text-gray-500">Demo content — swap in a real news API when ready</p>
      </footer>
    </div>
  );
}
