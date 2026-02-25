"use client";
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Home, Navigation, MapPin, Ruler, Truck, Phone } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface MapComponentProps {
    sellerLocation?: { lat: number; lng: number };
    sellerPhone?: string;
    customerLocation?: { lat: number; lng: number };
    customerPhone?: string;
    currentStatus: string;
}

// Internal component to handle map bounds and view updates
function BoundsHandler({ sellerLoc, customerLoc, deliveryLoc, targetPos }: { sellerLoc?: any, customerLoc?: any, deliveryLoc?: [number, number], targetPos: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const isValid = (loc: any) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng) && (loc.lat !== 0 || loc.lng !== 0);
        const isValidArr = (loc: any) => Array.isArray(loc) && loc.length === 2 && !isNaN(loc[0]) && !isNaN(loc[1]) && (loc[0] !== 0 || loc[1] !== 0);

        const points: [number, number][] = [];
        if (isValid(sellerLoc)) points.push([sellerLoc.lat, sellerLoc.lng]);
        if (isValid(customerLoc)) points.push([customerLoc.lat, customerLoc.lng]);
        if (isValidArr(deliveryLoc)) points.push(deliveryLoc as [number, number]);

        // Fit bounds if we have at least 2 points (e.g. Delivery + Seller)
        if (points.length >= 2) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
        } else if (isValidArr(deliveryLoc)) {
            // If only delivery pos is available, center on it
            map.setView(deliveryLoc!, 14);
        } else if (targetPos) {
            map.setView(targetPos, 14);
        }
    }, [map, sellerLoc, customerLoc, deliveryLoc, targetPos]);

    return null;
}

export default function MapComponent({ sellerLocation, sellerPhone, customerLocation, customerPhone, currentStatus }: MapComponentProps) {
    const defaultCenter: [number, number] = [23.0225, 72.5714]; // Ahmedabad
    const [targetPos, setTargetPos] = useState<[number, number]>(defaultCenter);
    const [deliveryPos, setDeliveryPos] = useState<[number, number] | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Track Delivery Partner Location
    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined' && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setDeliveryPos([position.coords.latitude, position.coords.longitude]);
                },
                (error) => console.error("Geolocation error:", error),
                { enableHighAccuracy: true, maximumAge: 10000 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const { sellerIcon, customerIcon, deliveryIcon } = useMemo(() => {
        const createCustomIcon = (icon: React.ReactNode, colorClass: string, isPulsing = false) => {
            if (typeof window === 'undefined' || !L) return null;
            return L.divIcon({
                html: renderToStaticMarkup(
                    <div className={`p-2 rounded-full shadow-lg border-2 border-white text-white ${colorClass} transform hover:scale-110 transition-transform duration-200 flex items-center justify-center ${isPulsing ? 'animate-pulse' : ''}`}>
                        {icon}
                    </div>
                ),
                className: 'custom-map-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20],
            });
        };

        return {
            sellerIcon: createCustomIcon(<Store size={20} />, 'bg-orange-600'),
            customerIcon: createCustomIcon(<Home size={20} />, 'bg-green-600'),
            deliveryIcon: createCustomIcon(<Truck size={20} />, 'bg-blue-600', true)
        };
    }, []);

    useEffect(() => {
        const isValidCoordinate = (loc: any) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng);

        if (currentStatus === 'out_for_pickup' && isValidCoordinate(sellerLocation)) {
            setTargetPos([sellerLocation!.lat, sellerLocation!.lng]);
        } else if (currentStatus === 'picked_up' && isValidCoordinate(customerLocation)) {
            setTargetPos([customerLocation!.lat, customerLocation!.lng]);
        }
    }, [currentStatus, sellerLocation, customerLocation]);

    const isValidCoord = (loc: any) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng) && (loc.lat !== 0 || loc.lng !== 0);

    if (!isMounted) {
        return <div className="h-[400px] md:h-[500px] bg-gray-100 flex items-center justify-center rounded-3xl animate-pulse">Initializing Map View...</div>;
    }

    const hasBoth = isValidCoord(sellerLocation) && isValidCoord(customerLocation);

    return (
        <div className="relative h-[400px] md:h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 group">
            <style jsx global>{`
                .leaflet-popup-content-wrapper { border-radius: 1.5rem; padding: 0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #f1f5f9; }
                .leaflet-popup-content { margin: 0 !important; width: 260px !important; }
                .leaflet-popup-tip-container { display: none; }
                .leaflet-container { height: 100%; width: 100%; background: #f8fafc; }
            `}</style>

            <MapContainer
                center={targetPos}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Delivery Partner Marker (YOU) */}
                {deliveryPos && deliveryIcon && (
                    <>
                        <Circle center={deliveryPos} radius={200} pathOptions={{ fillOpacity: 0.1, color: '#2563eb', fillColor: '#2563eb' }} />
                        <Marker position={deliveryPos} icon={deliveryIcon as any}>
                            <Popup>
                                <div className="p-4 bg-blue-600 text-white font-bold text-center rounded-t-xl">
                                    Your Location
                                </div>
                                <div className="p-4 bg-white text-xs text-gray-600">
                                    Live tracking active. You are moving towards the {currentStatus === 'picked_up' ? 'Customer' : 'Seller'}.
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {isValidCoord(sellerLocation) && sellerIcon && (
                    <Marker position={[sellerLocation!.lat, sellerLocation!.lng]} icon={sellerIcon as any}>
                        <Popup>
                            <div className="flex flex-col">
                                <div className="bg-orange-600 p-4 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Store size={16} className="text-orange-100" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-100 italic">Pickup Origin</span>
                                    </div>
                                    <h4 className="font-black text-lg leading-tight italic">Assigned Pharmacy</h4>
                                </div>
                                <div className="p-4 bg-white space-y-3">
                                    {sellerPhone && (
                                        <a
                                            href={`tel:${sellerPhone}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl text-xs font-black hover:bg-orange-100 transition-all no-underline border border-orange-100"
                                        >
                                            <Phone size={14} /> CALL SELLER: {sellerPhone}
                                        </a>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${sellerLocation!.lat},${sellerLocation!.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all no-underline"
                                    >
                                        <Navigation size={14} /> NAVIGATE TO PICKUP
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {isValidCoord(customerLocation) && customerIcon && (
                    <Marker position={[customerLocation!.lat, customerLocation!.lng]} icon={customerIcon as any}>
                        <Popup>
                            <div className="flex flex-col">
                                <div className="bg-green-600 p-4 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Home size={16} className="text-green-100" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-100 italic">Destination</span>
                                    </div>
                                    <h4 className="font-black text-lg leading-tight italic">Patient Location</h4>
                                </div>
                                <div className="p-4 bg-white space-y-3">
                                    {customerPhone && (
                                        <a
                                            href={`tel:${customerPhone}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl text-xs font-black hover:bg-green-100 transition-all no-underline border border-green-100"
                                        >
                                            <Phone size={14} /> CALL CUSTOMER: {customerPhone}
                                        </a>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${customerLocation!.lat},${customerLocation!.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-green-600 transition-all no-underline"
                                    >
                                        <Navigation size={14} /> NAVIGATE TO DELIVERY
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route from Delivery to Pickup/Target */}
                {deliveryPos && targetPos && (
                    <Polyline
                        positions={[deliveryPos, targetPos]}
                        pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '5, 10', opacity: 0.5 }}
                    />
                )}

                {hasBoth && (
                    <Polyline
                        positions={[[sellerLocation!.lat, sellerLocation!.lng], [customerLocation!.lat, customerLocation!.lng]]}
                        pathOptions={{ color: '#f97316', weight: 4, dashArray: '10, 10', opacity: 0.6 }}
                    />
                )}

                <BoundsHandler
                    sellerLoc={sellerLocation}
                    customerLoc={customerLocation}
                    deliveryLoc={deliveryPos || undefined}
                    targetPos={targetPos}
                />
            </MapContainer>

            {/* Floating Live Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Live Tracking Active</span>
            </div>

            {hasBoth && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-[1000] bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl premium-shadow border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                        <Ruler className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[8px] sm:text-[10px] font-black text-secondary uppercase tracking-widest">Optimized Route</p>
                        <p className="text-xs sm:text-sm font-black text-foreground truncate max-w-[150px] sm:max-w-none">Multi-point tracking active</p>
                    </div>
                </div>
            )}
        </div>
    );
}
