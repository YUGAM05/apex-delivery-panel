"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, Loader2, ArrowRight, ArrowLeft, User, Phone, Truck,
    Calendar, MapPin, Building2, FileText, UploadCloud, ShieldCheck,
    Wallet, CreditCard, Clock, CheckCircle2, Briefcase, FileBadge, AlertCircle, BadgeCheck
} from "lucide-react";

// ─── Validation Rules ─────────────────────────────────────────────────────────
const validators: Record<string, (val: string) => string> = {
    name:                   (v) => v.trim() ? "" : "Full name is required.",
    dob:                    (v) => {
        if (!v.trim()) return "Date of birth is required.";
        const age = new Date().getFullYear() - new Date(v).getFullYear()
            - ((new Date() < new Date(new Date(v).setFullYear(new Date().getFullYear()))) ? 1 : 0);
        return age >= 18 ? "" : "You must be at least 18 years old.";
    },
    street:                 (v) => v.trim() ? "" : "Residential address is required.",
    city:                   (v) => v.trim() ? "" : "City is required.",
    zip:                    (v) => /^\d{6}$/.test(v) ? "" : "Pincode must be exactly 6 digits.",
    phone:                  (v) => /^\d{10}$/.test(v) ? "" : "Primary phone must be exactly 10 digits.",
    whatsappNumber:         (v) => /^\d{10}$/.test(v) ? "" : "WhatsApp number must be exactly 10 digits.",
    email:                  (v) => /^[^\s@]+@gmail\.com$/i.test(v) ? "" : "Email must be a valid @gmail.com address.",
    emergencyContactName:   (v) => v.trim() ? "" : "Emergency contact name is required.",
    emergencyContactNumber: (v) => /^\d{10}$/.test(v) ? "" : "Emergency contact must be exactly 10 digits.",
    aadhaarNumber:  (v) => /^\d{12}$/.test(v.replace(/\s/g, "")) ? "" : "Aadhaar must be exactly 12 digits.",
    ownerPan:       (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase()) ? "" : "PAN must be 10 alphanumeric chars (e.g. ABCDE1234F).",
    vehicleRegNumber:(v) => v.trim() ? "" : "Vehicle registration number is required.",
    dlNumber:       (v) => {
        const cleaned = v.trim().replace(/[-\s]/g, "");
        return cleaned.length >= 15 && cleaned.length <= 16 ? "" : "DL number must be 15–16 alphanumeric characters.";
    },
    dlExpiryDate:   (v) => v.trim() ? "" : "DL expiry date is required.",
    accountHolderName: (v) => v.trim() ? "" : "Account holder name is required.",
    accountNumber:     (v) => /^\d{9,18}$/.test(v) ? "" : "Bank account must be 9 to 18 digits.",
    ifsc:              (v) => /^[A-Z0-9]{11}$/.test(v.trim().toUpperCase()) ? "" : "IFSC must be exactly 11 alphanumeric characters.",
    preferredZones:    (v) => v.trim() ? "" : "Preferred zones/pincodes are required.",
    availableHours:    (v) => v.trim() ? "" : "Working hours are required.",
    password:        (v) => v.length >= 8 ? "" : "Password must be at least 8 characters.",
    confirmPassword: (v) => v.length >= 8 ? "" : "Please confirm your password.",
};

const stepFields: Record<number, string[]> = {
    1: ["name","dob","street","city","zip","phone","whatsappNumber","email","emergencyContactName","emergencyContactNumber"],
    2: ["aadhaarNumber","ownerPan","vehicleRegNumber","dlNumber","dlExpiryDate"],
    3: ["accountHolderName","accountNumber","ifsc","preferredZones","availableHours"],
    4: ["password","confirmPassword"],
};

const complianceCheckboxes = [
    { name: "noCriminalRecord",       label: "I self-declare that I have no criminal record." },
    { name: "consentBackgroundCheck", label: "I consent to Apex Care conducting a background check." },
    { name: "agreedToGpsTracking",    label: "I consent to GPS tracking during active deliveries for customer safety." },
    { name: "agreedToHandleMeds",     label: "I agree to strictly follow rules for handling prescription medicines." },
    { name: "acknowledgeSla",         label: "I acknowledge the Delivery Time SLA (Service Level Agreements)." },
    { name: "agreedToTerms",          label: "I accept the Delivery Partner Terms & Conditions." },
];

interface FileInputProps {
    label: string;
    name: string;
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
}

const FileInput = ({ label, name, onUploadComplete, currentUrl }: FileInputProps) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await api.post('/upload', data);
            onUploadComplete(res.data.url);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-1.5 flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">{label}</span>
            <label className="flex items-center justify-center w-full h-11 px-2 transition bg-slate-50 border-2 border-slate-200 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-500/50 hover:bg-blue-50 focus:outline-none overflow-hidden">
                {uploading ? (
                    <span className="flex items-center space-x-1.5">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                        <span className="font-medium text-blue-600 text-[10px]">Uploading...</span>
                    </span>
                ) : currentUrl ? (
                    <span className="flex items-center space-x-1.5 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="font-medium text-[10px]">Uploaded</span>
                    </span>
                ) : (
                    <span className="flex items-center space-x-1.5">
                        <UploadCloud className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-500 text-[10px] text-nowrap overflow-hidden text-ellipsis max-w-[120px] lg:max-w-none">Upload</span>
                    </span>
                )}
                <input type="file" name={name} className="hidden" onChange={handleFileChange} />
            </label>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    name: string;
    icon: React.ElementType;
    type?: string;
    placeholder?: string;
    formData: any;
    handleChange: any;
    fieldErrors: Record<string, string>;
    onBlur?: (name: string) => void;
    hint?: string;
}

const InputField = ({
    label, name, icon: Icon, type = "text", placeholder = "",
    formData, handleChange, fieldErrors, onBlur, hint
}: InputFieldProps) => {
    const hasError = !!fieldErrors[name];
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">{label}</label>
            <div className="relative group">
                <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${hasError ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`} />
                <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    onBlur={() => onBlur?.(name)}
                    suppressHydrationWarning
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                        hasError
                            ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                            : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                />
            </div>
            {hasError ? (
                <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 ml-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors[name]}
                </p>
            ) : hint ? (
                <p className="text-[9px] text-slate-400 ml-1">{hint}</p>
            ) : null}
        </div>
    );
};

export default function DeliveryRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        password: "", confirmPassword: "",
        name: "", dob: "", gender: "Male",
        street: "", city: "", zip: "",
        phone: "", whatsappNumber: "", email: "",
        emergencyContactName: "", emergencyContactNumber: "",
        aadhaarNumber: "", ownerPan: "",
        vehicleType: "Bike", vehicleRegNumber: "",
        dlNumber: "", dlExpiryDate: "",
        accountHolderName: "", accountNumber: "", ifsc: "", upiId: "",
        preferredZones: "", availableHours: "", daysAvailable: "Both", employmentType: "Full-Time",
        aadhaarCardUrl: "", aadhaarBackUrl: "", panCardUrl: "",
        dlFrontUrl: "", dlBackUrl: "", rcUrl: "", insuranceUrl: "",
        cancelledChequeUrl: "",
        policeVerificationUrl: "",
        profilePicture: "",
        noCriminalRecord: false, referenceContact: "",
        agreedToTerms: false, agreedToGpsTracking: false,
        agreedToHandleMeds: false, acknowledgeSla: false, consentBackgroundCheck: false
    });

    const validateField = (name: string, value: string): string => {
        const fn = validators[name];
        if (!fn) return "";
        return fn(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            if (checked) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            const err = validateField(name, value);
            setFieldErrors(prev => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (name: string) => {
        const value = String((formData as any)[name] ?? "");
        const err = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: err }));
    };

    const validateStep = (s: number): boolean => {
        const fields = stepFields[s] ?? [];
        const newErrors: Record<string, string> = { ...fieldErrors };
        let valid = true;

        for (const field of fields) {
            const value = String((formData as any)[field] ?? "");
            const err = validateField(field, value);
            newErrors[field] = err;
            if (err) valid = false;
        }

        if (s === 4) {
            if (formData.password !== formData.confirmPassword) {
                newErrors["confirmPassword"] = "Passwords do not match.";
                valid = false;
            }
            for (const chk of complianceCheckboxes) {
                if (!(formData as any)[chk.name]) {
                    newErrors[chk.name] = "You must accept this to proceed.";
                    valid = false;
                } else {
                    delete newErrors[chk.name];
                }
            }
        }

        setFieldErrors(newErrors);
        return valid;
    };

    // ✅ Fixed: nextStep now uses type="button" so no form submission issues
    const nextStep = () => {
        setError("");
        if (validateStep(step)) {
            window.scrollTo(0, 0);
            setStep(s => Math.min(s + 1, 4));
        }
    };

    const prevStep = () => {
        window.scrollTo(0, 0);
        setStep(s => Math.max(s - 1, 1));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!validateStep(4)) return;

        setLoading(true);
        const payload = {
            ...formData,
            role: "delivery",
            address: { street: formData.street, city: formData.city, state: "", zip: formData.zip },
            bankDetails: { accountHolderName: formData.accountHolderName, accountNumber: formData.accountNumber, ifsc: formData.ifsc },
            preferredZones: formData.preferredZones.split(',').map(s => s.trim()),
        };

        try {
            await api.post("/auth/register", payload);
            router.push("/login?registered=true");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Registration failed. Please check your data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            {/* Left Side */}
            <div className="hidden lg:flex w-[45%] relative">
                <div className="absolute inset-0 z-0">
                    <img src="/delivery-register-hero.png" alt="Join the Fleet" className="w-full h-full object-cover scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1d4ed8] via-[#1e3a8a] to-[#0f172a] opacity-90 mix-blend-multiply z-[1]" />
                </div>
                <div className="relative z-10 w-full h-full p-8 xl:p-12 flex flex-col justify-between overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-xl shrink-0 flex items-center justify-center">
                            <img src="/apex-care-logo.png" alt="Apex Care Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Apex Care <span className="font-light opacity-80 text-blue-200">Delivery</span>
                        </h2>
                    </div>
                    <div className="max-w-lg my-auto py-8">
                        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 text-white">
                            Start Your<br /> Next-Gen Journey.
                        </motion.h1>
                        <p className="text-base xl:text-lg text-white/80 font-medium leading-relaxed mb-6">
                            Step into a career that moves you forward and helps millions receive timely care. Follow 4 simple steps to onboard today!
                        </p>
                        <div className="space-y-3 xl:space-y-4">
                           {[
                               { step: 1, title: 'Personal & Contact Info', icon: User },
                               { step: 2, title: 'Identity & Vehicle', icon: Truck },
                               { step: 3, title: 'Finance & Ops', icon: Wallet },
                               { step: 4, title: 'Compliance & Safety', icon: ShieldCheck }
                           ].map((s) => (
                                <div key={s.step} className={`flex items-center gap-4 p-3 rounded-2xl border ${step === s.step ? 'bg-white/10 border-white/30 backdrop-blur-md' : 'border-transparent opacity-50'}`}>
                                    <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl font-bold ${step === s.step ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-white tracking-wide text-sm xl:text-base">{s.title}</span>
                                </div>
                           ))}
                        </div>
                    </div>
                    <div className="text-white/50 text-xs font-medium shrink-0">
                        © 2026 Apex Care Delivery Network. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-[55%] flex flex-col h-full overflow-hidden bg-slate-50 relative">
                <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        {step > 1 && (
                            <button suppressHydrationWarning onClick={prevStep} type="button" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 bg-white/70 px-4 py-2 rounded-full border border-slate-200 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                    </div>
                    <Link href="/login" className="pointer-events-auto text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white/70 px-4 py-2 rounded-full border border-blue-600/20 backdrop-blur-md shadow-sm">
                        Sign In <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="px-8 xl:px-20 pt-24 pb-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {step === 1 && "Personal & Contact"}
                        {step === 2 && "Identity & Vehicle"}
                        {step === 3 && "Finance & Preferences"}
                        {step === 4 && "Safety & Setup"}
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium italic text-sm">Step {step} of 4 — All fields are mandatory</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-500 rounded-full" style={{ width: `${(step / 4) * 100}%` }} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 xl:px-20 pb-20 no-scrollbar">
                    {/* ✅ Fixed: form only handles step 4 submit, steps 1-3 use button type="button" */}
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">

                                {/* STEP 1 */}
                                {step === 1 && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Full Name" name="name" icon={User} placeholder="John Doe" />
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Date of Birth</label>
                                                <div className="relative group">
                                                    <Calendar className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${fieldErrors.dob ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`} />
                                                    <input
                                                        name="dob"
                                                        type="date"
                                                        value={formData.dob}
                                                        onChange={handleChange}
                                                        onBlur={() => handleBlur("dob")}
                                                        max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0]; })()}
                                                        suppressHydrationWarning
                                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 transition-all shadow-sm ${fieldErrors.dob ? "border-red-300 focus:ring-red-200 bg-red-50/30" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"}`}
                                                    />
                                                </div>
                                                {fieldErrors.dob
                                                    ? <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 ml-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.dob}</p>
                                                    : <p className="text-[9px] text-slate-400 ml-1">Must be 18 years or older</p>
                                                }
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Gender</label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <FileInput label="Profile Photo (Selfie)" name="profilePicture" onUploadComplete={(url) => setFormData(p => ({...p, profilePicture: url}))} currentUrl={formData.profilePicture} />
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Residential Address</label>
                                            <div className="relative">
                                                <MapPin className={`absolute left-3.5 top-3.5 w-4 h-4 ${fieldErrors.street ? "text-red-400" : "text-slate-400"}`} />
                                                <textarea
                                                    name="street"
                                                    value={formData.street}
                                                    onChange={handleChange}
                                                    onBlur={() => handleBlur("street")}
                                                    rows={2}
                                                    placeholder="House No, Area..."
                                                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none shadow-sm ${fieldErrors.street ? "border-red-300 focus:ring-red-200 bg-red-50/30" : "border-gray-200 focus:ring-blue-500/20"}`}
                                                />
                                            </div>
                                            {fieldErrors.street && <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 ml-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.street}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="City" name="city" icon={Building2} placeholder="Ahmedabad" />
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Pincode (6 digits)" name="zip" icon={MapPin} placeholder="380001" />
                                        </div>

                                        <hr className="border-slate-100 my-2" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Primary Phone (10 digits)" name="phone" icon={Phone} placeholder="9876543210" />
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="WhatsApp (10 digits)" name="whatsappNumber" icon={Phone} placeholder="9876543210" />
                                        </div>

                                        <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Email Address (@gmail.com)" name="email" type="email" icon={Mail} placeholder="name@gmail.com" />

                                        <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Emergency Contact Name" name="emergencyContactName" icon={User} placeholder="Jane Doe" />
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Emergency Phone (10 digits)" name="emergencyContactNumber" icon={Phone} placeholder="9876543210" />
                                        </div>
                                    </>
                                )}

                                {/* STEP 2 */}
                                {step === 2 && (
                                    <>
                                        <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100 mb-2">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><FileBadge className="w-4 h-4 text-blue-600"/> KYC Documents</h3>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Aadhaar No. (12 digits)" name="aadhaarNumber" icon={FileText} placeholder="000000000000" />
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="PAN Card No. (10 chars)" name="ownerPan" icon={FileText} placeholder="ABCDE1234F" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <FileInput label="Aadhaar Front" name="aadhaarCardUrl" onUploadComplete={(url) => setFormData(p => ({...p, aadhaarCardUrl: url}))} currentUrl={formData.aadhaarCardUrl} />
                                                <FileInput label="Aadhaar Back" name="aadhaarBackUrl" onUploadComplete={(url) => setFormData(p => ({...p, aadhaarBackUrl: url}))} currentUrl={formData.aadhaarBackUrl} />
                                                <FileInput label="PAN Document" name="panCardUrl" onUploadComplete={(url) => setFormData(p => ({...p, panCardUrl: url}))} currentUrl={formData.panCardUrl} />
                                            </div>
                                        </div>

                                        <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-600"/> Vehicle & License</h3>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Vehicle Type</label>
                                                    <div className="relative">
                                                        <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                                                            <option value="Bike">Bike / Motorcycle</option>
                                                            <option value="Scooter">Scooter</option>
                                                            <option value="E-Bike">Electric Vehicle</option>
                                                            <option value="Bicycle">Bicycle</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Vehicle Reg Number" name="vehicleRegNumber" icon={FileText} placeholder="GJ-01-XX-0000" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="DL Number (15–16 chars)" name="dlNumber" icon={FileBadge} placeholder="GJ0120230123456" hint="15 to 16 alphanumeric characters" />
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="DL Expiry Date" name="dlExpiryDate" type="date" icon={Calendar} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <FileInput label="DL Copy (Front)" name="dlFrontUrl" onUploadComplete={(url) => setFormData(p => ({...p, dlFrontUrl: url}))} currentUrl={formData.dlFrontUrl} />
                                                <FileInput label="DL Copy (Back)" name="dlBackUrl" onUploadComplete={(url) => setFormData(p => ({...p, dlBackUrl: url}))} currentUrl={formData.dlBackUrl} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <FileInput label="RC Document" name="rcUrl" onUploadComplete={(url) => setFormData(p => ({...p, rcUrl: url}))} currentUrl={formData.rcUrl} />
                                                <FileInput label="Vehicle Insurance" name="insuranceUrl" onUploadComplete={(url) => setFormData(p => ({...p, insuranceUrl: url}))} currentUrl={formData.insuranceUrl} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* STEP 3 */}
                                {step === 3 && (
                                    <>
                                        <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100 mb-2">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-600"/> Payment Details</h3>
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Account Holder Name" name="accountHolderName" icon={User} placeholder="As per Bank" />
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Account No. (9–18 digits)" name="accountNumber" icon={CreditCard} placeholder="0000000000" />
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="IFSC Code (11 chars)" name="ifsc" icon={Building2} placeholder="SBIN0000001" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4 items-end">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">UPI ID <span className="lowercase text-[9px] font-semibold">(Optional)</span></label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input name="upiId" type="text" value={formData.upiId} onChange={handleChange} placeholder="name@bank" className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
                                                    </div>
                                                </div>
                                                <FileInput label="Cancelled Cheque" name="cancelledChequeUrl" onUploadComplete={(url) => setFormData(p => ({...p, cancelledChequeUrl: url}))} currentUrl={formData.cancelledChequeUrl} />
                                            </div>
                                        </div>

                                        <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-600"/> Operational Preferences</h3>
                                            <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Preferred Pincodes/Zones" name="preferredZones" icon={MapPin} placeholder="e.g. 380001, 380009" />
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <InputField formData={formData} handleChange={handleChange} fieldErrors={fieldErrors} onBlur={handleBlur} label="Working Hours" name="availableHours" icon={Clock} placeholder="4 PM - 11 PM" />
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Days Available</label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <select name="daysAvailable" value={formData.daysAvailable} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                                                            <option value="Both">Weekdays & Weekends</option>
                                                            <option value="Weekdays">Weekdays Only</option>
                                                            <option value="Weekends">Weekends Only</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 mt-4">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Employment</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                                                        <option value="Full-Time">Full-Time (8+ Hrs)</option>
                                                        <option value="Part-Time">Part-Time / Gig Worker</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* STEP 4 */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-blue-600"/> Safety & Background
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <FileInput label="Police Verification" name="policeVerificationUrl" onUploadComplete={(url) => setFormData(p => ({...p, policeVerificationUrl: url}))} currentUrl={formData.policeVerificationUrl} />
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Reference Details <span className="lowercase text-[9px] font-semibold">(Optional)</span></label>
                                                    <div className="relative">
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input name="referenceContact" type="text" value={formData.referenceContact} onChange={handleChange} placeholder="Name & Number" className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                                    <BadgeCheck className="w-4 h-4 text-blue-500" /> Terms & Compliance
                                                </h4>
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">All required</span>
                                            </div>
                                            <div className="space-y-2">
                                                {complianceCheckboxes.map(chk => (
                                                    <div key={chk.name}>
                                                        <label className={`flex items-start gap-3 p-3 bg-white rounded-xl border cursor-pointer transition-all shadow-sm ${fieldErrors[chk.name] ? "border-red-300 bg-red-50/30" : "border-gray-100 hover:border-blue-500/30"}`}>
                                                            <input
                                                                type="checkbox"
                                                                name={chk.name}
                                                                checked={formData[chk.name as keyof typeof formData] as boolean}
                                                                onChange={handleChange}
                                                                className={`mt-1 w-4 h-4 rounded focus:ring-blue-500 ${fieldErrors[chk.name] ? "border-red-400 text-red-500" : "text-blue-600 border-gray-300"}`}
                                                            />
                                                            <span className={`text-xs font-semibold leading-tight ${fieldErrors[chk.name] ? "text-red-500" : "text-slate-600"}`}>
                                                                {chk.label} <span className="text-red-400">*</span>
                                                            </span>
                                                        </label>
                                                        {fieldErrors[chk.name] && (
                                                            <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 ml-7 mt-1">
                                                                <AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors[chk.name]}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Set Password (min 8 chars)</label>
                                                <div className="relative">
                                                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.password ? "text-red-400" : "text-slate-400"}`} />
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        onBlur={() => handleBlur("password")}
                                                        suppressHydrationWarning
                                                        placeholder="••••••••"
                                                        className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${fieldErrors.password ? "border-red-300 focus:ring-red-200 bg-red-50/30" : "border-gray-200 focus:ring-blue-500/20"}`}
                                                    />
                                                </div>
                                                {fieldErrors.password && <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 ml-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.password}</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Confirm Password</label>
                                                <div className="relative">
                                                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.confirmPassword ? "text-red-400" : "text-slate-400"}`} />
                                                    <input
                                                        name="confirmPassword"
                                                        type="password"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        onBlur={() => handleBlur("confirmPassword")}
                                                        suppressHydrationWarning
                                                        placeholder="••••••••"
                                                        className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${fieldErrors.confirmPassword ? "border-red-300 focus:ring-red-200 bg-red-50/30" : "border-gray-200 focus:ring-blue-500/20"}`}
                                                    />
                                                </div>
                                                {fieldErrors.confirmPassword && <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 ml-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.confirmPassword}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-6 border-t border-slate-100 mt-8">
                            {/* ✅ Fixed: type="button" for steps 1-3, type="submit" only for step 4 */}
                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    suppressHydrationWarning
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Continue to Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    suppressHydrationWarning
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Application <CheckCircle2 className="w-5 h-5" /></>}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}