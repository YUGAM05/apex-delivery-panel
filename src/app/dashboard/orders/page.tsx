'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {
    Truck,
    MapPin,
    Phone,
    Package,
    CheckCircle2,
    Clock,
    Navigation,
    TrendingUp,
    ArrowUpRight,
    Loader2,
    CheckCircle,
    User,
    Store
} from 'lucide-react';

export default function DeliveryOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('active');
    const [stats, setStats] = useState({ assigned: 0, delivered: 0, inTransit: 0 });
    const locationInterval = useRef<any>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders/delivery', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);

            // Stats
            const today = new Date().toDateString();
            const s = res.data.reduce((acc: any, curr: any) => {
                if (new Date(curr.createdAt).toDateString() === today) acc.assigned++;
                if (curr.status === 'delivered') acc.delivered++;
                if (curr.status === 'in_transit') acc.inTransit++;
                return acc;
            }, { assigned: 0, delivered: 0, inTransit: 0 });
            setStats(s);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/delivery/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
            if (status === 'delivered') stopLocationSharing();
        } catch (error) {
            alert('Status update failed');
        }
    };

    const startLocationSharing = (orderId: string) => {
        if (!navigator.geolocation) return alert('Geolocation not supported');

        // Immediate call
        shareLocation(orderId);

        locationInterval.current = setInterval(() => {
            shareLocation(orderId);
        }, 30000); // 30 seconds

        alert('Live location sharing started!');
    };

    const shareLocation = (orderId: string) => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:5000/api/orders/delivery/${orderId}/status`, {
                    delivery_location: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    }
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Location sync failed');
            }
        });
    };

    const stopLocationSharing = () => {
        if (locationInterval.current) {
            clearInterval(locationInterval.current);
            locationInterval.current = null;
        }
    };

    const filteredOrders = orders.filter(o =>
        tab === 'active' ? ['out_for_pickup', 'in_transit'].includes(o.status) : o.status === 'delivered'
    );

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-600" /></div>;

    return (
        <div className="space-y-8 p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1 flex items-center gap-3">
                        <Truck className="text-orange-600" size={32} /> Dispatch Dashboard
                    </h1>
                    <p className="text-gray-500 font-medium">Get ready to deliver medicine and save lives.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setTab('active')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Active Deliveries
                    </button>
                    <button
                        onClick={() => setTab('completed')}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'completed' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Success History
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Assigned Today" value={stats.assigned} icon={<Clock size={24} />} color="bg-blue-50 text-blue-600" />
                <StatCard label="In Transit" value={stats.inTransit} icon={<Truck size={24} />} color="bg-orange-50 text-orange-600" />
                <StatCard label="Target Reached" value={stats.delivered} icon={<CheckCircle2 size={24} />} color="bg-green-50 text-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref</p>
                                    <h3 className="text-2xl font-black text-gray-900">#DX-{order._id.slice(-6).toUpperCase()}</h3>
                                </div>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'in_transit' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {/* Pickup Card */}
                                <div className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold relative z-10 border-2 border-orange-100"><Store size={20} /></div>
                                        <div className="w-0.5 h-12 bg-gray-100 my-1"></div>
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pick up from</p>
                                        <p className="font-black text-gray-800 text-lg">{order.seller_id?.pharmacy_name || 'Partner Pharmacy'}</p>
                                        <p className="text-sm font-medium text-gray-400 mt-1">{order.seller_id?.address?.street}, {order.seller_id?.address?.city}</p>
                                    </div>
                                </div>

                                {/* Drop Card */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold border-2 border-green-100"><MapPin size={20} /></div>
                                    <div className="pt-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deliver to</p>
                                        <p className="font-black text-gray-800 text-lg">{order.user_id?.name}</p>
                                        <p className="text-sm font-medium text-gray-400 mt-1">{order.delivery_address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-y border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2.5 rounded-xl"><Package size={18} className="text-gray-500" /></div>
                                    <span className="font-bold text-gray-700">{order.medicines.length} Item for delivery</span>
                                </div>
                                <a href={`tel:${order.user_id?.phone}`} className="flex items-center gap-2 text-orange-600 font-black text-sm hover:underline">
                                    <Phone size={16} /> Contact Patient
                                </a>
                            </div>

                            {tab === 'active' && (
                                <div className="space-y-4">
                                    {order.status === 'out_for_pickup' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'in_transit')}
                                            className="w-full bg-gray-900 hover:bg-orange-600 text-white py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <TrendingUp size={24} /> Picked Up & Start Delivery
                                        </button>
                                    )}
                                    {order.status === 'in_transit' && (
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center justify-center gap-3"
                                            >
                                                <CheckCircle size={24} /> Confirm Delivered
                                            </button>
                                            <button
                                                onClick={() => startLocationSharing(order._id)}
                                                className="flex items-center justify-center gap-2 py-3 text-orange-600 font-bold hover:bg-orange-50 rounded-xl transition-all"
                                            >
                                                <Navigation size={16} /> Share Live Location
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredOrders.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center grayscale opacity-30">
                        <Truck size={80} />
                        <p className="mt-6 text-xl font-black">No active missions found.</p>
                        <p className="font-medium">Check back soon for new assignments.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-orange-200 transition-colors">
            <div className={`p-5 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
            </div>
        </div>
    );
}
