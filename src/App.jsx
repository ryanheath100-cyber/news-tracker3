import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Globe, BarChart3, Zap } from 'lucide-react';

const CATEGORY_CONFIG = {
  global:    { icon: Globe,      label: 'Global Headlines', text: 'text-blue-600',   bg: 'bg-blue-50',   border: '#2563eb' },
  market:    { icon: TrendingUp, label: 'Markets',          text: 'text-green-600',  bg: 'bg-green-50',  border: '#16a34a' },
  tech:      { icon: Zap,        label: 'Technology',       text: 'text-purple-600', bg: 'bg-purple-50', border: '#9333ea' },
  economics: { icon: BarChart3,  label: 'Economics',        text: 'text-orange-600', bg: 'bg-orange-50', border: '#ea580c' },
};

function generateMockNews(date) {
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return {
    date: dateStr,
    generated: new Date().toLocaleTimeString(),
    global: [
      { title: 'Global markets rally on geopolitical de-escalation', summary: 'International markets showed strength as tensions ease in key regions.', source: 'Global News Network' },
      { title: 'Tech giants announce AI infrastructure investments', summary: 'Major cloud providers commit $50B+ to data center expansion.', source: 'Tech Daily' },
      { title: 'European Union passes digital regulation package', summary: 'New AI and data privacy rules take effect across EU member states.', source: 'EU News' },
    ],
    market: [
      { title: 'S&P 500 closes at record high', summary: 'Index gains 1.8% as inflation concerns ease.', metric: '+1.8%', value: '7,654' },
      { title: 'Tech stocks lead rally', summary: 'NASDAQ composite up 2.3% on strong earnings reports.', metric: '+2.3%', value: '26,847' },
      { title: 'Energy sector retreats on oil price decline', summary: 'Crude prices down 3% as supply concerns ease.', metric: '-3%', value: '$79.50/bbl' },
    ],
    tech: [
      { title: 'NVIDIA expands AI semiconductor partnership', summary: 'New collaboration on advanced chip manufacturing and optimization.', impact: 'High' },
      { title: 'SpaceX continues IPO momentum', summary: 'Space infrastructure company extends market gains.', impact: 'Medium' },
      { title: 'AI chip market projected to hit $500B in 2026', summary: 'Industry report shows unprecedented growth trajectory.', impact: 'High' },
    ],
    economics: [
      { title: 'Inflation data released — CPI at 3.8%', summary: 'Inflation remains elevated but trending toward Fed target.', direction: 'Stable' },
      { title: 'Federal Reserve maintains rates at 4.25%-4.50%', summary: 'Central bank holds steady amid conflicting economic signals.', direction: 'Hold' },
      { title: 'Q2 GDP growth accelerates to 2.1%', summary: 'Economic expansion driven by investment and consumer spending.', direction: 'Up' },
    ],
  };
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

  const fetchNews = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const fresh = generateMockNews(currentDate);
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

  const categories = selectedCategory === 'all'
    ? ['global', 'market', 'tech', 'economics']
    : [selectedCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily News Tracker</h1>
              <p className="text-gray-500 text-sm mt-1">Global headlines, markets, tech &amp; economics</p>
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
            {[['all','All news'],['global','Global'],['market','Markets'],['tech','Technology'],['economics','Economics']].map(([val,label]) => (
              <button key={val} onClick={() => setSelectedCategory(val)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
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
                      <div key={idx} className="bg-white rounded p-4 border-l-4" style={{ borderColor: config.border }}>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.summary}</p>
                        {item.metric && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{item.source || 'Market data'}</span>
                            <span className="font-bold text-gray-900">{item.value}</span>
                            <span className={item.metric.includes('-') ? 'text-red-600' : 'text-green-600'}>{item.metric}</span>
                          </div>
                        )}
                        {item.impact && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Impact</span>
                            <span className={item.impact === 'High' ? 'text-red-600 font-semibold' : 'text-yellow-600'}>{item.impact}</span>
                          </div>
                        )}
                        {item.direction && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Trend</span>
                            <span className={item.direction === 'Up' ? 'text-green-600' : item.direction === 'Down' ? 'text-red-600' : 'text-gray-500'}>{item.direction}</span>
                          </div>
                        )}
                        {!item.metric && !item.impact && !item.direction && (
                          <p className="text-xs text-gray-400">{item.source}</p>
                        )}
                      </div>
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
