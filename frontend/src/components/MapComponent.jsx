import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (hazardLevel) => {
  const colors = {
    LOW: '#10b981',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${colors[hazardLevel] || '#06b6d4'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px ${colors[hazardLevel]}40, 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">
        ${hazardLevel === 'CRITICAL' ? '!' : hazardLevel[0]}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const MapComponent = ({ detections = [], center = [15.2993, 74.1240], zoom = 6, height = '600px' }) => {
  const validDetections = detections.filter(d => d.latitude && d.longitude);
  
  const mapCenter = validDetections.length > 0 
    ? [validDetections[0].latitude, validDetections[0].longitude]
    : center;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validDetections.map((detection) => (
          <Marker
            key={detection._id}
            position={[detection.latitude, detection.longitude]}
            icon={createCustomIcon(detection.hazardLevel)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-slate-900">{detection.objectType}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    detection.hazardLevel === 'CRITICAL' ? 'bg-red-500 text-white' :
                    detection.hazardLevel === 'HIGH' ? 'bg-orange-500 text-white' :
                    detection.hazardLevel === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {detection.hazardLevel}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-medium">Confidence:</span> {(detection.confidence * 100).toFixed(1)}%</p>
                  <p><span className="font-medium">Hazard Score:</span> {detection.hazardScore}/100</p>
                  <p><span className="font-medium">Dimensions:</span> {detection.estimatedWidthMeters}m × {detection.estimatedLengthMeters}m</p>
                  <p className="font-mono text-[11px]">{detection.latitude.toFixed(5)}, {detection.longitude.toFixed(5)}</p>
                  {detection.mission?.name && (
                    <p><span className="font-medium">Mission:</span> {detection.mission.name}</p>
                  )}
                </div>
                
                <Link
                  to={`/anomalies/${detection._id}`}
                  className="mt-3 block w-full py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium text-center hover:bg-slate-800"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
