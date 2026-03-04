import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Target, Crown, Users, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const Leaderboard = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('leaderboard/');
                setDonors(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return 'from-amber-400 to-amber-600';
            case 2: return 'from-slate-300 to-slate-500';
            case 3: return 'from-orange-400 to-orange-600';
            default: return 'from-slate-100 to-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
                <p className="mt-6 text-slate-500 font-bold tracking-widest uppercase text-xs">Ranking Heroes...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-16 space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex p-3 bg-slate-900 rounded-2xl mb-4"
                >
                    <Trophy className="w-8 h-8 text-amber-400" />
                </motion.div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">World Hero Ranking</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Top Life Savers in the VitalConnect Network</p>
            </div>

            {/* Top 3 Spaced Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {donors.slice(0, 3).map((donor, i) => (
                    <motion.div
                        key={donor.username}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className={`relative p-8 rounded-[3rem] text-center border overflow-hidden shadow-2xl ${i === 0 ? 'bg-slate-900 text-white border-slate-800 scale-105 z-10' : 'bg-white border-slate-100'
                            }`}
                    >
                        {i === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-[60px]" />}

                        <div className={`w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-gradient-to-br ${getRankColor(donor.rank)} flex items-center justify-center shadow-lg`}>
                            {i === 0 ? <Crown className="w-10 h-10 text-white" /> : <Medal className="w-10 h-10 text-white" />}
                        </div>

                        <h3 className="text-2xl font-black mb-1">{donor.username}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {i === 0 ? 'Supreme Hero' : i === 1 ? 'Elite Donor' : 'Master Donor'}
                        </p>

                        <div className="mt-8 pt-8 border-t border-slate-100/10 grid grid-cols-2 gap-4">
                            <div>
                                <p className={`text-[10px] font-bold uppercase ${i === 0 ? 'text-slate-500' : 'text-slate-400'}`}>Points</p>
                                <p className="font-black text-xl">{donor.points.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className={`text-[10px] font-bold uppercase ${i === 0 ? 'text-slate-500' : 'text-slate-400'}`}>Streak</p>
                                <p className="font-black text-xl">{donor.streak}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Rest of the list */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rankings 4-50</span>
                    <Users className="w-4 h-4 text-slate-300" />
                </div>

                <div className="divide-y divide-slate-50">
                    <AnimatePresence>
                        {donors.slice(3).map((donor, i) => (
                            <motion.div
                                key={donor.username}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-default"
                            >
                                <div className="flex items-center gap-6">
                                    <span className="w-6 text-sm font-black text-slate-300">#{donor.rank}</span>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                                        {donor.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{donor.username}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Donation Legend</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="font-black text-slate-900">{donor.points.toLocaleString()}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase">Total Score</p>
                                    </div>

                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 scale-0 group-hover:scale-100 transition-all cursor-pointer hover:bg-red-600 hover:text-white">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Insight */}
            <div className="p-10 bg-red-50 rounded-[2.5rem] flex items-center gap-6">
                <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center text-red-600">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="font-black text-red-900">Weekly Achievement Goal</h4>
                    <p className="text-red-700/70 text-sm font-medium">Top 10 donors this week will receive priority medical vouchers and exclusive hero badges.</p>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
