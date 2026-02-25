"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, User, Phone, Truck } from "lucide-react";

export default function DeliveryRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await api.post("/auth/register", {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: "delivery"
            });

            router.push("/login?registered=true");

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white overflow-hidden relative font-sans">
            {/* Left Side: Cinematic Visual Content */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden h-screen">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/delivery-register-hero.png"
                        alt="Join the Fleet"
                        className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-900/40 to-black/60 mix-blend-multiply" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full h-full p-20 flex flex-col justify-between text-white border-r border-white/10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden p-2">
                                <img src="/apex-care-logo.png" alt="Apex Care Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase">Apex<span className="text-blue-400 text-3xl">.</span>Care</span>
                        </div>

                        <h1 className="text-7xl font-black leading-[0.9] tracking-tighter mb-8 max-w-xl">
                            Start Your <br />
                            <span className="text-blue-400">Next-Gen</span> <br />
                            Journey.
                        </h1>
                        <p className="text-xl text-blue-50/70 font-medium max-w-md leading-relaxed">
                            Step into a career that moves you forward and helps millions receive timely care.
                        </p>
                    </motion.div>

                    {/* Enrollment Steps Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="grid grid-cols-2 gap-8 pt-12 border-t border-white/10"
                    >
                        <div className="space-y-2">
                            <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">Step 01</h3>
                            <p className="text-sm font-bold text-white/90">Complete the online application form.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">Step 02</h3>
                            <p className="text-sm font-bold text-white/90">Submit your documentation for review.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">Step 03</h3>
                            <p className="text-sm font-bold text-white/90">Quick training and orientation session.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">Step 04</h3>
                            <p className="text-sm font-bold text-white/90">Get verified and start earning daily.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full lg:w-2/5 h-screen flex items-center justify-center p-4 lg:p-8 bg-gray-50/30 relative overflow-y-auto no-scrollbar">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-xl relative z-10 py-6"
                >
                    <div className="bg-white/70 backdrop-blur-3xl border border-white p-8 lg:p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                        <div className="mb-6 text-center">
                            <div className="flex justify-center mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="p-1 rounded-[1.4rem] bg-gradient-to-tr from-blue-500 to-blue-200 shadow-xl border border-white/20"
                                >
                                    <div className="bg-white rounded-[1.3rem] p-2.5 flex items-center justify-center">
                                        <img src="/apex-care-logo.png" alt="Apex Care" className="h-12 lg:h-14 w-auto object-contain" />
                                    </div>
                                </motion.div>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                Partner Enrollment
                            </h2>
                            <p className="text-gray-500 font-medium text-sm">Join our network of healthcare specialists</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-4 shadow-sm"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                                <p className="leading-relaxed">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all shadow-sm group-hover:bg-white"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all shadow-sm group-hover:bg-white"
                                        placeholder="partner@apex.care"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all shadow-sm group-hover:bg-white"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all shadow-sm group-hover:bg-white"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all shadow-sm group-hover:bg-white"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group mt-4 uppercase tracking-widest text-sm"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                ) : (
                                    <>
                                        Submit Registration <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 text-center pt-8 border-t border-gray-100">
                            <p className="text-gray-400 font-bold text-sm tracking-tight">
                                Already registered?{" "}
                                <Link href="/login" className="text-blue-600 font-black hover:underline decoration-2 underline-offset-4 transition-all">
                                    Log In to Dashboard
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
