import { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair } from 'lucide-react';

// Reset marker defaults for Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? (
        <Marker position={position} icon={DefaultIcon} />
    ) : null;
};

const LocationPicker = ({ value, onChange }) => {
    const [position, setPosition] = useState(value || [23.8103, 90.4125]);

    const handlePositionChange = useCallback((newPos) => {
        setPosition(newPos);
        if (onChange) {
            onChange({
                latitude: newPos[0],
                longitude: newPos[1]
            });
        }
    }, [onChange]);

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newPos = [pos.coords.latitude, pos.coords.longitude];
                handlePositionChange(newPos);
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Selected Coordinates</p>
                        <p className="text-xs font-bold text-slate-700">
                            {position[0].toFixed(4)}, {position[1].toFixed(4)}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 transition-all active:scale-95"
                >
                    <Crosshair className="w-3.5 h-3.5" /> USE CURRENT
                </button>
            </div>

            <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker position={position} setPosition={handlePositionChange} />
                </MapContainer>
                <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/50 shadow-sm pointer-events-none">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Click on map to pick location</p>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
