import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { InputBar } from './components/InputBar';
import { ResultCard } from './components/ResultCard';
import { AlertCircle, Terminal, History, FileJson, FileSpreadsheet, RefreshCw } from 'lucide-react';

const queryClient = new QueryClient();

// API Client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

function SocialDataStudio() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch history
  const historyQuery = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const { data } = await api.get('/history');
      return data.data;
    },
    enabled: showHistory,
  });

  const fetchMutation = useMutation({
    mutationFn: async ({ platform, query }: { platform: string; query: string }) => {
      const endpoint = platform === 'youtube' ? '/fetch/youtube' : '/fetch/tiktok';
      const payload = platform === 'youtube'
        ? { url: query }
        : { username: query.replace('@', '') };

      const { data } = await api.post(endpoint, payload);
      return data;
    },
    onSuccess: (result) => {
      if (Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([result.data]);
      }
      setError(null);
      // Refetch history if visible
      if (showHistory) {
        historyQuery.refetch();
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
      setData([]);
    },
  });

  const handleSearch = (platform: string, query: string) => {
    fetchMutation.mutate({ platform, query });
  };

  const handleExport = (format: 'json' | 'csv') => {
    window.open(`${API_URL}/api/export/${format}`, '_blank');
  };

  const handleLoadHistoryItem = (record: any) => {
    setData(record.data);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200 font-body selection:bg-cyan-500/30">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <header className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] -z-10" />
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-4 tracking-tight">
            Social Data Studio
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Professional-grade metadata extraction for the modern web.
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${showHistory
              ? 'bg-cyan-500 text-white'
              : 'glass text-slate-300 hover:text-white'
              }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="glass rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Scrape History
              </h2>
              <button
                onClick={() => historyQuery.refetch()}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${historyQuery.isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {historyQuery.isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading history...</div>
            ) : historyQuery.data?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No scrapes yet. Start by fetching some data!</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {historyQuery.data?.map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                    onClick={() => handleLoadHistoryItem(record)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${record.platform === 'tiktok' ? 'bg-pink-500/20 text-pink-400' :
                        record.platform === 'youtube' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                        {record.platform}
                      </span>
                      <span className="text-white font-medium">@{record.username}</span>
                      <span className="text-slate-500 text-sm">
                        {record.data.length} items
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">
                      {new Date(record.scrapedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mb-16 relative z-10">
          <InputBar onSearch={handleSearch} loading={fetchMutation.isPending} />
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-md mx-auto mb-10 p-4 border border-rose-500/20 bg-rose-500/10 rounded-xl flex items-center gap-3 text-rose-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Status Text (e.g. Polling) */}
        {fetchMutation.isPending && !data.length && (
          <div className="text-center text-slate-500 animate-pulse font-mono text-sm py-12">
            <Terminal className="w-6 h-6 mx-auto mb-3 text-cyan-500/50" />
            Initializing secure connection...<br />
            Negotiating with platform API...
          </div>
        )}

        {/* Results */}
        <ResultCard data={data} />

        {/* Empty State */}
        {!fetchMutation.isPending && !data.length && !error && !showHistory && (
          <div className="text-center py-20 opacity-30">
            <p className="text-6xl mb-4">✨</p>
            <p className="text-sm font-medium uppercase tracking-widest">Ready to fetch</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocialDataStudio />
    </QueryClientProvider>
  );
}
