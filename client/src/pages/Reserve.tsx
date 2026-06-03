import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { usePackages } from "@/hooks/use-packages";
import { reservationsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRoute } from "wouter";
import {
    User, Mail, Phone, CreditCard, Users, Calendar, FileText,
    CheckCircle2, ArrowRight, ArrowLeft, Package, Loader2, Copy,
    Clock, Camera, Upload, X, ShieldCheck, AlertCircle, CheckSquare,
    Square, IdCard, ZoomIn, Mountain, CalendarDays, FileCheck, PencilLine
} from "lucide-react";

const steps = [
    { id: 1, title: "Personal Info", icon: User, desc: "Your contact details" },
    { id: 2, title: "Travel Details", icon: Package, desc: "Package selection" },
    { id: 3, title: "ID Verification", icon: IdCard, desc: "Upload your ID card" },
    { id: 4, title: "Review", icon: FileText, desc: "Confirm booking" },
];

function generateCode() {
    const year = new Date().getFullYear();
    const num = Math.floor(10000 + Math.random() * 90000);
    return `RHL-${year}-${num}`;
}

// Mock packages with hiking dates & requirements
const MOCK_HIKING_PACKAGES = [
    {
        id: 1,
        titleEn: "Tassili N'Ajjer Expedition",
        destination: "Tamanrasset, Algeria",
        hikingDate: "2025-05-15",
        pricePerPerson: 75000,
        durationDays: 7,
        status: "ACTIVE",
        requirements: [
            "Age between 18 and 55 years",
            "Valid National ID card (NIN)",
            "Medical certificate of good health",
            "Minimum hiking experience of 3 months",
        ],
        departureDates: [new Date(Date.now() + 30 * 86400000).toISOString()],
        inclusions: ["Equipment", "Guide", "Meals"],
        exclusions: ["Flight"],
        itinerary: [],
        rating: "5.0",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        titleEn: "Djurdjura Mountain Trek",
        destination: "Tizi Ouzou, Algeria",
        hikingDate: "2025-04-20",
        pricePerPerson: 45000,
        durationDays: 3,
        status: "ACTIVE",
        requirements: [
            "Age 16+ (minors need guardian consent)",
            "Physical fitness certificate",
            "Valid National ID card",
        ],
    },
    {
        id: 3,
        titleEn: "Chelia Peak Hike",
        destination: "Khenchela, Algeria",
        hikingDate: "2025-06-01",
        pricePerPerson: 35000,
        durationDays: 2,
        status: "ACTIVE",
        requirements: [
            "Age 18+",
            "Valid ID card required",
            "No serious cardiovascular conditions",
        ],
    },
];

interface IDCardUploadProps {
    onCapture: (dataUrl: string, file?: File) => void;
    capturedImage: string | null;
    onClear: () => void;
}

function IDCardUpload({ onCapture, capturedImage, onClear }: IDCardUploadProps) {
    const [mode, setMode] = useState<"none" | "camera" | "upload">("none");
    const [cameraError, setCameraError] = useState("");
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        setCameraError("");
        setMode("camera");
        setCameraActive(true);
        setCameraReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraReady(true);
                };
            }
        } catch (err) {
            setCameraError("Could not access camera. Please use file upload instead.");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setCameraReady(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        stopCamera();
        setMode("none");
        onCapture(dataUrl);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            onCapture(ev.target?.result as string, file);
            setMode("none");
        };
        reader.readAsDataURL(file);
    };

    const handleClear = () => {
        stopCamera();
        setMode("none");
        onClear();
        if (fileRef.current) fileRef.current.value = "";
    };

    if (capturedImage) {
        return (
            <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg">
                    <img src={capturedImage} alt="ID card" className="w-full object-contain max-h-56 bg-black" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ID Card Captured
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Your ID card photo has been added. Our team will verify your age and ID number.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ID Card guide visual */}
            <div className="relative rounded-xl border-2 border-dashed border-primary/30 bg-primary/3 p-4 overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                        {/* ID Card illustration */}
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-primary to-secondary" />
                        <div className="relative z-10 space-y-1 p-2 w-full">
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="space-y-0.5 flex-1">
                                    <div className="h-1.5 bg-white/40 rounded w-3/4" />
                                    <div className="h-1 bg-white/20 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-1 bg-white/30 rounded w-full mt-1" />
                            <div className="h-1 bg-white/20 rounded w-2/3" />
                            <div className="flex gap-0.5 mt-1">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-2 w-2 bg-primary/60 rounded-sm" />
                                ))}
                                <div className="text-white/30 text-[6px] ml-1 leading-none mt-0.5">NIN</div>
                            </div>
                        </div>
                        {/* Corner brackets */}
                        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl" />
                        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr" />
                        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl" />
                        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Photograph your ID card</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                            <li className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary shrink-0" /> Place card on a flat, well-lit surface</li>
                            <li className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary shrink-0" /> Card should fill most of the frame</li>
                            <li className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary shrink-0" /> Ensure all 4 corners are visible</li>
                            <li className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary shrink-0" /> Text must be clearly readable</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Camera mode */}
            {mode === "camera" && (
                <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border-2 border-primary bg-black">
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full max-h-56 object-cover"
                        />
                        {/* ID Card alignment overlay */}
                        {cameraReady && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="relative w-[85%] h-[75%]">
                                    {/* Corner brackets */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-sm" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-sm" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-sm" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-sm" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">Align your ID card within the frame</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!cameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <div className="text-white text-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Starting camera...
                                </div>
                            </div>
                        )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={() => { stopCamera(); setMode("none"); }}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={capturePhoto}
                            disabled={!cameraReady}
                            size="sm"
                            className="flex-1 bg-primary text-white"
                        >
                            <Camera className="w-4 h-4 mr-1" /> Capture Photo
                        </Button>
                    </div>
                </div>
            )}

            {/* Buttons */}
            {mode === "none" && (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Camera className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-foreground">Take a Photo</div>
                            <div className="text-xs text-muted-foreground">Use your camera</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setMode("upload"); fileRef.current?.click(); }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-secondary/40 hover:border-secondary hover:bg-secondary/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                            <Upload className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold text-foreground">Upload File</div>
                            <div className="text-xs text-muted-foreground">JPG, PNG, PDF</div>
                        </div>
                    </button>
                </div>
            )}

            {cameraError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {cameraError}
                </div>
            )}

            <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />

            <p className="text-xs text-muted-foreground">
                🔒 Your ID card photo is encrypted and used only for age and identity verification. It is never shared with third parties.
            </p>
        </div>
    );
}
export default function Reserve() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [resCode, setResCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [idCardImage, setIdCardImage] = useState<string | null>(null);
    const [requirementsChecked, setRequirementsChecked] = useState<boolean[]>([]);
    const [finalAgreement, setFinalAgreement] = useState(false);

    const [match, params] = useRoute("/reserve/:packageId");
    const routePackageId = params?.packageId;

    const { data: allPackages } = usePackages();
    const packages = allPackages || [];

    const {
        register, handleSubmit, watch, setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            fullName: "", email: "", phone: "", nin: "",
            numberOfTravelers: 1, packageId: routePackageId || "", specialRequests: "",
        }
    });

    // Auto-select package from URL and initialize requirements
    useEffect(() => {
        if (routePackageId && packages.length > 0) {
            const pkg = packages.find(p => String(p.id) === String(routePackageId));
            if (pkg) {
                setValue("packageId", String(routePackageId));
                setRequirementsChecked(new Array((pkg.requirements || []).length).fill(false));
            }
        }
    }, [routePackageId, setValue, packages]);

    const values = watch();
    const selectedPkg = packages.find((p: any) => String(p.id) === String(values.packageId)) as any;
    const totalPrice = selectedPkg ? Number(selectedPkg.pricePerPerson) * Number(values.numberOfTravelers) : 0;

    // Sync requirements checkboxes when package changes
    const handlePackageChange = (pkgId: string) => {
        setValue("packageId", pkgId);
        const pkg = packages.find(p => String(p.id) === pkgId);
        if (pkg) {
            setRequirementsChecked(new Array((pkg.requirements || []).length).fill(false));
        }
    };

    const toggleRequirement = (index: number) => {
        setRequirementsChecked(prev => prev.map((v, i) => i === index ? !v : v));
    };

    const requirements = (selectedPkg?.requirements || []) as string[];
    const allRequirementsChecked = requirements.length === 0 ||
        (requirementsChecked.length === requirements.length && requirementsChecked.every(Boolean));

    const onFinalSubmit = async () => {
        setLoading(true);
        try {
            const result = await reservationsApi.create({
                clientName: values.fullName,
                clientEmail: values.email,
                clientPhone: values.phone,
                clientNIN: values.nin,
                numberOfTravelers: Number(values.numberOfTravelers),
                travelDate: selectedPkg?.departureDates?.[0] || selectedPkg?.hikingDate || new Date().toISOString(),
                totalPriceDZD: String(totalPrice),
                packageId: Number(values.packageId),
                specialRequests: values.specialRequests || "",
                idCardImage: idCardImage || undefined,
            }) as Record<string, unknown>;
            setResCode(result.code as string);
            setSubmitted(true);
        } catch (err) {
            console.error("Booking failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(resCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50 to-primary/5">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl border border-border p-10 max-w-lg w-full text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Booking Received! 🎉</h1>
                        <p className="text-muted-foreground mb-8">
                            Your reservation has been submitted successfully. Our team will verify your ID card and contact you within 24 hours.
                        </p>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
                            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-2">Your Reservation Code</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl font-black text-primary font-mono tracking-wider">{resCode}</span>
                                <button onClick={copyCode} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Save this code to track your reservation status</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
                            {[
                                { label: "Package", value: selectedPkg?.titleEn || "—" },
                                { label: "Travelers", value: `${values.numberOfTravelers} person(s)` },
                                { label: "Hiking Date", value: formatDate(selectedPkg?.hikingDate || "") },
                                { label: "Total", value: `${totalPrice.toLocaleString('fr-DZ')} DZD` },
                            ].map(({ label, value }, i) => (
                                <div key={i} className="bg-muted/30 rounded-xl p-3 text-left">
                                    <div className="text-xs text-muted-foreground">{label}</div>
                                    <div className="font-semibold text-foreground mt-0.5">{value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-medium">Status: <strong>PENDING</strong> — Awaiting ID verification & review</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button asChild variant="outline" className="w-full h-12 rounded-xl font-semibold gap-2">
                                <a href={`/my-reservation`}>
                                    <FileText className="w-4 h-4" /> Track / Cancel My Reservation
                                </a>
                            </Button>
                            <Button asChild className="w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-xl font-semibold">
                                <a href="/">Return to Homepage</a>
                            </Button>
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <div className="bg-gradient-to-br from-primary to-secondary py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center text-white mb-10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Mountain className="w-6 h-6 text-white/80" />
                            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Book Your Hiking Adventure</h1>
                        </div>
                        <p className="text-white/70">Complete the form below — takes only a few minutes</p>
                    </div>

                    {/* Step Indicators */}
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between relative">
                            {/* Progress line */}
                            <div className="absolute top-5 left-12 right-12 h-0.5 bg-white/20 z-0">
                                <div
                                    className="h-full bg-accent transition-all duration-500"
                                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {steps.map((s) => {
                                const isActive = step === s.id;
                                const isDone = step > s.id;
                                return (
                                    <div key={s.id} className="flex flex-col items-center relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDone ? "bg-accent text-white" :
                                            isActive ? "bg-white text-primary shadow-xl scale-110" :
                                                "bg-white/20 text-white/60"
                                            }`}>
                                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                        </div>
                                        <span className={`mt-2 text-xs font-semibold ${isActive || isDone ? "text-white" : "text-white/50"}`}>
                                            {s.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-grow bg-muted/20 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit(onFinalSubmit)}>
                            <AnimatePresence mode="wait">

                                {/* ────── Step 1: Personal Info ────── */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={slideVariants}
                                        custom={1}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-3xl shadow-xl border border-border p-8"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">Personal Information</h2>
                                                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="font-semibold text-sm">
                                                    Full Name <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="fullName"
                                                        placeholder="Ahmed Benali"
                                                        {...register("fullName", {
                                                            required: "Full name is required",
                                                            minLength: { value: 3, message: "Minimum 3 characters" }
                                                        })}
                                                        className="pl-10 h-12"
                                                    />
                                                </div>
                                                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message as string}</p>}
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="font-semibold text-sm">
                                                        Email <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="ahmed@email.com"
                                                            {...register("email", {
                                                                required: "Email is required",
                                                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Valid email required" }
                                                            })}
                                                            className="pl-10 h-12"
                                                        />
                                                    </div>
                                                    {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="font-semibold text-sm">
                                                        Phone <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="phone"
                                                            placeholder="+213 555 123 456"
                                                            {...register("phone", {
                                                                required: "Phone is required",
                                                                pattern: { value: /^\+213\s?[0-9\s]{8,12}$/, message: "Algerian format: +213..." }
                                                            })}
                                                            className="pl-10 h-12"
                                                        />
                                                    </div>
                                                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message as string}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nin" className="font-semibold text-sm flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    National ID Number (NIN) <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="nin"
                                                    placeholder="18-digit Algerian NIN"
                                                    maxLength={18}
                                                    {...register("nin", {
                                                        required: "NIN is required",
                                                        minLength: { value: 18, message: "NIN must be 18 digits" },
                                                        maxLength: { value: 18, message: "NIN must be 18 digits" },
                                                        pattern: { value: /^\d{18}$/, message: "NIN must be 18 digits only" }
                                                    })}
                                                    className="h-12 font-mono tracking-wider"
                                                />
                                                {errors.nin && <p className="text-xs text-destructive">{errors.nin.message as string}</p>}
                                                <p className="text-xs text-muted-foreground">🔒 Your NIN is encrypted and never shared with third parties.</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                disabled={!values.fullName || !values.email || !values.phone || !values.nin}
                                                className="h-12 px-8 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl border-0"
                                            >
                                                Next: Travel Details <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ────── Step 2: Travel Details ────── */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        variants={slideVariants}
                                        custom={1}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-3xl shadow-xl border border-border p-8"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Mountain className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">Hiking Package</h2>
                                                <p className="text-sm text-muted-foreground">Select your package — hiking dates are set by the admin</p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            {/* Package Selection */}
                                            <div className="space-y-2">
                                                <Label className="font-semibold text-sm">
                                                    Hiking Package <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={values.packageId}
                                                    onValueChange={handlePackageChange}
                                                >
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Choose a hiking package..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {packages.map((pkg: any) => (
                                                            <SelectItem key={pkg.id} value={String(pkg.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <span>🥾</span>
                                                                    <span>{pkg.titleEn}</span>
                                                                    <span className="text-muted-foreground ml-auto text-xs">
                                                                        {Number(pkg.pricePerPerson).toLocaleString()} DZD
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Package info card */}
                                            {selectedPkg && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <div className="font-semibold text-sm text-primary">{selectedPkg.titleEn}</div>
                                                                <div className="text-xs text-muted-foreground mt-0.5">{selectedPkg.destination} · {selectedPkg.durationDays} days</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-muted-foreground">Per person</div>
                                                                <div className="font-bold text-primary">{Number(selectedPkg.pricePerPerson).toLocaleString()} DZD</div>
                                                            </div>
                                                        </div>

                                                        {/* Hiking date - auto assigned */}
                                                        <div className="flex items-center gap-2 pt-3 border-t border-primary/10">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                                <CalendarDays className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Hiking Date (set by admin)</div>
                                                                <div className="text-sm font-bold text-foreground">{formatDate(selectedPkg.hikingDate)}</div>
                                                            </div>
                                                            <div className="ml-auto">
                                                                <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                                                                    Auto-assigned
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Client Requirements - Formal Signing Experience */}
                                                    {selectedPkg.requirements && selectedPkg.requirements.length > 0 && (
                                                        <div className="space-y-4 pt-6 mt-6 border-t border-primary/10">
                                                            <div className="flex items-center gap-2 mb-2 p-1">
                                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                                                                    <ShieldCheck className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-sm font-black text-foreground">Rule Acknowledgment</h3>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Mandatory Signature Required</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {selectedPkg.requirements.map((req: string, i: number) => (
                                                                    <button 
                                                                        key={i} 
                                                                        type="button"
                                                                        onClick={() => toggleRequirement(i)}
                                                                        className={`relative overflow-hidden w-full text-left rounded-2xl border-2 transition-all p-4 ${
                                                                            requirementsChecked[i] 
                                                                                ? "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100/50" 
                                                                                : "bg-white border-muted/50 hover:border-primary/40 group/rule"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start gap-4">
                                                                            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                                                                                requirementsChecked[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted group-hover/rule:border-primary/50 text-transparent"
                                                                            }`}>
                                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className={`text-sm leading-relaxed transition-colors ${requirementsChecked[i] ? "text-emerald-900 font-bold" : "text-muted-foreground font-medium"}`}>
                                                                                    {req}
                                                                                </p>
                                                                                <div className="mt-3 flex items-center justify-between">
                                                                                    <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/40">Requirement {i+1}</div>
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        onClick={(e) => { e.stopPropagation(); toggleRequirement(i); }}
                                                                                        className={`h-8 rounded-lg text-[10px] font-black uppercase tracking-wider px-4 transition-all ${
                                                                                            requirementsChecked[i] 
                                                                                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0" 
                                                                                                : "bg-primary text-white shadow-lg shadow-primary/20"
                                                                                        }`}
                                                                                    >
                                                                                        {requirementsChecked[i] ? (
                                                                                            <span className="flex items-center gap-1.5"><FileCheck className="w-3 h-3" /> Signed</span>
                                                                                        ) : (
                                                                                            <span className="flex items-center gap-1.5"><PencilLine className="w-3 h-3" /> Click to Sign</span>
                                                                                        )}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Progress indicator at the bottom of the card */}
                                                                        {requirementsChecked[i] && (
                                                                            <motion.div 
                                                                                layoutId={`signed-${i}`}
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: "100%" }}
                                                                                className="absolute bottom-0 left-0 h-1 bg-emerald-500"
                                                                            />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            {!allRequirementsChecked && (
                                                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 font-bold">
                                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                                    All {selectedPkg.requirements.length} rules must be signed to proceed.
                                                                </div>
                                                            )}
                                                            {allRequirementsChecked && (
                                                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 font-bold">
                                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                                    Great! You have signed all the required policies.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Number of Travelers */}
                                            <div className="space-y-2">
                                                <Label htmlFor="numberOfTravelers" className="font-semibold text-sm">
                                                    Number of Travelers <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="numberOfTravelers"
                                                        type="number"
                                                        min={1}
                                                        max={20}
                                                        {...register("numberOfTravelers", {
                                                            required: "Required",
                                                            min: { value: 1, message: "Minimum 1" },
                                                            max: { value: 20, message: "Maximum 20" }
                                                        })}
                                                        className="pl-10 h-12"
                                                    />
                                                </div>
                                                {errors.numberOfTravelers && <p className="text-xs text-destructive">{errors.numberOfTravelers.message as string}</p>}
                                            </div>

                                            {/* Special Requests */}
                                            <div className="space-y-2">
                                                <Label htmlFor="specialRequests" className="font-semibold text-sm">
                                                    Special Requests <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                                                </Label>
                                                <Textarea
                                                    id="specialRequests"
                                                    placeholder="Any dietary restrictions, mobility needs, special accommodations..."
                                                    maxLength={500}
                                                    {...register("specialRequests")}
                                                    className="resize-none"
                                                    rows={3}
                                                />
                                                <p className="text-xs text-muted-foreground text-right">{values.specialRequests?.length || 0}/500</p>
                                            </div>

                                            {/* Total Price */}
                                            {totalPrice > 0 && (
                                                <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-semibold text-foreground">Total Price</div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                                {Number(selectedPkg?.pricePerPerson || 0).toLocaleString()} DZD × {values.numberOfTravelers} travelers
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-primary">
                                                                {totalPrice.toLocaleString('fr-DZ')}
                                                            </div>
                                                            <div className="text-sm font-semibold text-muted-foreground">DZD</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                variant="outline"
                                                className="h-12 px-6 rounded-xl"
                                            >
                                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                disabled={!values.packageId || !allRequirementsChecked}
                                                className="h-12 px-8 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl border-0"
                                            >
                                                Next: ID Verification <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ────── Step 3: ID Card Upload ────── */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        variants={slideVariants}
                                        custom={1}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-3xl shadow-xl border border-border p-8"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <IdCard className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">ID Card Verification</h2>
                                                <p className="text-sm text-muted-foreground">Upload a photo of your National ID card</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                                            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-700">
                                                Your ID card is required to verify your age and identity. Only the ID card photo is needed — no selfies required.
                                                We will extract your ID number and date of birth for verification.
                                            </p>
                                        </div>

                                        <IDCardUpload
                                            capturedImage={idCardImage}
                                            onCapture={(img) => setIdCardImage(img)}
                                            onClear={() => setIdCardImage(null)}
                                        />

                                        <div className="mt-8 flex justify-between">
                                            <Button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                variant="outline"
                                                className="h-12 px-6 rounded-xl"
                                            >
                                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => setStep(4)}
                                                disabled={!idCardImage}
                                                className="h-12 px-8 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl border-0"
                                            >
                                                Review Booking <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ────── Step 4: Review ────── */}
                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        variants={slideVariants}
                                        custom={1}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-3xl shadow-xl border border-border p-8"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">Review Your Booking</h2>
                                                <p className="text-sm text-muted-foreground">Please confirm all details before submitting</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Personal */}
                                            <div className="rounded-2xl bg-muted/30 p-5">
                                                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Personal Details
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                                    {[
                                                        { label: "Full Name", value: values.fullName },
                                                        { label: "Email", value: values.email },
                                                        { label: "Phone", value: values.phone },
                                                        { label: "NIN", value: values.nin ? `${values.nin.slice(0, 4)}••••••••${values.nin.slice(-4)}` : "—" },
                                                    ].map(({ label, value }) => (
                                                        <div key={label}>
                                                            <div className="text-muted-foreground text-xs">{label}</div>
                                                            <div className="font-semibold mt-0.5">{value || "—"}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Travel */}
                                            <div className="rounded-2xl bg-muted/30 p-5">
                                                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                                    <Mountain className="w-4 h-4" /> Hiking Details
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-3 text-sm">
                                                    {[
                                                        { label: "Package", value: selectedPkg?.titleEn || "—" },
                                                        { label: "Destination", value: selectedPkg?.destination || "—" },
                                                        { label: "Hiking Date", value: formatDate(selectedPkg?.hikingDate || "") },
                                                        { label: "Duration", value: selectedPkg ? `${selectedPkg.durationDays} days` : "—" },
                                                        { label: "Travelers", value: `${values.numberOfTravelers} person(s)` },
                                                        { label: "Date Assignment", value: "Auto-assigned by admin" },
                                                    ].map(({ label, value }) => (
                                                        <div key={label}>
                                                            <div className="text-muted-foreground text-xs">{label}</div>
                                                            <div className="font-semibold mt-0.5">{value || "—"}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {values.specialRequests && (
                                                    <div className="mt-3 pt-3 border-t border-border">
                                                        <div className="text-muted-foreground text-xs">Special Requests</div>
                                                        <div className="text-sm mt-0.5">{values.specialRequests}</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ID Card preview */}
                                            <div className="rounded-2xl bg-muted/30 p-5">
                                                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                                                    <IdCard className="w-4 h-4" /> ID Card
                                                </h3>
                                                {idCardImage && (
                                                    <div className="flex items-center gap-3">
                                                        <img src={idCardImage} alt="ID card" className="w-20 h-12 object-cover rounded-lg border border-border shadow-sm" />
                                                        <div>
                                                            <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                                                                <CheckCircle2 className="w-4 h-4" /> ID card uploaded
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">Will be verified by our team</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Final Agreement / "Digital Signature" */}
                                            <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 p-6 space-y-4">
                                                <h3 className="font-bold text-sm text-emerald-800 uppercase tracking-wide flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" /> Client Declaration
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setFinalAgreement(!finalAgreement)}
                                                    className="flex items-start gap-3 w-full text-left group p-2 rounded-xl transition-all"
                                                >
                                                    <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${finalAgreement ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-300 bg-white group-hover:border-emerald-500"
                                                        }`}>
                                                        {finalAgreement && <CheckCircle2 className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-emerald-900 leading-tight mb-1">
                                                            I hereby declare that all information provided is accurate.
                                                        </p>
                                                        <p className="text-xs text-emerald-700/80 leading-relaxed">
                                                            I confirm that I meet all physical and age requirements listed for this package.
                                                            I understand that providing false information or failing to meet requirements may result in my reservation being cancelled without refund.
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Disclaimer */}
                                            <div className="text-xs text-muted-foreground leading-relaxed p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <strong className="text-amber-800">📋 Note:</strong> By submitting this form, you confirm that all eligibility requirements are met. Payment is NOT processed online — our team will contact you after verifying your ID card.
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-between">
                                            <Button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                variant="outline"
                                                className="h-12 px-6 rounded-xl"
                                            >
                                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={loading || !finalAgreement}
                                                className={`h-12 px-8 font-bold rounded-xl border-0 shadow-lg transition-all ${finalAgreement
                                                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25"
                                                        : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                                    }`}
                                            >
                                                {loading ? (
                                                    <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Submitting...</>
                                                ) : (
                                                    <><CheckCircle2 className="mr-2 w-5 h-5" /> Confirm Booking</>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
