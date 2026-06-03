import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    User, Mail, Phone, CreditCard, Users, Calendar, FileText, 
    CheckCircle2, ArrowRight, ArrowLeft, Package, Loader2, Copy, 
    Clock, Camera, Upload, X, ShieldCheck, AlertCircle, CheckSquare, 
    Square, IdCard, CalendarDays, Mountain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { reservationsApi } from "@/lib/api";
import { format } from "date-fns";

interface BookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pkg: any;
}

const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Trip Details", icon: Mountain },
    { id: 3, title: "ID Verification", icon: IdCard },
    { id: 4, title: "Review", icon: FileText },
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
            {mode === "none" && (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Take Photo</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-secondary hover:bg-secondary/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-secondary" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Upload ID</span>
                    </button>
                    <input
                        type="file"
                        ref={fileRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            )}

            {mode === "camera" && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-primary shadow-xl">
                    {!cameraReady && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Camera...</span>
                        </div>
                    )}
                    {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-red-900/40 backdrop-blur-sm">
                            <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
                            <p className="text-sm font-bold mb-4">{cameraError}</p>
                            <Button size="sm" onClick={() => setMode("none")} variant="secondary">Go Back</Button>
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraReady ? "opacity-100" : "opacity-0"} transition-opacity`}
                    />
                    {cameraReady && (
                        <>
                            <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none">
                                <div className="w-full h-full border-2 border-white/40 border-dashed rounded-lg" />
                            </div>
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { stopCamera(); setMode("none"); }}
                                    className="rounded-full h-12 w-12 p-0 bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-md"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="rounded-full h-14 w-14 p-0 bg-white hover:bg-white/90 shadow-xl border-4 border-primary/20 scale-110 hover:scale-125 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-full border-2 border-primary" />
                                </Button>
                            </div>
                        </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </div>
    );
}

export function BookingDialog({ open, onOpenChange, pkg }: BookingDialogProps) {
    const [step, setStep] = useState(1);
    const [idCardImage, setIdCardImage] = useState<string | null>(null);
    const [requirementsChecked, setRequirementsChecked] = useState<boolean[]>(
        pkg.requirements ? new Array(pkg.requirements.length).fill(false) : []
    );
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resCode, setResCode] = useState("");
    const [copied, setCopied] = useState(false);

    const {
        register, handleSubmit, watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            fullName: "", email: "", phone: "", nin: "",
            numberOfTravelers: 1, specialRequests: "",
            departureDate: pkg.departureDates?.[0] || pkg.hikingDate || new Date().toISOString(),
        }
    });

    const values = watch();
    const totalPrice = Number(pkg.pricePerPerson) * Number(values.numberOfTravelers);

    const toggleRequirement = (index: number) => {
        setRequirementsChecked(prev => prev.map((v, i) => i === index ? !v : v));
    };

    const requirements = pkg.requirements || [];
    const allRequirementsChecked = requirements.length === 0 || 
        (requirementsChecked.length === requirements.length && requirementsChecked.every(Boolean));

    const onFinalSubmit = async (data: any) => {
        setLoading(true);
        try {
            const result = await reservationsApi.create({
                clientName: data.fullName,
                clientEmail: data.email,
                clientPhone: data.phone,
                clientNIN: data.nin,
                numberOfTravelers: Number(data.numberOfTravelers),
                travelDate: data.departureDate,
                totalPriceDZD: String(totalPrice),
                packageId: pkg.id,
                specialRequests: data.specialRequests || "",
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

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!loading) onOpenChange(val);
        }}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-3xl border-none shadow-2xl">
                {!submitted ? (
                    <div className="flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh]">
                        {/* Header Gradient */}
                        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white pb-12">
                            <DialogTitle className="text-2xl font-bold mb-1">Book Your Adventure</DialogTitle>
                            <DialogDescription className="text-white/80">
                                {pkg.titleEn} · {Number(pkg.pricePerPerson).toLocaleString()} DZD / person
                            </DialogDescription>
                        </div>

                        {/* Step Indicators */}
                        <div className="px-6 -mt-8 mb-6">
                            <div className="bg-background rounded-2xl p-3 shadow-lg border border-border flex justify-between items-center">
                                {steps.map((s) => {
                                    const isActive = step === s.id;
                                    const isDone = step > s.id;
                                    return (
                                        <div key={s.id} className="flex flex-col items-center flex-1 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                isActive ? "bg-primary text-white scale-110 shadow-md" : 
                                                isDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                            }`}>
                                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                                            </div>
                                            <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                                {s.title.split(" ")[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto px-8 pb-8">
                            <form onSubmit={handleSubmit(onFinalSubmit)}>
                                <AnimatePresence mode="wait" custom={1}>
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            variants={slideVariants}
                                            initial="enter" animate="center" exit="exit"
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="font-bold">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input {...register("fullName", { required: true })} className="pl-10 h-11 rounded-xl" placeholder="John Doe" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="font-bold">Email</Label>
                                                    <Input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} className="h-11 rounded-xl" placeholder="john@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="font-bold">Phone</Label>
                                                    <Input {...register("phone", { required: true })} className="h-11 rounded-xl" placeholder="+213..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nin" className="font-bold">National ID Number (18 digits)</Label>
                                                <Input {...register("nin", { required: true, minLength: 18, maxLength: 18 })} className="h-11 rounded-xl font-mono" placeholder="000000000000000000" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            variants={slideVariants}
                                            initial="enter" animate="center" exit="exit"
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary">
                                                        <CalendarDays className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-muted-foreground font-bold uppercase">Departure Date</div>
                                                        <div className="font-bold text-sm">{format(new Date(values.departureDate), "MMMM d, yyyy")}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-muted/30 p-4 rounded-2xl border border-border flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[10px] text-muted-foreground font-bold uppercase">Travelers</div>
                                                        <div className="flex items-center justify-between">
                                                            <input type="range" min="1" max="10" className="w-16 h-1.5 accent-primary" {...register("numberOfTravelers")} />
                                                            <span className="font-black text-sm">{values.numberOfTravelers}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                                                <h4 className="text-amber-800 font-bold text-sm mb-3 flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" /> Package Mandatory Requirements
                                                </h4>
                                                <div className="space-y-2">
                                                    {pkg.requirements && pkg.requirements.map((req: string, i: number) => (
                                                        <button
                                                            key={i} type="button"
                                                            onClick={() => toggleRequirement(i)}
                                                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                                                requirementsChecked[i] 
                                                                    ? "bg-white border-emerald-500 text-emerald-900 shadow-sm" 
                                                                    : "bg-white/50 border-muted-foreground/10 text-muted-foreground"
                                                            }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                                                requirementsChecked[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted"
                                                            }`}>
                                                                {requirementsChecked[i] && <CheckCircle2 className="w-3 h-3" />}
                                                            </div>
                                                            <span className="text-xs font-medium leading-tight">{req}</span>
                                                        </button>
                                                    ))}
                                                    {(!pkg.requirements || pkg.requirements.length === 0) && (
                                                        <p className="text-xs text-muted-foreground italic text-center py-2">No specific requirements.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            variants={slideVariants}
                                            initial="enter" animate="center" exit="exit"
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200 text-blue-600">
                                                    <IdCard className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">ID Verification</h3>
                                                    <p className="text-xs text-muted-foreground">Upload your national identity card</p>
                                                </div>
                                            </div>

                                            <IDCardUpload
                                                capturedImage={idCardImage}
                                                onCapture={(img) => setIdCardImage(img)}
                                                onClear={() => setIdCardImage(null)}
                                            />
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div
                                            key="step4"
                                            variants={slideVariants}
                                            initial="enter" animate="center" exit="exit"
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                                                <div className="text-xs font-bold uppercase text-muted-foreground mb-4 border-b border-border pb-2">Booking Summary</div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-muted-foreground text-xs">Customer</div>
                                                        <div className="font-bold">{values.fullName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground text-xs">Trip Date</div>
                                                        <div className="font-bold">{format(new Date(values.departureDate), "MMM d, yyyy")}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground text-xs">Travelers</div>
                                                        <div className="font-bold">{values.numberOfTravelers} Persons</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground text-xs">Price PP</div>
                                                        <div className="font-bold text-primary">{Number(pkg.pricePerPerson).toLocaleString()} DZD</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-primary p-5 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-primary/20">
                                                <div>
                                                    <div className="text-white/70 text-xs font-bold uppercase">Total to Pay</div>
                                                    <div className="text-[10px] text-white/50">(Paid later after verification)</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black">{totalPrice.toLocaleString()}</div>
                                                    <div className="text-xs font-bold">DZD</div>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50 italic">
                                                By clicking "Confirm Booking", you agree to the package terms and confirm that you meet all requirements. A dedicated travel agent will review your ID and contact you.
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation Footer */}
                                <div className="mt-8 pt-6 border-t border-border flex justify-between items-center bg-background/80 backdrop-blur sticky bottom-0">
                                    {step > 1 ? (
                                        <Button 
                                            type="button" variant="ghost" 
                                            onClick={handleBack} 
                                            className="rounded-xl h-12 px-6"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                        </Button>
                                    ) : <div />}

                                    {step < 4 ? (
                                        <Button 
                                            type="button" 
                                            disabled={
                                                (step === 1 && (!values.fullName || !values.email || values.nin?.length !== 18)) ||
                                                (step === 2 && !allRequirementsChecked) ||
                                                (step === 3 && !idCardImage)
                                            }
                                            onClick={handleNext}
                                            className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
                                        >
                                            Next <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-10 font-black shadow-lg shadow-emerald-500/20"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONFIRM BOOKING"}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-10 text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black mb-2">Success! 🎉</h2>
                        <p className="text-muted-foreground mb-8">
                            Your reservation is pending. Our team will verify your details and contact you within 24 hours.
                        </p>

                        <div className="bg-primary/5 rounded-2xl p-6 border-2 border-dashed border-primary/30 mb-8 relative group">
                            <div className="text-[10px] font-black uppercase text-primary/60 tracking-[0.2em] mb-2">Reservation Code</div>
                            <div className="text-3xl font-black text-primary font-mono select-all">
                                {resCode}
                            </div>
                            <button 
                                onClick={copyCode}
                                className="mt-4 flex items-center gap-2 mx-auto text-xs font-bold text-primary hover:text-secondary transition-colors"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "COPIED" : "COPY CODE"}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <DialogClose asChild>
                                <Button className="w-full h-12 rounded-xl bg-primary text-white font-bold">Done</Button>
                            </DialogClose>
                            <p className="text-xs text-muted-foreground">Save your code to track your reservation later.</p>
                        </div>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}
