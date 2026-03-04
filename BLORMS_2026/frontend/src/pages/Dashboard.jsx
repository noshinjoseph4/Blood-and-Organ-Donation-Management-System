import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    Droplet, Activity, MapPin, Clock, Navigation, AlertCircle,
    ChevronRight, Plus, Search, Filter, TrendingUp, Users,
    Calendar, CheckCircle2, FlaskConical, ShieldAlert, Zap, Sparkles, Trophy, Box
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

import BloodBalance from '../components/BloodBalance';
import MapModule from '../components/MapModule';
import CandidateMatrix from '../components/CandidateMatrix';
import QueueManager from '../components/QueueManager';
import ImpactCertificate from '../components/ImpactCertificate';

const Dashboard = () => {
    const { user: userProfile } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMatch, setFilterMatch] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [recLoading, setRecLoading] = useState(false);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [sosBloodGroup, setSosBloodGroup] = useState('O+');
    const [sosLoading, setSosLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        if (userProfile) {
            fetchRequests();
            if (userProfile.role === 'HOSPITAL') {
                fetchRecommendations();
                fetchPrediction();
            }
        }
    }, [filterMatch, userProfile]);

    const stats = useMemo(() => ({
        totalRequests: Math.floor(Math.random() * 500) + 100,
        fulfilled: Math.floor(Math.random() * 300) + 50,
        donorsNearby: Math.floor(Math.random() * 50) + 10
    }), [userProfile?.id]);


    const fetchRequests = async () => {
        setLoading(true);
        try {
            let url = 'requests/';
            const params = new URLSearchParams();
            if (filterMatch && userProfile?.donor_profile?.blood_group) {
                params.append('blood_group', userProfile.donor_profile.blood_group);
            }
            if (userProfile?.donor_profile?.latitude) {
                params.append('lat', userProfile.donor_profile.latitude);
                params.append('lng', userProfile.donor_profile.longitude);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const response = await api.get(url);
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        setRecLoading(true);
        try {
            // Default to A+ for demo if hospital coords not available
            const response = await api.get('recommendations/?blood_group=A%2B');
            setRecommendations(response.data);
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setRecLoading(false);
        }
    };

    const fetchPrediction = async () => {
        try {
            const response = await api.get('predict-demand/?blood_group=O-');
            setPrediction(response.data);
        } catch (error) {
            console.error("Failed to fetch prediction", error);
        }
    };

    const handleSOSSubmit = async () => {
        setSosLoading(true);
        try {
            await api.post('requests/create/', {
                request_type: 'BLOOD',
                blood_group: sosBloodGroup,
                is_urgent: true,
                hospital_name: userProfile?.hospital_profile?.name || 'Emergency Center',
                medical_notes: 'DIRECT SOS DISPATCH FROM HOSPITAL PANEL'
            });
            setShowSOSModal(false);
            fetchRequests();
            alert("SOS Broadcast Sent Successfully!");
        } catch (error) {
            console.error("SOS Dispatch failed", error);
            alert("Failed to send SOS. Please check console.");
        } finally {
            setSosLoading(false);
        }
    };

    const renderDonorDashboard = () => (
        <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Donation Streak', value: userProfile?.donor_profile?.donation_streak || 0, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Points Earned', value: userProfile?.donor_profile?.achievement_points || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Donors Nearby', value: stats.donorsNearby, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden">
                        {stat.label === 'Donation Streak' && stat.value >= 5 && (
                            <div className="absolute -top-2 -right-2 w-16 h-16 bg-amber-600/10 rotate-12 flex items-center justify-center pt-2 pl-2">
                                <Trophy className="w-8 h-8 text-amber-600 opacity-20" />
                            </div>
                        )}
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                {stat.label === 'Donation Streak' && stat.value >= 5 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[8px] font-black uppercase flex items-center gap-1">
                                        <Trophy className="w-2 h-2" /> Bronze Hero
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-slate-900">Active Requests</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${showMap ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <Navigation className="w-4 h-4" />
                                {showMap ? 'List View' : 'Map View'}
                            </button>
                            <button
                                onClick={() => setFilterMatch(!filterMatch)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${filterMatch ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <Filter className="w-4 h-4" />
                                {filterMatch ? `My Group: ${userProfile?.donor_profile?.blood_group}` : 'All Requests'}
                            </button>
                        </div>
                    </div>

                    {showMap ? (
                        <div className="h-[600px] w-full">
                            <MapModule
                                requests={requests}
                                userLocation={userProfile?.donor_profile?.latitude ? [userProfile.donor_profile.latitude, userProfile.donor_profile.longitude] : null}
                            />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map((req, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={req.id}
                                    className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden"
                                >
                                    {req.is_urgent && <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />}
                                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Group</p>
                                            <p className="text-2xl font-black text-red-600 leading-none">{req.blood_group || 'O'}</p>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${req.request_type === 'BLOOD' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {req.request_type}
                                            </span>
                                            {req.is_urgent && <span className="flex items-center gap-1 text-red-600 text-[10px] font-black uppercase animate-pulse"><ShieldAlert className="w-3 h-3" /> SOS Emergency</span>}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{req.hospital_name || 'Emergency Medical Request'}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-60" /> {req.distance ? `${req.distance} km away` : 'Location unknown'}</div>
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-60" /> {new Date(req.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Link to={`/requests/${req.id}`} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center gap-2">
                                            Details <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-3xl" />
                        <h3 className="text-xl font-black mb-4 relative z-10">Ready to Save a Life?</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10">Your next donation eligibility is automated. Book a slot at your nearest hospital now.</p>
                        <div className="space-y-3 relative z-10">
                            <Link to="/appointments" className="w-full btn-premium flex items-center justify-center gap-2 text-sm">
                                <Plus className="w-4 h-4" /> Schedule Appointment
                            </Link>
                            <button
                                onClick={() => setShowCertificate(true)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10"
                            >
                                <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" /> Share Hero Impact
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-600" /> Recent Activity
                        </h3>
                        <div className="space-y-6">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-1.5 h-10 bg-slate-100 rounded-full flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Donation Confirmed</p>
                                        <p className="text-xs text-slate-500">City Hospital • 2 days ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBloodBankDashboard = () => (
        <div className="space-y-10 text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Network Stock', value: '4.2k Units', icon: Box, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Active Dispatches', value: '18 Live', icon: Navigation, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Hospitals Served', value: '12', icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Fulfillment Rate', value: '94%', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[100px] pointer-events-none" />
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Regional Inventory Flux</h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase">Low Supply: B-</span>
                            <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase">Optimal: O+</span>
                        </div>
                    </div>
                    <div className="h-[400px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Zone A', v: 4000 }, { name: 'Zone B', v: 3000 }, { name: 'Zone C', v: 2000 },
                                { name: 'Zone D', v: 2780 }, { name: 'Zone E', v: 1890 }, { name: 'Zone F', v: 2390 }, { name: 'Zone G', v: 3490 }
                            ]}>
                                <defs>
                                    <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorInv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Logistics Command</h3>
                        <div className="space-y-6">
                            {[
                                { t: "Dispatch #882", s: "In Transit", d: "City General" },
                                { t: "Pickup #119", s: "Completed", d: "St. Marys" },
                                { t: "Dispatch #885", s: "Pending", d: "Central Hope" }
                            ].map((task, i) => (
                                <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <div>
                                        <p className="font-bold text-sm">{task.t}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{task.d}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded bg-white/10 ${task.s === 'In Transit' ? 'text-blue-400' : task.s === 'Completed' ? 'text-green-400' : 'text-amber-400'}`}>
                                        {task.s}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">
                            New Dispatch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPatientDashboard = () => (
        <div className="space-y-10 text-slate-900">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="max-w-xl text-left">
                        <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Patient Care Module</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-none">Find your life-saving match in seconds.</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Our AI network monitors 100+ facilities in real-time to ensure you get the blood or organ you need, exactly when you need it.</p>
                    </div>
                    <button
                        onClick={() => setShowSOSModal(true)}
                        className="w-full md:w-auto px-12 py-6 rounded-[2rem] bg-red-600 text-white font-black text-xl hover:bg-red-700 transition-all shadow-2xl shadow-red-600/40 flex items-center justify-center gap-4 group active:scale-95"
                    >
                        <FlaskConical className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                        GET SOS HELP
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-red-600" /> My Request Timeline
                        </h3>
                        <div className="space-y-8 relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                            {requests.slice(0, 3).map((req, i) => (
                                <div key={i} className="flex gap-10 relative z-10">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-4 border-white ${req.status === 'FULFILLED' ? 'bg-red-500 scale-125 shadow-lg shadow-red-500/50' : i === 0 ? 'bg-blue-500 scale-110 shadow-md' : 'bg-slate-200'} shadow-md`}>
                                        {req.status === 'FULFILLED' && <Heart className="w-3 h-3 text-white fill-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-900">{req.request_type} Request #{req.id}</p>
                                                <p className="text-xs text-slate-500 font-medium mb-1">{new Date(req.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${req.status === 'FULFILLED' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        {req.status === 'FULFILLED' && (
                                            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                                                <h4 className="font-black text-red-600 mb-1">Request Fulfilled! ❤️</h4>
                                                <p className="text-xs text-slate-600">A hero donor has stepped up and completed this donation at a verified hospital facility. Thank you for using VitalConnect.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-8">No active requests.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-inner">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" /> Nearby Facilities
                        </h3>
                        <div className="space-y-4">
                            {[
                                { n: "City Medical", d: "0.8km", h: "24/7" },
                                { n: "Red Cross Hub", d: "2.4km", h: "Open Now" }
                            ].map((f, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="font-bold text-slate-900">{f.n}</p>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-xs font-bold text-blue-600">{f.d}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{f.h}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/map" className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-black text-slate-900 py-4 hover:bg-slate-100 transition-all rounded-xl">
                            Open Map Interface <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const [adminUsers, setAdminUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const fetchAdminUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.get('admin-users/');
            setAdminUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch admin users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleVerifyUser = async (userId, currentVerified) => {
        try {
            await api.patch(`admin-users/${userId}/`, { is_verified: !currentVerified });
            setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentVerified, kyc_status: !currentVerified ? 'VERIFIED' : 'REJECTED' } : u));
        } catch (error) {
            console.error("Verification failed", error);
        }
    };

    const deleteUser = async (userId) => {
        const confirmed = window.confirm(`Are you sure you want to permanently delete user #${userId}?`);
        if (!confirmed) return;
        try {
            await api.delete(`admin-users/${userId}/`);
            setAdminUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user. Please check console.");
        }
    };

    // Auto-fetch users if we hit the user management tab
    const [adminTab, setAdminTab] = useState('overview');

    useEffect(() => {
        if (userProfile?.role === 'ADMIN' && adminTab === 'users' && adminUsers.length === 0) {
            fetchAdminUsers();
        }
    }, [adminTab, userProfile]);

    const [adminDonations, setAdminDonations] = useState([]);
    const [loadingDonations, setLoadingDonations] = useState(false);

    const fetchAdminDonations = async () => {
        setLoadingDonations(true);
        try {
            const response = await api.get('appointments/');
            setAdminDonations(response.data);
        } catch (error) {
            console.error("Failed to fetch donations", error);
        } finally {
            setLoadingDonations(false);
        }
    };

    useEffect(() => {
        if (userProfile?.role === 'ADMIN' && adminTab === 'donations' && adminDonations.length === 0) {
            fetchAdminDonations();
        }
    }, [adminTab, userProfile]);

    const [showDocModal, setShowDocModal] = useState(false);
    const [selectedDocUrl, setSelectedDocUrl] = useState(null);

    const openDocModal = (url) => {
        setSelectedDocUrl(url);
        setShowDocModal(true);
    };

    const renderAdminDashboard = () => (
        <div className="space-y-10">
            <div className="flex gap-4 overflow-x-auto pb-2">
                <button onClick={() => setAdminTab('overview')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${adminTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>System Overview</button>
                <button onClick={() => setAdminTab('users')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${adminTab === 'users' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>User Management</button>
                <button onClick={() => setAdminTab('donations')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${adminTab === 'donations' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Donation History</button>
            </div>

            {adminTab === 'overview' ? (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h2 className="text-3xl font-black text-slate-900 mb-6">System Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-slate-50 rounded-3xl">
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Total System Users</p>
                            <p className="text-4xl font-black text-slate-900">1.2k</p>
                        </div>
                        <div className="p-8 bg-red-50 rounded-3xl border border-red-100">
                            <p className="text-red-600 font-bold uppercase text-xs tracking-widest mb-2">Critical Requests</p>
                            <p className="text-4xl font-black text-red-600">8 Live</p>
                        </div>
                        <div className="p-8 bg-green-50 rounded-3xl border border-green-100">
                            <p className="text-green-600 font-bold uppercase text-xs tracking-widest mb-2">Verified Donors</p>
                            <p className="text-4xl font-black text-green-600">842</p>
                        </div>
                    </div>
                    <div className="mt-10">
                        <Link to="/audit-trails" className="btn-premium inline-flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Open Audit Dashboard
                        </Link>
                    </div>
                </div>
            ) : adminTab === 'users' ? (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900">Platform Users & Hospitals</h2>
                        <button onClick={fetchAdminUsers} className="text-sm font-bold text-blue-600 hover:text-blue-700">Refresh Data</button>
                    </div>
                    {loadingUsers ? (
                        <p className="text-slate-500 p-8 text-center font-bold">Loading user database...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">User ID</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Username / Email</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">KYC Status</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminUsers.map(u => (
                                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-slate-900">
                                                #{u.id}
                                                {u.id_card_upload && (
                                                    <button
                                                        onClick={() => openDocModal(u.id_card_upload)}
                                                        className="ml-2 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider hover:bg-blue-100 transition-colors"
                                                    >
                                                        View Doc
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-slate-900">{u.username}</p>
                                                <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${u.role === 'HOSPITAL' ? 'bg-blue-50 text-blue-600' : u.role === 'DONOR' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${u.is_verified ? 'text-green-500' : 'text-amber-500'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${u.is_verified ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    {u.is_verified ? 'Verified' : u.kyc_status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleVerifyUser(u.id, u.is_verified)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.is_verified ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                >
                                                    {u.is_verified ? 'Revoke' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => alert("Edit user functionally is handled in the Backend Admin Panel (accessible from the Navbar)")}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : adminTab === 'donations' ? (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900">Global Donation History</h2>
                        <button onClick={fetchAdminDonations} className="text-sm font-bold text-blue-600 hover:text-blue-700">Refresh Data</button>
                    </div>
                    {loadingDonations ? (
                        <p className="text-slate-500 p-8 text-center font-bold">Loading donations...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Donor</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Hospital</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminDonations.map(d => (
                                        <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-slate-900">{new Date(d.appointment_date).toLocaleString()}</p>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-900">{d.donor_username}</td>
                                            <td className="py-4 px-4 font-bold text-slate-900">{d.hospital_name}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${d.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : d.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-slate-500">{d.notes || '-'}</td>
                                        </tr>
                                    ))}
                                    {adminDonations.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">No history available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : null}

            {/* Document Modal */}
            {showDocModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDocModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-2 relative max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 flex justify-between items-center border-b border-slate-100">
                            <h3 className="font-black text-slate-900">KYC Document Verification</h3>
                            <button onClick={() => setShowDocModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="p-4 flex-grow overflow-auto flex items-center justify-center bg-slate-50 rounded-b-[1.5rem]">
                            {selectedDocUrl ? (
                                <img src={selectedDocUrl} alt="User KYC Document" className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-slate-200" />
                            ) : (
                                <p className="text-slate-500 font-bold">No document provided.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );

    const renderHospitalDashboard = () => (
        <div className="space-y-10">
            {/* Hospital Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Requests', value: requests.length, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Appointments', value: '12 Today', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Total Fulfills', value: stats.fulfilled, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 blur-[100px] pointer-events-none" />
                        <BloodBalance hospitalId={userProfile?.hospital_profile?.id} />
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900">Blood Demand Trends</h2>
                            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: 'Mon', v: 400 }, { name: 'Tue', v: 300 }, { name: 'Wed', v: 600 },
                                    { name: 'Thu', v: 400 }, { name: 'Fri', v: 900 }, { name: 'Sat', v: 700 }, { name: 'Sun', v: 800 }
                                ]}>
                                    <defs>
                                        <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="v" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500 fill-current" /> AI Candidates
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Smart Priority Matching</p>
                            </div>
                        </div>
                        <CandidateMatrix candidates={recommendations} loading={recLoading} />
                    </div>

                    <QueueManager />
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between h-full min-h-[400px]">
                    <div>
                        <h3 className="text-2xl font-black mb-4">Quick Actions</h3>
                        <p className="text-slate-400 text-sm mb-10">Manage stock and dispatch emergency alerts directly to local hero networks.</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowSOSModal(true)}
                                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-3"
                            >
                                <FlaskConical className="w-4 h-4 text-red-500" /> Dispatch SOS
                            </button>
                            <button
                                onClick={() => setShowStaffModal(true)}
                                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-3"
                            >
                                <Users className="w-4 h-4 text-blue-500" /> Staff Roster
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <span className="text-white font-bold block">AI Insights:</span>
                                {prediction
                                    ? `Demand for O- predicted to be ${prediction.predicted_units_needed} units (${prediction.trend}). Confidence: ${prediction.confidence_score * 100}%`
                                    : 'Analyzing regional network data...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading && !requests.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
                <p className="mt-6 text-slate-500 font-bold tracking-widest uppercase text-xs">Syncing with 2026 Core...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 mb-10">
                <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                            Welcome back, {userProfile?.username}!
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {userProfile?.role === 'HOSPITAL' ? 'Hospital Management Dashboard' :
                                userProfile?.role === 'ADMIN' ? 'Site Administrator Control Panel' :
                                    userProfile?.role === 'BLOOD_BANK' ? 'Blood Bank Hub Network' :
                                        userProfile?.role === 'PATIENT' ? 'Patient Personal Care Dashboard' :
                                            'Donor Personal Command Center'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Network Status</p>
                            <p className="text-sm font-bold text-green-500 flex items-center justify-end gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live & Optimal
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black">
                            {userProfile?.username?.[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {userProfile?.role === 'HOSPITAL' ? renderHospitalDashboard() :
                    userProfile?.role === 'ADMIN' ? renderAdminDashboard() :
                        userProfile?.role === 'BLOOD_BANK' ? renderBloodBankDashboard() :
                            userProfile?.role === 'PATIENT' ? renderPatientDashboard() :
                                renderDonorDashboard()}
            </div>

            {showCertificate && (
                <ImpactCertificate
                    donorData={{
                        username: userProfile?.username,
                        streak: userProfile?.donor_profile?.donation_streak || 0,
                        points: userProfile?.donor_profile?.achievement_points || 0
                    }}
                    onClose={() => setShowCertificate(false)}
                />
            )}

            {showSOSModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl" />
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Emergency SOS</h2>
                        <p className="text-slate-500 text-sm mb-8">This alert will broadcast instantly to all matching donors within 50km.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">Required Blood Group</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                                        <button
                                            key={group}
                                            onClick={() => setSosBloodGroup(group)}
                                            className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${sosBloodGroup === group ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}
                                        >
                                            {group}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowSOSModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSOSSubmit}
                                    disabled={sosLoading}
                                    className="flex-2 px-10 py-4 rounded-2xl bg-red-600 text-white font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                                >
                                    {sosLoading ? 'Dispatching...' : 'Dispatch Now'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {showStaffModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white w-full max-w-4xl rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">Medical Staff Roster</h2>
                                <p className="text-slate-500 text-sm font-medium">Daily shift management & status tracking</p>
                            </div>
                            <button onClick={() => setShowStaffModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                                <Plus className="rotate-45" />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { name: "Dr. Sarah Mitchell", role: "Head of Hematology", status: "In Surgery", color: "bg-red-500" },
                                { name: "Mark Wilson", role: "Lab Technician", status: "Active", color: "bg-green-500" },
                                { name: "Elena Rodriguez", role: "Emergency Nurse", status: "On Break", color: "bg-amber-500" },
                                { name: "Dr. James Chen", role: "Critical Care", status: "Active", color: "bg-green-500" },
                                { name: "Lisa Thompson", role: "Inventory Lead", status: "Off Duty", color: "bg-slate-300" }
                            ].map((staff, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{staff.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{staff.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${staff.color}`} />
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{staff.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
