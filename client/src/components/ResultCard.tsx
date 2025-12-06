import React, { useState } from 'react';
import { Eye, MessageCircle, Heart, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultCardProps {
    data: any[];
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (!data || data.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto mt-12">
            {data.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-colors"
                >
                    {/* Image / Thumbnail */}
                    <div className="aspect-[9/16] relative bg-slate-900">
                        <img
                            src={item.cover_image_url || item.displayUrl || item.thumbnail_url || item.url}
                            alt="Content"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-3 bg-slate-950/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">
                                <div className="flex items-center gap-1.5" title="Views">
                                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                    {item.play_count || item.views || 0}
                                </div>
                                <div className="flex items-center gap-1.5" title="Likes">
                                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                                    {item.digg_count || item.likes || 0}
                                </div>
                                <div className="flex items-center gap-1.5" title="Comments">
                                    <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                                    {item.comment_count || item.comments || 0}
                                </div>
                            </div>

                            {/* Caption */}
                            <p className="text-sm line-clamp-2 text-white/90 font-medium">
                                {item.title || item.desc || item.description || 'No caption'}
                            </p>
                        </div>
                    </div>

                    {/* Details (JSON) Toggle */}
                    <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                        <button
                            onClick={() => setExpandedId(expandedId === idx.toString() ? null : idx.toString())}
                            className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-cyan-400 uppercase tracking-wider font-semibold py-1 transition"
                        >
                            {expandedId === idx.toString() ? 'Hide Data' : 'View Data'}
                            {expandedId === idx.toString() ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <AnimatePresence>
                            {expandedId === idx.toString() && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <pre className="mt-3 p-3 bg-slate-950 rounded-lg text-[10px] text-emerald-400 font-mono overflow-auto max-h-60 border border-slate-800">
                                        {JSON.stringify(item, null, 2)}
                                    </pre>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
