import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MapModule from '../components/MapModule';
import { Search, Filter, Navigation, List, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MapPage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('requests/');
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req =>
        (req.hospital_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.blood_group || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Control Bar */}
            <div className="bg-white border-b border-slate-100 p-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search hospitals or blood groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-red-600/20 font-bold text-slate-900"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <MapIcon className="w-4 h-4" /> Map View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" /> List View
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow relative">
                {viewMode === 'map' ? (
                    <div className="absolute inset-0">
                        <MapModule
                            requests={filteredRequests}
                            fullScreen={true}
                            onMarkerClick={(req) => navigate(`/requests/${req.id}`)}
                        />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto p-10 grid gap-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
                                <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">Scanning network...</p>
                            </div>
                        ) : filteredRequests.map((req, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={req.id}
                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer"
                                onClick={() => navigate(`/requests/${req.id}`)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-black">
                                        {req.blood_group}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg">{req.hospital_name || 'Emergency Request'}</h3>
                                        <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5 mt-1">
                                            <Navigation className="w-4 h-4" />
                                            {req.distance ? `${req.distance} km away` : 'Active Broadcast'}
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2">
                                    Full Details <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;
