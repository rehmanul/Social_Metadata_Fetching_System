import { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { InputBar } from './components/InputBar';
import { ResultCard } from './components/ResultCard';
import { AlertCircle, Terminal } from 'lucide-react';

const queryClient = new QueryClient();

// API Client
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

function SocialDataStudio() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMutation = useMutation({
    mutationFn: async ({ platform, query }: { platform: string; query: string }) => {
      // Choose endpoint
      const endpoint = platform === 'youtube' ? '/fetch/youtube' : '/fetch/tiktok';
      // Normalize payload
      const payload = platform === 'youtube'
        ? { url: query }
        : { username: query.replace('@', '') }; // TikTok expects username

      const { data } = await api.post(endpoint, payload);
      return data;
    },
    onSuccess: (result) => {
      // Result.data is array of posts
      if (Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([result.data]); // Wrap single item
      }
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
      setData([]);
    },
  });

  const handleSearch = (platform: string, query: string) => {
    fetchMutation.mutate({ platform, query });
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
        {!fetchMutation.isPending && !data.length && !error && (
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
