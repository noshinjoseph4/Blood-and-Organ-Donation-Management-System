import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Droplet, Activity, MapPin, Clock, Navigation, User, ArrowLeft, Phone, Share2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RequestDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                // Get user's profile to include lat/lng for distance calculation
                let profileParams = '';
                if (user?.donor_profile?.latitude) {
                    profileParams = `?lat=${user.donor_profile.latitude}&lng=${user.donor_profile.longitude}`;
                }
                const response = await api.get(`requests/${id}/${profileParams}`);
                setRequest(response.data);
            } catch (error) {
                console.error("Failed to fetch request details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id, user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
    );

    if (!request) return (
        <div className="max-w-3xl mx-auto py-20 text-center">
            <AlertCircle className="h-16 w-16 text-gray-200 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-400">Request not found</h2>
            <Link to="/dashboard" className="text-red-600 mt-4 inline-block font-bold">Return to Dashboard</Link>
        </div>
    );

    const isOwner = user?.id === request.user;
    const isDonor = user?.role === 'DONOR';
    const isMatchingBlood = isDonor && user?.donor_profile?.blood_group === request.blood_group;

    const handleAcceptRequest = async () => {
        if (!window.confirm("Are you sure you want to accept this request? An appointment will be scheduled for you.")) return;
        setAccepting(true);
        try {
            const response = await api.post(`requests/${request.id}/accept/`);
            alert(response.data.message);
            // Refresh request data to show ACCEPTED status
            setRequest(prev => ({ ...prev, status: 'ACCEPTED' }));
        } catch (error) {
            console.error("Failed to accept request", error);
            alert(error.response?.data?.error || "Failed to accept the request.");
        } finally {
            setAccepting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-red-600 transition mb-10 font-bold group">
                <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition" /> Back
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                {/* Header Decoration */}
                <div className={`h-4 ${request.request_type === 'BLOOD' ? 'bg-red-600' : 'bg-blue-600'}`}></div>

                <div className="p-10 md:p-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${request.request_type === 'BLOOD' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {request.request_type}
                                </span>
                                {request.is_urgent && (
                                    <span className="bg-red-600 text-white px-4 py-1.5 text-xs font-black rounded-full tracking-widest animate-pulse">URGENT</span>
                                )}
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${request.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                    {request.status}
                                </span>
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                                {request.request_type === 'BLOOD' ? `Blood Type ${request.blood_group}` : request.organ_name}
                            </h1>
                        </div>

                        {request.distance !== null && (
                            <div className="bg-red-50 px-6 py-4 rounded-3xl text-red-600 flex items-center shadow-sm">
                                <Navigation className="h-6 w-6 mr-3" />
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Proximity</div>
                                    <div className="text-xl font-black">{request.distance} km away</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        <div className="space-y-8">
                            <div className="flex items-start">
                                <div className="bg-gray-50 p-4 rounded-2xl mr-5">
                                    <User className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Requester</div>
                                    <div className="text-xl font-bold text-gray-800">{request.user_username}</div>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-gray-50 p-4 rounded-2xl mr-5">
                                    <Clock className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Posted On</div>
                                    <div className="text-xl font-bold text-gray-800">{new Date(request.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start">
                                <div className="bg-gray-50 p-4 rounded-2xl mr-5">
                                    <MapPin className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Location</div>
                                    <div className="text-xl font-bold text-gray-800 truncate max-w-[200px]">Hospital / Medical Center</div>
                                    <div className="text-sm text-gray-400 font-medium">Lat: {request.latitude}, Lng: {request.longitude}</div>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-gray-50 p-4 rounded-2xl mr-5">
                                    {request.request_type === 'BLOOD' ? <Droplet className="h-6 w-6 text-red-500" /> : <Activity className="h-6 w-6 text-blue-500" />}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Requirement</div>
                                    <div className="text-xl font-bold text-gray-800">{request.request_type === 'BLOOD' ? 'Immediate Transfusion' : 'Transplant Waiting List'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-100">
                        {isOwner ? (
                            <Link to="/my-requests" className="flex-1 bg-gray-900 text-white text-center py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl">
                                Manage My Request
                            </Link>
                        ) : (
                            <>
                                {isDonor && isMatchingBlood && request.status === 'PENDING' && (
                                    <button
                                        onClick={handleAcceptRequest}
                                        disabled={accepting}
                                        className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition shadow-xl flex items-center justify-center disabled:opacity-50"
                                    >
                                        <Activity className="h-5 w-5 mr-3" />
                                        {accepting ? 'Accepting...' : 'Accept / Willing to Donate'}
                                    </button>
                                )}
                                <button className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition shadow-xl flex items-center justify-center">
                                    <Phone className="h-5 w-5 mr-3" /> Contact Requester
                                </button>
                                <button className="flex-1 bg-white text-gray-800 border-2 border-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-50 transition flex items-center justify-center">
                                    <Share2 className="h-5 w-5 mr-3" /> Share Request
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
