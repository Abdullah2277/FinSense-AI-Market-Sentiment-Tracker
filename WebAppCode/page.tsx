"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  Loader2, 
  RefreshCcw,
  Newspaper,
  Cpu,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

// --- Configuration ---
// ⚠️ REPLACE THIS with your actual Hugging Face Space URL if deploying
const BACKEND_URL = "https://hussainr-finsense.hf.space"; 
// const BACKEND_URL = "http://localhost:8000"; // Uncomment for local dev

// --- Types ---
type SentimentLabel = "positive" | "negative" | "neutral";
type ViewMode = "news" | "custom";

interface Sentiment {
  label: SentimentLabel;
  score: number;
}

interface Article {
  title: string;
  description: string | null;
  url: string;
  source: string;
  published_at: string;
  sentiment: Sentiment;
}

interface ApiResponse {
  ticker: string | null;
  count: number;
  articles: Article[];
}

// --- Components ---

const SentimentBadge = ({ label, score, size = "sm" }: { label: string; score: number, size?: "sm" | "lg" }) => {
  // Normalize label case
  const safeLabel = label.toLowerCase() as SentimentLabel;

  const styles = {
    positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
    negative: "bg-rose-500/10 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(251,113,133,0.2)]",
    neutral: "bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(96,165,250,0.2)]",
  };

  const icons = {
    positive: <TrendingUp className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
    negative: <TrendingDown className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
    neutral: <Minus className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
  };

  return (
    <div className={`
      flex items-center gap-2 rounded-full border backdrop-blur-sm font-medium uppercase tracking-wider
      ${styles[safeLabel] || styles.neutral}
      ${size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-[10px]"}
    `}>
      {icons[safeLabel] || icons.neutral}
      <span>{safeLabel}</span>
      <span className="opacity-60 border-l border-current pl-2 ml-1">
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  );
};

const NewsCard = ({ article }: { article: Article }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd • HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <a 
      href={article.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex flex-col bg-slate-900/50 border border-white/5 rounded-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 overflow-hidden h-full"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
            <Newspaper className="w-3 h-3" />
            {article.source}
          </span>
          <span>{formatDate(article.published_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 mb-3 leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-6 line-clamp-3 flex-grow leading-relaxed">
          {article.description || "No description available for this article."}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
          <SentimentBadge 
            label={article.sentiment.label} 
            score={article.sentiment.score} 
          />
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
    </a>
  );
};

// --- Custom Analysis Component ---
const CustomAnalysis = () => {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Sentiment | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      // The pipeline returns a list of dicts: [{ label: 'positive', score: 0.99 }]
      if (Array.isArray(data) && data.length > 0) {
        setResult(data[0]);
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 text-cyan-400">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-white">Custom Analysis</h2>
        </div>
        
        <p className="text-slate-400 mb-6">
          Paste a headline, tweet, or financial report snippet below to run it through the AI model instantly.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="E.g., Tesla stock surges after record-breaking quarterly earnings report..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={analyzing || !text.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Neural Network...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                Run AI Model
              </>
            )}
          </button>
        </form>

        {/* Result Area */}
        {result && (
          <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-sm mb-3 uppercase tracking-widest font-bold">Predicted Sentiment</span>
              <SentimentBadge label={result.label} score={result.score} size="lg" />
              <p className="mt-4 text-slate-500 text-sm max-w-md">
                The model is {Math.round(result.score * 100)}% confident that this text carries a <span className="text-slate-300 font-medium">{result.label}</span> sentiment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Dashboard() {
  const [view, setView] = useState<ViewMode>("news");
  const [ticker, setTicker] = useState("");
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (symbol: string = "") => {
    setLoading(true);
    setError(null);
    setNews([]);

    try {
      const url = new URL(`${BACKEND_URL}/news-with-sentiment`);
      if (symbol) url.searchParams.append("ticker", symbol);
      url.searchParams.append("limit", "12");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

      const data: ApiResponse = await res.json();
      setNews(data.articles);
      setActiveTicker(data.ticker);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'news' && news.length === 0) {
      fetchNews("");
    }
  }, [view]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(ticker);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]" />
      </div>

      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">FinSense</span>
                <span className="text-xs text-cyan-400 block tracking-widest uppercase font-semibold">AI Analytics</span>
              </div>
            </div>
            
            {/* View Switcher */}
            <div className="flex bg-slate-900/50 p-1 rounded-full border border-white/5 backdrop-blur-sm">
              <button 
                onClick={() => setView('news')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  view === 'news' 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                Live Feed
              </button>
              <button 
                onClick={() => setView('custom')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  view === 'custom' 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Custom Input
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {view === 'news' ? (
          <>
            {/* Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  Market Sentiment <span className="px-2 py-0.5 rounded text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">LIVE</span>
                </h1>
                <p className="text-slate-400">Real-time financial news analyzed by AI.</p>
              </div>

              <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
                <div className="relative flex items-center bg-slate-900 rounded-full">
                  <Search className="absolute left-4 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Ticker (e.g. BTC, NVDA)..."
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none rounded-full"
                  />
                  {loading && <Loader2 className="absolute right-4 w-5 h-5 text-cyan-500 animate-spin" />}
                </div>
              </form>
            </div>

            {/* Results Grid */}
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">System Error</h3>
                <p className="text-red-400 mb-6">{error}</p>
                <button 
                  onClick={() => fetchNews(ticker)}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : loading && news.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 bg-slate-900/50 rounded-2xl border border-white/5 animate-pulse"></div>
                ))}
              </div>
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article, idx) => (
                  <NewsCard key={`${article.url}-${idx}`} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Intelligence Found</h3>
                <p className="text-slate-500">System could not retrieve news for this query.</p>
              </div>
            )}
          </>
        ) : (
          <CustomAnalysis />
        )}
      </main>
    </div>
  );
}