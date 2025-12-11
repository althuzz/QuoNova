import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingLegalIcons from '../components/FloatingLegalIcons';
import { API_URL } from '../config';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${API_URL}/api/leaderboard`);
                const data = await response.json();
                setLeaderboardData(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-500 drop-shadow-sm" size={28} fill="currentColor" />;
        if (index === 1) return <Medal className="text-slate-400" size={28} />;
        if (index === 2) return <Medal className="text-orange-400" size={28} />;
        return <span className="text-slate-400 font-bold w-6 text-center">#{index + 1}</span>;
    };

    if (loading) return <div className="text-center py-20 text-slate-900 animate-pulse uppercase tracking-widest text-sm">Loading rankings...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto"
        >
            <FloatingLegalIcons />
            <div className="text-center mb-12 relative">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <Trophy className="mx-auto text-slate-900 mb-6 drop-shadow-sm" size={56} />
                </motion.div>
                <h1 className="text-5xl font-sans font-black mb-3 text-slate-900 tracking-tight">Legal <span className="text-warm-brown-500">Classroom</span> Rankings</h1>
                <p className="text-warm-brown-600 text-lg font-light">Top legal minds of the week</p>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                {leaderboardData.map((user, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 flex items-center justify-between transition-all duration-300 border-b border-slate-100 last:border-0 relative overflow-hidden group hover:bg-slate-50 ${index === 0 ? 'bg-yellow-50/50' : ''}`}
                    >
                        {index === 0 && <div className="absolute left-0 top-0 h-full w-1 bg-yellow-400" />}

                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`w-12 h-12 flex justify-center items-center rounded-xl bg-white border border-slate-200 ${index === 0 ? 'shadow-sm' : ''}`}>
                                {getRankIcon(index)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 font-sans text-lg group-hover:text-slate-900 transition-colors">{user.username || user.name}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Rank: {user.rank || index + 1}</div>
                            </div>
                        </div>

                        <div className="text-right relative z-10">
                            <div className="font-black text-2xl text-slate-900 drop-shadow-sm">{user.score} <span className="text-xs text-slate-400 font-normal align-middle">pts</span></div>
                            <div className="text-xs text-slate-400">{user.date}</div>
                        </div>
                    </motion.div>
                ))}

                {leaderboardData.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic">
                        No scores recorded yet. Be the first to conquer the leaderboard!
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Leaderboard;
