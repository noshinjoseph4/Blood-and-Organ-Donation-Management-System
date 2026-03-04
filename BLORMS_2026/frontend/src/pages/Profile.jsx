import { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Mail, Droplet, MapPin, Save, Phone, ShieldCheck, Trophy, Camera, FileText, AlertCircle, Upload, CheckCircle2, Heart, Calendar, X, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationPicker from '../components/LocationPicker';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showPledgeModal, setShowPledgeModal] = useState(false);
    const [pledgeData, setPledgeData] = useState({ organ_name: '', family_contact_name: '', family_contact_phone: '' });
    const [success, setSuccess] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('profile/');
            setProfile(response.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setMessage({ type: 'error', text: 'Failed to load profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePledgeChange = (e) => {
        setPledgeData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePledgeSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('organ-pledges/', pledgeData);
            setSuccess('Organ pledge submitted successfully!');
            setShowPledgeModal(false);
            fetchProfile();
        } catch (error) {
            console.error("Pledge failed", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfile(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setProfile(prev => ({
                        ...prev,
                        donor_profile: {
                            ...prev.donor_profile,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    }));
                },
                (_error) => {
                    alert("Could not fetch location.");
                }
            );
        }
    };

    const handleFileChange = (e) => {
        setProfile(prev => ({
            ...prev,
            id_card_upload: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                if (key === 'donor_profile' || key === 'hospital_profile') {
                    formData.append(key, JSON.stringify(profile[key]));
                } else if (key === 'id_card_upload' && profile[key] instanceof File) {
                    formData.append(key, profile[key]);
                } else if (profile[key] !== null && key !== 'id_card_upload') {
                    formData.append(key, profile[key]);
                }
            });

            const response = await api.put('profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(response.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error("Failed to update profile", error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Account Settings</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and donation preferences.</p>
            </motion.div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-5 mb-8 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{message.text}</span>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="w-full h-full rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black">
                                {profile.username?.[0].toUpperCase()}
                            </div>
                            <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-black text-slate-900">{profile.username}</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{profile.role}</p>

                        {profile.kyc_status === 'VERIFIED' ? (
                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
                                <ShieldCheck className="w-3 h-3" /> Fully Verified
                            </div>
                        ) : profile.kyc_status === 'PENDING' ? (
                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                                <Clock className="w-3 h-3" /> Verification Pending
                            </div>
                        ) : (
                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">
                                <AlertCircle className="w-3 h-3" /> KYC Required
                            </div>
                        )}
                    </div>

                    {/* KYC Portal */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900">Identity Trust</h3>
                            <div className={`w-2 h-2 rounded-full ${profile.kyc_status === 'VERIFIED' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                                Upload your National ID or Passport to unlock high-priority donation requests and earn the "Trusted Hero" badge.
                            </p>
                        </div>

                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group-hover:border-red-400 group-hover:bg-red-50/30">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-red-600" />
                                <span className="text-[10px] font-black text-slate-500 uppercase">
                                    {profile.id_card_upload ? "ID Loaded. Click to change" : "Upload ID Document"}
                                </span>
                            </div>
                        </div>

                        {profile.kyc_status === 'REJECTED' && (
                            <p className="text-[10px] font-bold text-red-600 flex items-center gap-1.4">
                                <AlertCircle size={12} /> Last submission rejected. Please re-upload.
                            </p>
                        )}
                    </div>

                    {profile.role === 'DONOR' && (
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                            <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" /> Achievements
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-medium">Donation Streak</span>
                                    <span className="font-black text-xl">{profile.donor_profile?.donation_streak || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-medium">Points</span>
                                    <span className="font-black text-xl">{profile.donor_profile?.achievement_points || 0}</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-600" style={{ width: '40%' }} />
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Level 2 Hero • 320pts to next level</p>
                            </div>
                        </div>
                    )}

                    {/* Digital Donor Card */}
                    {profile.role === 'DONOR' && (
                        <div className="bg-gradient-to-tr from-red-600 to-rose-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-500/20 relative overflow-hidden mt-8">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <h3 className="font-black text-lg mb-6 flex items-center gap-2 relative z-10">
                                <FileText className="w-5 h-5 text-red-200" /> Digital Donor Card
                            </h3>
                            <div className="bg-white p-6 rounded-3xl text-slate-900 flex flex-col items-center relative z-10">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DonorID:${profile.id}|Group:${profile.donor_profile?.blood_group}`}
                                    alt="QR Code"
                                    className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-xl border-4 border-slate-50"
                                />
                                <div className="text-center w-full">
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{profile.username}</p>
                                    <p className="text-sm font-bold text-red-600 mb-2">{profile.donor_profile?.blood_group} Blood Group</p>
                                    <div className="w-full h-px bg-slate-100 my-3" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Emergency Contact</p>
                                    <p className="text-sm font-bold text-slate-700">{profile.phone_number || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Detailed Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                        {/* Core Contact */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-red-600" /> Basic Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="email" name="email" value={profile.email} onChange={handleChange} className="input-premium pl-12 text-sm font-semibold" placeholder="email@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" name="phone_number" value={profile.phone_number || ''} onChange={handleChange} className="input-premium pl-12 text-sm font-semibold" placeholder="+1 234 567 890" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Donor Specifics */}
                        {(profile.role === 'DONOR' || profile.role === 'PATIENT') && (
                            <div className="space-y-6 pt-10 border-t border-slate-50">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Droplet className="w-5 h-5 text-red-600" /> Medical & Logistics
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Blood Group</label>
                                        <select
                                            name="donor_profile.blood_group"
                                            value={profile.donor_profile?.blood_group || ''}
                                            onChange={handleChange}
                                            className="input-premium text-sm font-bold bg-white"
                                        >
                                            <option value="">Select Group</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Last Donation</label>
                                        <Calendar className="absolute left-6 mt-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                                        <input
                                            type="date"
                                            name="donor_profile.last_donation_date"
                                            value={profile.donor_profile?.last_donation_date || ''}
                                            onChange={handleChange}
                                            className="input-premium pl-12 text-sm font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Geo-Discovery (Map Location)</label>
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Required for Matching</span>
                                    </div>
                                    <LocationPicker
                                        value={profile.donor_profile.latitude ? [profile.donor_profile.latitude, profile.donor_profile.longitude] : null}
                                        onChange={(coords) => setProfile(prev => ({
                                            ...prev,
                                            donor_profile: {
                                                ...prev.donor_profile,
                                                latitude: coords.latitude,
                                                longitude: coords.longitude
                                            }
                                        }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Organ Donation Pledges */}
                        {profile.role === 'DONOR' && (
                            <div className="space-y-6 pt-10 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-600" /> Organ Pledge Status
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowPledgeModal(true)}
                                        className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                                    >
                                        + New Pledge
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {profile.organ_pledges?.length > 0 ? profile.organ_pledges.map((pledge, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Pledged: {pledge.organ_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Family Contact: {pledge.family_contact_name}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Active</div>
                                        </div>
                                    )) : (
                                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                                            <Heart className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">No active pledges found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-10 border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full btn-premium py-5 flex items-center justify-center gap-3 text-lg"
                            >
                                <Save className="w-6 h-6" />
                                {updating ? 'Syncing Profile...' : 'Update Records'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Organ Pledge Modal */}
            {showPledgeModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowPledgeModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">New Life Pledge</h2>
                        <p className="text-sm text-slate-500 mb-8 font-medium">Commit to saving lives. Your family will be contacted to honor this pledge.</p>

                        <form onSubmit={handlePledgeSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Organ to Pledge</label>
                                <input type="text" name="organ_name" value={pledgeData.organ_name} onChange={handlePledgeChange} className="input-premium text-sm font-bold" placeholder="e.g. Kidney, Cornea, Heart" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Family Contact Name</label>
                                <input type="text" name="family_contact_name" value={pledgeData.family_contact_name} onChange={handlePledgeChange} className="input-premium text-sm font-bold" placeholder="Full Name" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Family Contact Phone</label>
                                <input type="text" name="family_contact_phone" value={pledgeData.family_contact_phone} onChange={handlePledgeChange} className="input-premium text-sm font-bold" placeholder="+1..." required />
                            </div>

                            <button type="submit" className="w-full btn-premium py-4">Confirm Pledge</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Profile;
