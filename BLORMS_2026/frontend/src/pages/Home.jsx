import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Activity, MapPin, Users, ShieldCheck, Zap, ArrowRight, Brain, Globe, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-6xl mx-auto text-center px-4"
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-red-500 uppercase bg-red-500/10 rounded-full border border-red-500/20">
                        The Future of Life Saving • 2026 Edition
                    </span>
                    <h1 className="text-7xl md:text-8xl font-black mb-8 text-white tracking-tighter leading-tight">
                        Revolutionizing <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
                            Donation Sync
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-slate-300 font-light leading-relaxed">
                        An AI-driven ecosystem connecting donors, hospitals, and patients in real-time.
                        Precision matching, instant SOS, and secure organ registry.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="btn-premium flex items-center gap-2 group">
                                    Return to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/profile" className="px-8 py-3.5 rounded-xl font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition backdrop-blur-md">
                                    View Profile
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn-premium flex items-center gap-2 group">
                                    Get Started Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/login" className="px-8 py-3.5 rounded-xl font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition backdrop-blur-md">
                                    Donor Search
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2"
                >
                    <p className="text-xs uppercase tracking-[0.2em]">Explore Features</p>
                    <div className="w-0.5 h-12 bg-gradient-to-b from-red-500/50 to-transparent" />
                </motion.div>
            </section>

            {/* AI Capabilities Section */}
            <section className="py-32 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-8 text-slate-900 leading-tight">
                                Intelligence that <span className="text-red-600">Saves Lives.</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { icon: Brain, title: "AI Predict", desc: "Predicts blood demand surges using historical patterns and local events." },
                                    { icon: Shield, title: "Spam Guard", desc: "Advanced fraud detection identifies non-genuine emergency requests instantly." },
                                    { icon: Zap, title: "Precision Match", desc: "Ranks donors by distance, eligibility, and history for the perfect match." }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2 text-slate-900">{feature.title}</h4>
                                            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-[3rem] bg-gradient-to-tr from-red-600 to-rose-400 p-1">
                                <div className="w-full h-full bg-slate-900 rounded-[2.9rem] flex items-center justify-center overflow-hidden">
                                    {/* Simplified AI Visual */}
                                    <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 border-4 border-red-500/20 rounded-full animate-ping" />
                                        <div className="absolute inset-4 border-2 border-red-500/40 rounded-full animate-pulse" />
                                        <Heart className="absolute inset-0 m-auto w-20 h-20 text-red-500 animate-float" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 glass p-8 rounded-3xl shadow-2xl max-w-xs border-white/50">
                                <p className="text-sm font-semibold text-red-600 mb-2">Live Update</p>
                                <p className="text-2xl font-black text-slate-900">42,890+</p>
                                <p className="text-slate-600 text-sm">Lives saved this month through smart matching.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Modules Grid */}
            <section className="py-32 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">Integrated Ecosystem</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">One platform, multiple specialized modules for comprehensive donation management.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Blood Donation", icon: Heart, color: "from-red-500 to-rose-600" },
                            { title: "Organ Registry", icon: Activity, color: "from-rose-500 to-pink-600" },
                            { title: "Hospital Portal", icon: Globe, color: "from-blue-500 to-indigo-600" },
                        ].map((module, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="group p-10 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all border border-slate-200"
                            >
                                <div className={`w-16 h-16 rounded-2xl mb-8 bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg`}>
                                    <module.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900">{module.title}</h3>
                                <p className="text-slate-600 mb-8 leading-relaxed">Dedicated workspace with advanced tools for {module.title.toLowerCase()} management and tracking.</p>
                                <Link to={user ? "/dashboard" : "/register"} className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                                    Open Module <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
