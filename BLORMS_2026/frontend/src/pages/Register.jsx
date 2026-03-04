import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'DONOR',
        bloodGroup: '',
        hospitalName: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [error, setError] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            if (formData.role === 'DONOR') {
                payload.donor_profile = {
                    blood_group: formData.bloodGroup,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    address: formData.address
                };
            } else if (formData.role === 'HOSPITAL') {
                payload.hospital_profile = {
                    name: formData.hospitalName,
                    address: formData.address,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                };
            }

            await register(payload);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const msg = typeof err.response.data === 'string'
                    ? err.response.data
                    : Object.values(err.response.data).flat().join(' ');
                setError(msg || 'Registration failed.');
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tighter">Join the 2026 Ecosystem</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Selecting your role defines your specialized toolset</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-center text-sm bg-red-100 p-2 rounded">{error}</div>}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {['DONOR', 'HOSPITAL', 'PATIENT', 'BLOOD_BANK'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                                    className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${formData.role === role ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}
                                >
                                    {role.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="username" type="text" required className="appearance-none block w-full px-4 py-3 border border-slate-100 rounded-xl placeholder-slate-400 focus:ring-red-500 focus:border-red-500 sm:text-sm font-bold" placeholder="Username" onChange={handleChange} />
                            <input name="email" type="email" required className="appearance-none block w-full px-4 py-3 border border-slate-100 rounded-xl placeholder-slate-400 focus:ring-red-500 focus:border-red-500 sm:text-sm font-bold" placeholder="Email address" onChange={handleChange} />
                            <input name="password" type="password" required className="appearance-none block w-full px-4 py-3 border border-slate-100 rounded-xl placeholder-slate-400 focus:ring-red-500 focus:border-red-500 sm:text-sm font-bold" placeholder="Password" onChange={handleChange} />

                            {formData.role === 'DONOR' && (
                                <select name="bloodGroup" required className="block w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm font-bold" onChange={handleChange} defaultValue="">
                                    <option value="" disabled>Select Blood Group</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            )}

                            {formData.role === 'HOSPITAL' && (
                                <input name="hospitalName" type="text" required className="appearance-none block w-full px-4 py-3 border border-slate-100 rounded-xl placeholder-slate-400 focus:ring-red-500 focus:border-red-500 sm:text-sm font-bold" placeholder="Hospital/Facility Name" onChange={handleChange} />
                            )}
                        </div>

                        <input name="address" type="text" required className="appearance-none block w-full px-4 py-3 border border-slate-100 rounded-xl placeholder-slate-400 focus:ring-red-500 focus:border-red-500 sm:text-sm font-bold" placeholder="Address / Location Detail" onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Pin Your Physical Geo-Location</label>
                        <LocationPicker
                            value={formData.latitude ? [formData.latitude, formData.longitude] : null}
                            onChange={(coords) => setFormData(prev => ({
                                ...prev,
                                latitude: coords.latitude,
                                longitude: coords.longitude
                            }))}
                        />
                    </div>

                    <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-red-600 transition-all shadow-lg hover:shadow-red-600/30">
                        Initialize Onboarding
                    </button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-sm text-red-600 hover:text-red-500">Already have an account? Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
