import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const QueueManager = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        try {
            const response = await api.get('appointments/queue/');
            setQueue(response.data);
        } catch (error) {
            console.error("Failed to fetch queue", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleCheckIn = async (appointmentId) => {
        if (!window.confirm("Mark this donation as Complete? This will finalize the patient's request and update your hospital inventory.")) return;
        try {
            await api.patch(`appointments/${appointmentId}/`, { status: 'COMPLETED' });
            alert("Donation successfully verified and marked as completed. Records updated.");
            fetchQueue();
        } catch (error) {
            console.error("Check-in failed", error);
            alert("Failed to mark check-in as complete.");
        }
    };

    if (loading) return <div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" /></div>;

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-xl">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Today's Live Queue</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{queue.length} Donors Scheduled</p>
                    </div>
                </div>
                <Calendar className="w-4 h-4 text-slate-300" />
            </div>

            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {queue.length > 0 ? queue.map((appt, i) => (
                        <motion.div
                            key={appt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-900 text-sm">{appt.donor_username || 'Anonymous Donor'}</p>
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase">
                                            {appt.blood_group}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCheckIn(appt.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Check-in
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )) : (
                        <div className="p-12 text-center text-slate-300">
                            <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">No donors in queue</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-slate-50/50 text-center">
                <button
                    onClick={fetchQueue}
                    className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                    Refresh Queue
                </button>
            </div>
        </div>
    );
};

export default QueueManager;
