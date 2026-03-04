import { motion } from 'framer-motion';
import { Users, Navigation, Trophy, ChevronRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateMatrix = ({ candidates = [], loading = false }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />
                ))}
            </div>
        );
    }

    if (candidates.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold text-sm">No smart matches found yet.</p>
                <p className="text-[10px] text-slate-400 font-medium">Try broadening your search criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {candidates.map((donor, i) => (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={donor.id}
                    className="group bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-red-100 transition-all flex items-center gap-5 relative overflow-hidden"
                >
                    {/* IQ Score Indicator */}
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                        AI Score: {donor.intelligence_score}%
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center relative flex-shrink-0">
                        <span className="text-xl font-black text-slate-900">{donor.username[0].toUpperCase()}</span>
                        {donor.intelligence_score > 85 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                                <Zap className="w-3 h-3 text-white fill-current" />
                            </div>
                        )}
                    </div>

                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-slate-900 truncate">{donor.username}</h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                <Navigation className="w-3 h-3" /> {donor.distance.toFixed(1)} km
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                <Trophy className="w-3 h-3" /> Streak: {donor.streak}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Activity className="w-3 h-3" /> {donor.status}
                            </div>
                        </div>
                    </div>

                    <Link to={`/donors/${donor.id}`} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default CandidateMatrix;
