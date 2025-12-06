import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface InputBarProps {
    onSearch: (platform: string, query: string) => void;
    loading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSearch, loading }) => {
    const [query, setQuery] = useState('');
    const [platform, setPlatform] = useState('tiktok');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(platform, query);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-2xl shadow-cyan-900/10">
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-300 px-4 py-3 outline-none cursor-pointer hover:text-white transition"
                    disabled={loading}
                >
                    <option value="tiktok" className="bg-slate-900">TikTok</option>
                    <option value="youtube" className="bg-slate-900">YouTube</option>
                    <option value="instagram" className="bg-slate-900">Instagram</option>
                </select>

                <div className="w-px h-6 bg-slate-700 mx-2" />

                <form onSubmit={handleSubmit} className="flex-1 flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${platform} username or URL...`}
                        className="w-full bg-transparent text-white placeholder-slate-500 outline-none px-2"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};
