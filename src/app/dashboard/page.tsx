"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Truck, CheckCircle, Clock, MapPin, Package, User as UserIcon, Phone, Map as MapIcon } from "lucide-react";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-2xl">Loading Map...</div>
});

export default function DeliveryDashboard() {
    return (
        <Suspense fallback={<div>Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryView = searchParams.get('view') as 'active' | 'available' | 'history' | null;

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        currentDeliveries: 0,
        completedDeliveries: 0,
        earnings: 0
    });
    const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
    const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [viewType, setViewType] = useState<'active' | 'available' | 'history'>(queryView || 'active');

    // Sync state with URL if queryView changes
    useEffect(() => {
        if (queryView && queryView !== viewType) {
            setViewType(queryView);
        }
    }, [queryView]);

    // 🔄 Auto-select Logic for Tab Switching
    useEffect(() => {
        if (viewType === 'available') {
            if (availableDeliveries.length > 0) setActiveOrder(availableDeliveries[0]);
            else setActiveOrder(null);
        } else if (viewType === 'active') {
            const pending = myDeliveries.find((o: any) => o.orderStatus !== 'delivered');
            setActiveOrder(pending || null);
        } else if (viewType === 'history') {
            const history = myDeliveries.find((o: any) => o.orderStatus === 'delivered');
            setActiveOrder(history || null);
        }
    }, [viewType]);

    const fetchData = async () => {
        try {
            const [statsRes, myDeliveriesRes, availableDeliveriesRes] = await Promise.all([
                api.get('/delivery/dashboard'),
                api.get('/delivery/my-deliveries'),
                api.get('/delivery/available')
            ]);

            setStats(statsRes.data.stats);
            setMyDeliveries(myDeliveriesRes.data);
            setAvailableDeliveries(availableDeliveriesRes.data);

            // Sync activeOrder with fresh data
            if (activeOrder) {
                const updatedActive = myDeliveriesRes.data.find((o: any) => o._id === activeOrder._id);
                const updatedAvailable = availableDeliveriesRes.data.find((o: any) => o._id === activeOrder._id);

                if (updatedActive) {
                    setActiveOrder(updatedActive);
                } else if (updatedAvailable) {
                    setActiveOrder(updatedAvailable);
                }
            } else {
                // Auto-select based on view type if no order is active
                if (viewType === 'available' && availableDeliveriesRes.data.length > 0) {
                    setActiveOrder(availableDeliveriesRes.data[0]);
                } else if (viewType === 'active' && myDeliveriesRes.data.length > 0) {
                    const pending = myDeliveriesRes.data.find((o: any) => o.orderStatus !== 'delivered');
                    if (pending) setActiveOrder(pending);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();

        // 🛰️ Real-time Location Reporting
        let watchId: number;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    try {
                        await api.put('/delivery/location', {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    } catch (err) {
                        console.error("Location sync failed:", err);
                    }
                },
                (error) => console.error("Geolocation watch error:", error),
                { enableHighAccuracy: true, maximumAge: 10000 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const handleUpdateStatus = async (orderId: string, action: 'pickup' | 'deliver' | 'accept') => {
        try {
            if (action === 'pickup') {
                await api.put(`/delivery/pickup/${orderId}`);
            } else if (action === 'deliver') {
                await api.put(`/delivery/deliver/${orderId}`);
            } else if (action === 'accept') {
                await api.put(`/delivery/accept/${orderId}`);
                setViewType('active'); // Switch to active view after accepting
            }
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const seller = activeOrder?.items[0]?.product?.seller;
    const customer = activeOrder?.user;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">Logistics Command</span>
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    </div>
                    <h2 className="text-6xl font-extrabold text-foreground tracking-tighter leading-[0.9]">
                        Fleet <span className="text-primary italic">Intelligence</span>
                    </h2>
                    <p className="text-secondary font-semibold text-lg mt-6 max-w-lg">
                        Real-time trajectory tracking and multi-mission orchestration for your pharmacy distribution network.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => fetchData()}
                        className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:rotate-180 transition-all duration-700 active:scale-95 group"
                    >
                        <Clock className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="bg-primary hover:bg-primary-hover p-5 rounded-3xl shadow-2xl shadow-primary/30 group cursor-pointer hover:scale-105 active:scale-95 transition-all">
                        <Truck className="w-9 h-9 text-white group-hover:-translate-y-1 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                <StatCard
                    title="Active Missions"
                    value={stats.currentDeliveries}
                    icon={<Truck className="w-8 h-8 text-white" />}
                    color="bg-primary"
                    percentage="+12%"
                    trend="up"
                    bg="bg-primary/10"
                />
                <StatCard
                    title="Mission Success"
                    value={stats.completedDeliveries}
                    icon={<CheckCircle className="w-8 h-8 text-white" />}
                    color="bg-emerald-500"
                    percentage="+5%"
                    trend="up"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Revenue Yield"
                    value={`₹${stats.earnings}`}
                    icon={<Package className="w-8 h-8 text-white" />}
                    color="bg-blue-600"
                    percentage="+24%"
                    trend="up"
                    bg="bg-blue-600/10"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Map Section */}
                <div className="xl:col-span-8 space-y-10">
                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[3rem] premium-shadow overflow-hidden border border-white/20 dark:border-slate-800 relative group">
                        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
                            <div>
                                <h3 className="text-3xl font-black text-foreground flex items-center gap-4 tracking-tighter">
                                    <MapIcon className="w-8 h-8 text-primary" />
                                    {viewType === 'active' ? 'Tactical Map' : viewType === 'available' ? 'Sector Preview' : 'Mission History'}
                                </h3>
                                <p className="text-secondary text-sm font-bold mt-2 uppercase tracking-widest opacity-60">
                                    {viewType === 'active' ? 'Precise trajectory navigation' : viewType === 'available' ? 'Area analysis for new opportunities' : 'Archived route logs and completion data'}
                                </p>
                            </div>
                            {activeOrder && (
                                <div className="flex flex-col items-end">
                                    <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${activeOrder.orderStatus === 'out_for_pickup' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                        activeOrder.orderStatus === 'picked_up' ? 'bg-blue-600 text-white shadow-blue-600/20' :
                                            activeOrder.orderStatus === 'confirmed' ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-900 text-white shadow-slate-900/20'
                                        }`}>
                                        {activeOrder.orderStatus.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="relative min-h-[550px]">
                            <MapComponent
                                sellerLocation={seller?.location}
                                sellerPhone={seller?.phone}
                                customerLocation={
                                    (activeOrder?.shippingLocation?.lat && activeOrder?.shippingLocation?.lng)
                                        ? activeOrder.shippingLocation
                                        : (customer?.location?.lat && customer?.location?.lng)
                                            ? customer.location
                                            : undefined
                                }
                                customerPhone={activeOrder?.shippingAddress?.phone || customer?.phone}
                                currentStatus={viewType === 'available' ? 'out_for_pickup' : activeOrder?.orderStatus}
                            />
                        </div>

                        {/* Phase Overlays & Action Buttons - Moved Below Map */}
                        <div className="relative p-8 z-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-t border-white/20 dark:border-slate-800">
                            <div className="glass-card p-6 rounded-[2.5rem] flex flex-col xl:flex-row flex-wrap justify-between items-center gap-8 border border-white/30 shadow-sm bg-white/40">
                                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full xl:w-auto flex-1 min-w-0 pr-4 mask-gradient">
                                    {[
                                        { phase: '01', label: 'Pickup', status: 'out_for_pickup', icon: Package },
                                        { phase: '02', label: 'In-Transit', status: 'picked_up', icon: Truck },
                                        { phase: '03', label: 'Delivered', status: 'delivered', icon: CheckCircle }
                                    ].map((p, idx) => {
                                        const isActive = activeOrder?.orderStatus === p.status && viewType === 'active';
                                        return (
                                            <div key={idx} className="flex items-center gap-4 shrink-0">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${isActive
                                                    ? 'bg-primary text-white scale-110 shadow-2xl shadow-primary/40 ring-4 ring-primary/20'
                                                    : 'bg-white/50 text-slate-400'
                                                    }`}>
                                                    <p.icon className="w-7 h-7" />
                                                </div>
                                                <div className="block">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">PH-{p.phase}</p>
                                                    <p className={`text-sm font-black tracking-tight ${isActive ? 'text-foreground' : 'text-slate-400'}`}>{p.label}</p>
                                                </div>
                                                {idx < 2 && <div className="w-6 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-2" />}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="w-full xl:w-auto shrink-0">
                                    {activeOrder && viewType === 'active' && activeOrder.orderStatus === 'out_for_pickup' && (
                                        <button
                                            onClick={() => handleUpdateStatus(activeOrder._id, 'pickup')}
                                            className="w-full px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 uppercase text-xs tracking-widest"
                                        >
                                            Confirm Pickup <Package className="w-5 h-5" />
                                        </button>
                                    )}

                                    {activeOrder && viewType === 'active' && activeOrder.orderStatus === 'picked_up' && (
                                        <button
                                            onClick={() => handleUpdateStatus(activeOrder._id, 'deliver')}
                                            className="w-full px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 uppercase text-xs tracking-widest"
                                        >
                                            Mission Complete <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}

                                    {activeOrder && viewType === 'available' && (
                                        <button
                                            onClick={() => handleUpdateStatus(activeOrder._id, 'accept')}
                                            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 uppercase text-xs tracking-widest"
                                        >
                                            Accept Mission <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Details Card */}
                    {activeOrder && (
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] premium-shadow p-12 border border-white/20 dark:border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                                <Package className="w-64 h-64 text-slate-900 dark:text-white" />
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12 relative z-10">
                                <div className="space-y-6">
                                    <h4 className="font-black text-primary uppercase text-[10px] tracking-[0.4em]">
                                        {viewType === 'active' ? 'MISSION MANIFEST' : 'SECTOR SPECIFICATIONS'}
                                    </h4>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                                            <Package className="w-10 h-10 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-foreground tracking-tighter">Order #{activeOrder._id.slice(-6).toUpperCase()}</p>
                                            <p className="text-secondary font-semibold text-lg">{activeOrder.items[0]?.name} <span className="text-primary italic">x{activeOrder.items[0]?.quantity}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-right min-w-[280px] shadow-2xl border border-slate-800">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Projected Earnings</p>
                                    <p className="text-5xl font-black text-white mb-4 tabular-nums">
                                        ₹{activeOrder.deliveryEarning || activeOrder.estimatedEarning || 0}
                                    </p>
                                    <div className="flex items-center justify-end gap-3 text-primary">
                                        <MapPin className="w-4 h-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">{activeOrder.deliveryDistance || activeOrder.estimatedDistance || 0} KM MISSION RANGE</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-6 bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="font-black text-foreground uppercase text-[10px] tracking-[0.3em]">Pickup Vector</p>
                                    </div>
                                    <div>
                                        <p className="font-black text-xl text-foreground mb-2">{seller?.name || 'Authorized Pharmacy'}</p>
                                        <p className="text-secondary font-medium leading-relaxed">{seller?.address?.street}, {seller?.address?.city}</p>
                                        {seller?.phone && (
                                            <a
                                                href={`tel:${seller.phone}`}
                                                className="mt-6 flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 p-3 rounded-xl transition-all w-fit"
                                            >
                                                <Phone className="w-4 h-4" /> Contact Dispatch: {seller.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6 bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-emerald-500/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="font-black text-foreground uppercase text-[10px] tracking-[0.3em]">Delivery Target</p>
                                    </div>
                                    <div>
                                        <p className="font-black text-xl text-foreground mb-2">{activeOrder.shippingAddress?.fullName || 'End-User'}</p>
                                        <p className="text-secondary font-medium leading-relaxed">{activeOrder.shippingAddress?.addressLine1}, {activeOrder.shippingAddress?.city}</p>
                                        {(activeOrder.shippingAddress?.phone || customer?.phone) && (
                                            <a
                                                href={`tel:${activeOrder.shippingAddress?.phone || customer?.phone}`}
                                                className="mt-6 flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/5 p-3 rounded-xl transition-all w-fit"
                                            >
                                                <Phone className="w-4 h-4" /> Contact Target: {activeOrder.shippingAddress?.phone || customer?.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Tabs and Lists */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] premium-shadow p-2 border border-slate-100 dark:border-slate-800 flex gap-2">
                        <button
                            onClick={() => setViewType('active')}
                            className={`flex-1 py-5 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewType === 'active'
                                ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.05]'
                                : 'text-slate-400 hover:text-foreground'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setViewType('available')}
                            className={`flex-1 py-5 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${viewType === 'available'
                                ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.05]'
                                : 'text-slate-400 hover:text-foreground'
                                }`}
                        >
                            Scan
                            {availableDeliveries.length > 0 && (
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${viewType === 'available' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {availableDeliveries.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setViewType('history')}
                            className={`flex-1 py-5 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewType === 'history'
                                ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.05]'
                                : 'text-slate-400 hover:text-foreground'
                                }`}
                        >
                            Log
                        </button>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[3rem] premium-shadow p-10 border border-white/20 dark:border-slate-800">
                        <h3 className="text-2xl font-black text-foreground mb-10 flex items-center gap-4 tracking-tighter">
                            <span className="w-2.5 h-10 bg-primary rounded-full shadow-lg shadow-primary/20" />
                            {viewType === 'active' ? 'Deployment' : viewType === 'available' ? 'Intercepts' : 'History'}
                        </h3>

                        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                            {(
                                viewType === 'active'
                                    ? myDeliveries.filter(o => o.orderStatus !== 'delivered')
                                    : viewType === 'available'
                                        ? availableDeliveries
                                        : myDeliveries.filter(o => o.orderStatus === 'delivered')
                            ).map((order: any) => (
                                <div
                                    key={order._id}
                                    onClick={() => setActiveOrder(order)}
                                    className={`group p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden backdrop-blur-md ${activeOrder?._id === order._id
                                        ? 'border-primary bg-primary/[0.03] shadow-2xl scale-[1.02]'
                                        : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <p className="font-black text-foreground text-sm tracking-widest opacity-80 uppercase">#{order._id.slice(-6)}</p>
                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-sm ${activeOrder?._id === order._id ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-secondary border border-slate-100 dark:border-slate-800'
                                            }`}>
                                            {order.orderStatus.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <p className="text-lg font-black text-foreground line-clamp-1 mb-6 relative z-10 tracking-tight">
                                        {order.items[0]?.product?.name || 'Supply Kit'}
                                    </p>

                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-3 text-primary bg-primary/5 px-3 py-1.5 rounded-xl">
                                            <MapPin className="w-4 h-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">{order.shippingAddress?.city}</p>
                                        </div>
                                        <p className="text-2xl font-black text-foreground tabular-nums">
                                            ₹{order.deliveryEarning || order.estimatedEarning || 0}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {(
                                viewType === 'active'
                                    ? myDeliveries.filter(o => o.orderStatus !== 'delivered')
                                    : viewType === 'available'
                                        ? availableDeliveries
                                        : myDeliveries.filter(o => o.orderStatus === 'delivered')
                            ).length === 0 && (
                                    <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
                                        <Package className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                                        <h5 className="text-foreground font-black text-xl mb-3 tracking-tighter">
                                            {viewType === 'active' ? 'Sector Clear' : viewType === 'available' ? 'Quiet Zone' : 'No History'}
                                        </h5>
                                        <p className="text-sm text-secondary px-8 font-semibold leading-relaxed">
                                            {viewType === 'active'
                                                ? 'Deployment successful. Your flight path is currently clear of active objectives.'
                                                : viewType === 'available'
                                                    ? 'No immediate intercepts available in this sector. Reposition to higher density zones.'
                                                    : 'Your mission log is empty. Complete your first delivery to start your history.'}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, percentage, trend, bg }: any) {
    return (
        <div className={`p-10 rounded-[3rem] premium-shadow bg-white dark:bg-slate-900 border border-white dark:border-slate-800 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 group overflow-hidden relative backdrop-blur-3xl`}>
            <div className={`absolute top-0 right-0 w-48 h-48 ${bg} rounded-full blur-[80px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000 opacity-60`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-10">
                    <div className={`p-6 ${color} rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all duration-700 group-hover:rotate-12`}>
                        {icon}
                    </div>
                    {percentage && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-inner ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {trend === 'up' ? '↗' : '↘'} {percentage}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 opacity-70">{title}</p>
                    <h3 className="text-5xl font-black text-foreground tracking-tighter leading-none tabular-nums">{value}</h3>
                </div>
            </div>
        </div>
    )
}

