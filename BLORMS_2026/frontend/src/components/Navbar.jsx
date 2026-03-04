import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <Heart className="h-8 w-8 text-red-600" />
                            <span className="ml-2 text-xl font-bold text-gray-800">VitalConnect</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Dashboard</Link>
                                <Link to="/map" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Global Map</Link>
                                <Link to="/appointments" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Appointments</Link>
                                <Link to="/my-requests" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">My Requests</Link>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <Link to="/audit-trails" className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md font-bold">Admin Dashboard</Link>
                                        <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="text-slate-900 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-md font-bold ml-2">Backend Admin</a>
                                    </>
                                )}
                                <div className="flex items-center ml-4 border-l pl-4">
                                    <Link to="/profile" className="flex items-center text-gray-800 hover:text-red-600 font-semibold mr-4">
                                        <User className="h-5 w-5 mr-2" />
                                        <span>{user.username}</span>
                                    </Link>
                                    <button onClick={handleLogout} title="Logout" className="flex items-center text-gray-600 hover:text-red-600">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Login</Link>
                                <Link to="/register" className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition">Register</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-800 focus:outline-none">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
                        <Link to="/" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Dashboard</Link>
                                <Link to="/map" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Map Search</Link>
                                <Link to="/appointments" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Book Appointment</Link>
                                <Link to="/my-requests" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">My Requests</Link>
                                <Link to="/profile" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Profile</Link>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <Link to="/audit-trails" className="block text-red-600 hover:text-red-700 px-3 py-2 rounded-md font-bold">Admin Dashboard</Link>
                                        <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="block text-slate-900 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-md font-bold">Backend Admin</a>
                                    </>
                                )}
                                <Link to="/create-request" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium font-bold">New Request</Link>
                                <button onClick={handleLogout} className="w-full text-left block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Login</Link>
                                <Link to="/register" className="block text-gray-600 hover:text-red-600 px-3 py-2 rounded-md font-medium">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
