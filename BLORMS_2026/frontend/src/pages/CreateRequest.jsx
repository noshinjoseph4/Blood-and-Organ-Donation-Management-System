import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const CreateRequest = () => {
    const [formData, setFormData] = useState({
        request_type: 'BLOOD',
        blood_group: '',
        organ_name: '',
        latitude: '',
        longitude: '',
        is_urgent: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (_error) => {
                    console.error(_error);
                    alert("Could not fetch location.");
                }
            );
        } else {
            alert("Geolocation is not supported.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('requests/create/', formData);
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create request", error);
            alert("Failed to create request.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Create New Request</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-700">Request Type</label>
                    <select name="request_type" value={formData.request_type} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                        <option value="BLOOD">Blood</option>
                        <option value="ORGAN">Organ</option>
                    </select>
                </div>

                {formData.request_type === 'BLOOD' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organ Name</label>
                        <input type="text" name="organ_name" value={formData.organ_name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" placeholder="e.g. Kidney, Liver" />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                    </div>
                </div>
                <button type="button" onClick={handleLocation} className="flex items-center text-sm text-blue-600 hover:text-blue-500">
                    <MapPin className="h-4 w-4 mr-1" /> Get Current Location
                </button>

                <div className="flex items-center">
                    <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Mark as Urgent</label>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">Submit Request</button>
                </div>
            </form>
        </div>
    );
};

export default CreateRequest;
