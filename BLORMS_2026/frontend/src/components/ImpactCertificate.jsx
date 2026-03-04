import { motion } from 'framer-motion';
import { X, Trophy, Star, ShieldCheck, Heart, Share2, Download } from 'lucide-react';

const ImpactCertificate = ({ donorData, onClose }) => {
    if (!donorData) return null;

    const stats = [
        { label: 'Lives Impacted', value: (donorData.points / 100).toFixed(0), icon: Heart, color: 'text-red-500' },
        { label: 'Donation Streak', value: donorData.streak, icon: Star, color: 'text-amber-500' },
        { label: 'Hero Points', value: donorData.points, icon: Trophy, color: 'text-blue-500' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute top-6 right-8 z-10">
                    <button onClick={onClose} className="p-2 border border-slate-100 hover:bg-slate-50 rounded-full transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Certificate Content */}
                <div className="p-12 relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 blur-[80px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 blur-[80px] -z-10" />

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ rotate: -15, scale: 0.5 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl"
                        >
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Impact Certification</h2>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Certified Donor Hero</h1>
                    </div>

                    <div className="text-center mb-12">
                        <p className="text-slate-500 font-medium mb-1 uppercase tracking-widest text-[10px]">Presented to</p>
                        <h3 className="text-3xl font-black text-slate-900 border-b-2 border-slate-100 inline-block px-12 pb-2 italic">
                            {donorData.username.toUpperCase()}
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full h-px bg-slate-100" />
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                <span>Verification ID: BL-{donorData.username[0].toUpperCase()}{Date.now().toString().slice(-4)}</span>
                                <span>Issued: {new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-bold">Secured on Blockchain</span>
                                <span className="text-slate-300 mx-1">|</span>
                                <span>TxHash: 0x{Array.from(donorData.username).reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '9f3a')}{donorData.points}e4b7c12f9a</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-8 flex items-center justify-center gap-4">
                    <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                        <Download className="w-4 h-4" />
                        Save Image
                    </button>
                    <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-900 transition-all">
                        <Share2 className="w-4 h-4" />
                        Share Socials
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ImpactCertificate;
