import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Clock, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const response = await api.get('requests/?my_requests=true');
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch my requests", error);
            setMessage({ type: 'error', text: 'Failed to load your requests.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await api.delete(`requests/${id}/`);
            setRequests(requests.filter(req => req.id !== id));
            setMessage({ type: 'success', text: 'Request deleted successfully.' });
        } catch (error) {
            console.error("Failed to delete request", error);
            setMessage({ type: 'error', text: 'Failed to delete request.' });
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`requests/${id}/`, { status });
            setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
            setMessage({ type: 'success', text: `Request marked as ${status.toLowerCase()}.` });
        } catch (error) {
            console.error("Failed to update status", error);
            setMessage({ type: 'error', text: 'Failed to update status.' });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Requests</h1>
                    <p className="text-gray-500 mt-1">Manage and track your active donation requests.</p>
                </div>
                <Link to="/create-request" className="mt-4 md:mt-0 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200">
                    New Request
                </Link>
            </div>

            {message.text && (
                <div className={`p-4 mb-8 rounded-2xl flex items-center border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <CheckCircle className="h-5 w-5 mr-3" />
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-8 flex-grow">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${req.request_type === 'BLOOD' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {req.request_type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${req.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                                        req.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' :
                                            req.status === 'FULFILLED' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <Link to={`/requests/${req.id}`}>
                                <h3 className="text-2xl font-black text-gray-800 mb-6 hover:text-red-600 transition">
                                    {req.request_type === 'BLOOD' ? `Type ${req.blood_group}` : req.organ_name}
                                </h3>
                            </Link>

                            <div className="space-y-4 text-sm font-medium text-gray-500">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-3 opacity-50" />
                                    <span>Location Fixed</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-3 opacity-50" />
                                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {req.status === 'ACCEPTED' && (
                                <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-center gap-3 border border-blue-100">
                                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-xs font-bold text-blue-800">
                                        A donor has accepted your request. Please wait for the hospital to finalize the donation process.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 pt-0 flex gap-3">
                            {(req.status === 'PENDING' || req.status === 'ACCEPTED') && (
                                <button
                                    onClick={() => handleStatusUpdate(req.id, 'FULFILLED')}
                                    className="flex-1 bg-green-50 text-green-700 font-bold py-3 rounded-2xl hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" /> Mark Done
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(req.id)}
                                className="flex-1 flex justify-center items-center bg-red-50 text-red-700 py-2 rounded-md hover:bg-red-100 transition"
                            >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </button>
                        </div>
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">You haven't created any requests yet.</p>
                        <Link to="/create-request" className="mt-4 inline-block text-red-600 font-semibold hover:underline">Create your first request</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequests;
