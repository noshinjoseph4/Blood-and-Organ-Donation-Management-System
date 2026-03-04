import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationWrapper from './components/NotificationWrapper';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateRequest = lazy(() => import('./pages/CreateRequest'));
const Profile = lazy(() => import('./pages/Profile'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const RequestDetail = lazy(() => import('./pages/RequestDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AuditTrails = lazy(() => import('./pages/AuditTrails'));
const Appointments = lazy(() => import('./pages/Appointments'));
const MapPage = lazy(() => import('./pages/MapPage'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationWrapper>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/audit-trails" element={<AuditTrails />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-request" element={<CreateRequest />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-requests" element={<MyRequests />} />
                  <Route path="/requests/:id" element={<RequestDetail />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/map" element={<MapPage />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </Router>
      </NotificationWrapper>
    </AuthProvider>
  );
}

export default App;
