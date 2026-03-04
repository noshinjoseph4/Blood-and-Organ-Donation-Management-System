import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Droplet, Heart, ShieldAlert } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SOSIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const RequestIcon = (type) => L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-6 h-6 ${type === 'BLOOD' ? 'bg-red-500' : 'bg-blue-500'} rounded-lg border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Component to handle auto-panning when data changes
const RecenterMap = ({ center }) => {
    const map = useMap();
    if (center) map.setView(center, map.getZoom());
    return null;
};

const MapModule = ({ requests = [], center, userLocation, onMarkerClick }) => {
    const defaultCenter = [23.8103, 90.4125]; // Default to Dhaka if no location
    const mapCenter = center || userLocation || defaultCenter;

    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner relative group">
            <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <RecenterMap center={center} />

                {/* User Mark */}
                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup className="premium-popup">
                            <div className="p-2 font-bold text-slate-900">Your Current Location</div>
                        </Popup>
                    </Marker>
                )}

                {/* Request Markers */}
                {requests.map(req => (
                    <Marker
                        key={req.id}
                        position={[req.latitude, req.longitude]}
                        icon={req.is_urgent ? SOSIcon : RequestIcon(req.request_type)}
                    >
                        <Popup className="premium-popup">
                            <div className="p-4 min-w-[200px] space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${req.request_type === 'BLOOD' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {req.request_type}
                                    </span>
                                    {req.is_urgent && (
                                        <span className="text-red-600 text-[8px] font-black uppercase flex items-center gap-1">
                                            <ShieldAlert size={10} /> SOS
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-black text-slate-900 leading-tight">
                                        {req.hospital_name || 'Emergency Location'}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                                        {req.blood_group || req.organ_name} Required
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-50">
                                    <button
                                        onClick={() => onMarkerClick && onMarkerClick(req)}
                                        className="w-full bg-slate-900 text-white text-[10px] font-black py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        VIEW DETAILS
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Premium Legend Overlay */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Map Legend</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-md shadow-red-200" />
                        <span className="text-[10px] font-bold text-slate-700">Urgent SOS</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-red-400 rounded-lg shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700">Blood Request</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-lg shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700">Organ Request</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapModule;
