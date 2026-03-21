"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
    Lock, Loader2, ArrowRight, Truck, Eye, EyeOff,
    User, Headphones, MapPin, Home, Info, Store,
    Activity, ShieldCheck, Mail
} from "lucide-react";

export default function DeliveryLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", { email, password });

            if (res.data.role !== 'delivery' && res.data.role !== 'admin') {
                setError("This portal is for delivery professionals only.");
                setLoading(false);
                return;
            }

            if (res.data.status === "pending") {
                setError("Your account is pending admin approval.");
                setLoading(false);
                return;
            }
            if (res.data.status === "rejected") {
                setError("Your registration was rejected. Contact support.");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));
            router.push("/dashboard");

        } catch (err: any) {
            console.error(err);
            const backendMessage = err.response?.data?.message;
            setError(backendMessage || "Authentication failed. Please verify credentials.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans selection:bg-[#1d6cf0]/30">
            {/* Top Logo - Fixed */}
            <div className="fixed top-0 left-0 z-50 p-6 lg:p-10 pointer-events-none">
                <div className="flex items-center gap-2.5 pointer-events-auto">
                    <div className="w-10 h-10 bg-[#1d6cf0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1d6cf0]/20">
                        <Truck className="w-6 h-6" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tighter text-gray-900">
                        Apex Care <span className="text-[#1d6cf0]">Logistics</span>
                    </span>
                </div>
            </div>

            <div className="flex w-full">
                {/* Left Side: Strategic Map Section */}
                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-slate-50 border-r border-slate-200 relative items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(29,108,240,0.08)_0%,_rgba(248,250,252,1)_100%)] opacity-60"></div>

                    <div className="relative w-full max-w-2xl aspect-square">
                        {/* Abstract Route Map SVG */}
                        <svg className="absolute inset-0 w-full h-full text-[#1d6cf0]/15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 800 800">
                            <path d="M100,200 Q400,100 700,300 T500,600 S200,700 100,400" />
                            <path d="M200,100 Q500,300 300,700" />
                            <path d="M600,100 C700,400 300,400 100,700" />
                        </svg>

                        {/* Interactive Nodes */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-[18%] left-[10%]"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#1d6cf0] border border-blue-50">
                                <Store className="w-7 h-7" />
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute top-[15%] right-[10%]"
                        >
                            <div className="w-12 h-12 bg-[#1d6cf0] rounded-full shadow-2xl shadow-[#1d6cf0]/40 flex items-center justify-center text-white">
                                <Truck className="w-6 h-6" />
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute bottom-[10%] left-[10%]"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-400 border border-slate-100">
                                <Home className="w-6 h-6" />
                            </div>
                        </motion.div>

                        {/* Center Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-6 max-w-md z-10 px-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center justify-center p-5 bg-[#1d6cf0]/10 rounded-[2rem] mb-4 border border-[#1d6cf0]/10"
                                >
                                    <MapPin className="w-12 h-12 text-[#1d6cf0]" />
                                </motion.div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                                    Smart Health <br /><span className="text-[#1d6cf0] tracking-tighter">Logistics</span>
                                </h1>
                                <p className="text-lg text-gray-600 font-medium">
                                    Professional logistics infrastructure for the next generation of e-pharmacy delivery.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Active Status Badge */}
                    {/* <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                    </div> */}
                </div>

                {/* Right Side: Login Form Section */}
                <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.05)] z-10 pt-20 lg:pt-0">
                    <header className="flex lg:hidden items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1d6cf0] rounded-lg flex items-center justify-center text-white">
                                <Truck className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-[#1d6cf0]">Apex Logistics</span>
                        </div>
                        <button className="text-[10px] font-black text-[#1d6cf0] uppercase tracking-widest flex items-center gap-1">
                            Support
                        </button>
                    </header>

                    <main className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-24 lg:px-16 xl:px-24 py-12">
                        <div className="max-w-md w-full mx-auto">
                            <div className="mb-10 text-center lg:text-left">
                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Partner Login</h2>
                                <p className="text-gray-500 font-medium">Access your delivery dashboard and active dispatch routes.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700" htmlFor="email">
                                        Email or Driver ID
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 font-medium focus:outline-none focus:border-[#1d6cf0] transition-all placeholder:text-gray-400"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="partner@gmail.com"
                                            type="email"
                                            required
                                            suppressHydrationWarning
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-bold text-gray-700" htmlFor="password">
                                            Secret Password
                                        </label>
                                        <Link className="text-[10px] uppercase font-black text-[#1d6cf0] hover:text-blue-700 transition-colors tracking-widest" href="#">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 font-medium focus:outline-none focus:border-[#1d6cf0] transition-all placeholder:text-gray-400"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            suppressHydrationWarning
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            type="button"
                                            suppressHydrationWarning
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-[#1d6cf0] hover:bg-black text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#1d6cf0]/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 group"
                                    type="submit"
                                    disabled={loading}
                                    suppressHydrationWarning
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In to Portal
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="flex flex-col items-center gap-6">
                                    <p className="text-sm text-gray-500 font-medium">
                                        New to Apex Logistics?
                                        <Link className="text-[#1d6cf0] font-black hover:underline px-1" href="/register">Become a Partner</Link>
                                    </p>
                                    <div className="flex justify-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Link className="hover:text-[#1d6cf0] transition-colors" href="#">Privacy</Link>
                                        <Link className="hover:text-[#1d6cf0] transition-colors" href="#">Legal</Link>
                                        <Link className="hover:text-[#1d6cf0] transition-colors" href="#">Support</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* <footer className="hidden lg:flex items-center justify-end p-8 mt-auto">
                        <button className="flex items-center gap-2 py-2.5 px-5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all">
                            <Headphones className="w-4 h-4 text-[#1d6cf0]" />
                            Logistics Support
                        </button>
                    </footer> */}
                </div>
            </div>
        </div>
    );
}
