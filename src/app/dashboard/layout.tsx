"use client";

import Link from 'next/link';
import { Truck, MapPin, Package, Home, Clock, History, LogOut } from 'lucide-react';

export default function DeliveryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Premium Sidebar */}
            <aside className="w-full md:w-80 bg-slate-950 text-white md:fixed h-auto md:h-full inset-y-0 left-0 z-50 flex md:flex-col border-r border-slate-900 shadow-2xl">
                <div className="p-8 pb-12 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center premium-shadow rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden p-1.5">
                        <img src="/apex-care-logo.png" alt="Apex Care Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter leading-none">
                            FLEET <span className="text-primary italic">SUITE</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Apex Care Logistics</p>
                    </div>
                </div>

                <nav className="flex md:flex-col gap-2 px-6 flex-1">
                    <NavItem href="/dashboard" icon={<Home className="w-5 h-5" />} label="Command Center" />
                    <div className="h-px bg-slate-900 my-4 mx-2" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 ml-4">Deployment</p>
                    <NavItem href="/dashboard" query="view=available" icon={<MapPin className="w-5 h-5" />} label="Available Missions" />
                    <NavItem href="/dashboard" query="view=active" icon={<Package className="w-5 h-5" />} label="Active Manifest" />
                    <NavItem href="/dashboard" query="view=history" icon={<History className="w-5 h-5" />} label="Mission Logs" />
                </nav>

                <div className="p-6 md:p-8 border-t border-slate-900 mt-auto">
                    <Link
                        href="/login"
                        onClick={() => localStorage.removeItem('token')}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-xs uppercase tracking-widest">Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 min-h-screen relative">
                {/* Background Glow */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

                <div className="p-4 md:p-12 pb-32 md:pb-12 relative z-10 transition-all duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, query }: any) {
    const fullHref = query ? `${href}?${query}` : href;
    return (
        <Link
            href={fullHref}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-all duration-300 group hover:translate-x-1"
        >
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <span className="tracking-tight">{label}</span>
        </Link>
    )
}
