import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, ChevronRight, Sparkles, ShieldAlert, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Appointments = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        hospital: '',
        appointment_date: '',
        notes: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            const response = await api.get('hospitals/');
            setHospitals(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({ ...prev, hospital: response.data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch hospitals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBooking(true);
        try {
            await api.post('appointments/', formData);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (error) {
            console.error("Booking failed", error);
            alert("Booking failed. Please try again.");
        } finally {
            setBooking(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Rescue Network 2026</span>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Book Your Impact Slot</h1>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto">Choose your preferred medical facility and timing to contribute to the global life-saving ecosystem.</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-3">
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-8"
                        >
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Select Medical Facility</label>
                                <div className="grid gap-4">
                                    {hospitals.map((h) => (
                                        <button
                                            key={h.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, hospital: h.id })}
                                            className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${formData.hospital === h.id ? 'border-red-600 bg-red-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.hospital === h.id ? 'bg-red-600 text-white' : 'bg-white text-slate-400'}`}>
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-slate-900">{h.name}</p>
                                                    <p className="text-xs text-slate-500">{h.address}</p>
                                                </div>
                                            </div>
                                            {formData.hospital === h.id && <CheckCircle2 className="w-6 h-6 text-red-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Appointment Date & Time</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            required
                                            name="appointment_date"
                                            value={formData.appointment_date}
                                            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Additional Notes</label>
                                    <input
                                        type="text"
                                        placeholder="Any medical concerns?"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={booking || success}
                                className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${success ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-red-600'}`}
                            >
                                {booking ? 'Processing...' : success ? <><CheckCircle2 className="w-7 h-7" /> Booked Successfully</> : 'Confirm Appointment'}
                            </button>
                        </motion.form>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 blur-3xl" />
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><Sparkles className="text-amber-400" /> Hero Perks</h3>
                            <div className="space-y-6">
                                {[
                                    { t: "Elite Certification", d: "Digital NFT certificate for every donation.", icon: ShieldAlert },
                                    { t: "Health Score +20", d: "Boost your medical profile rating.", icon: Activity },
                                    { t: "Priority Lane", d: "Zero wait time at the facility.", icon: Zap }
                                ].map((perk, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                                            <perk.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{perk.t}</p>
                                            <p className="text-xs text-slate-400">{perk.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" /> Preparation Guide
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Stay hydrated (drink 500ml of water)",
                                    "Eat a healthy, low-fat meal before",
                                    "Carry your digital ID for KYC",
                                    "Avoid alcohol 24hrs prior"
                                ].map((step, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments;
