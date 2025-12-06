import React, { useState } from 'react';
import { Eye, MessageCircle, Heart, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultCardProps {
    data: any[];
}

// Helper to format large numbers
const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Results <span className="text-cyan-400">({data.length})</span>
                </h2>
            </div>

            {/* Table/List Layout - Full Width */}
            <div className="glass rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800/50 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Thumbnail</div>
                    <div className="col-span-4">Caption</div>
                    <div className="col-span-1 text-center">Views</div>
                    <div className="col-span-1 text-center">Likes</div>
                    <div className="col-span-1 text-center">Comments</div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Table Rows */}
                {data.map((item, idx) => {
                    // Normalize field names (Bright Data uses no underscores)
                    const thumbnail = item.cover_image || item.cover_image_url || item.thumbnail_url || item.displayUrl;
                    const views = item.playcount || item.play_count || item.views || 0;
                    const likes = item.diggcount || item.digg_count || item.likes || 0;
                    const comments = item.commentcount || item.comment_count || item.comments || 0;
                    const caption = item.title || item.desc || item.description || item.text || '';
                    const videoUrl = item.video_url || item.url || '';

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30 transition-colors"
                        >
                            {/* Main Row */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                {/* Index */}
                                <div className="col-span-1 text-slate-500 font-mono text-sm">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>

                                {/* Thumbnail */}
                                <div className="col-span-2">
                                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                                        {thumbnail ? (
                                            <img
                                                src={thumbnail}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                                                🎬
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Caption */}
                                <div className="col-span-4">
                                    <p className="text-white font-medium line-clamp-2 text-sm">
                                        {caption || 'No caption'}
                                    </p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {item.create_date || item.createTime || ''}
                                    </p>
                                </div>

                                {/* Views */}
                                <div className="col-span-1 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-300">
                                        <Eye className="w-4 h-4 text-cyan-400" />
                                        <span className="font-semibold">{formatNumber(views)}</span>
                                    </div>
                                </div>

                                {/* Likes */}
                                <div className="col-span-1 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-300">
                                        <Heart className="w-4 h-4 text-rose-400" />
                                        <span className="font-semibold">{formatNumber(likes)}</span>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="col-span-1 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-300">
                                        <MessageCircle className="w-4 h-4 text-amber-400" />
                                        <span className="font-semibold">{formatNumber(comments)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex items-center justify-center gap-2">
                                    {videoUrl && (
                                        <a
                                            href={videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition"
                                            title="Open Video"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setExpandedId(expandedId === idx.toString() ? null : idx.toString())}
                                        className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 text-xs font-medium transition flex items-center gap-1"
                                    >
                                        {expandedId === idx.toString() ? 'Hide' : 'Data'}
                                        {expandedId === idx.toString() ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded JSON Data */}
                            <AnimatePresence>
                                {expandedId === idx.toString() && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-4">
                                            <pre className="p-4 bg-slate-950 rounded-lg text-xs text-emerald-400 font-mono overflow-auto max-h-80 border border-slate-800 custom-scrollbar">
                                                {JSON.stringify(item, null, 2)}
                                            </pre>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
