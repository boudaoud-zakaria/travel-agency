import { useState, useRef } from "react";
import {
    Plus, Search, Edit2, Archive, Eye, Star,
    Clock, Users, Globe, CheckCircle, ChevronLeft, ChevronRight,
    CalendarDays, ShieldCheck, Trash2, X, AlertCircle, Mountain,
    BarChart3, ImageIcon, Upload, TrendingUp, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/use-packages";

const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    ARCHIVED: "bg-red-100 text-red-800 border-red-200",
};

const defaultRequirements = [
    "Valid National ID card (NIN)",
    "Age between 18 and 60 years",
    "Medical fitness certificate",
];

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&auto=format&fit=crop";

function normalizePkg(p: any) {
    const images: string[] = Array.isArray(p.images) ? p.images : [];
    const departureDates: string[] = Array.isArray(p.departureDates) ? p.departureDates : [];
    const requirements: string[] = Array.isArray(p.requirements) ? p.requirements : [];
    return {
        id: p.id as number,
        titleEn: (p.titleEn ?? "") as string,
        destination: (p.destination ?? "") as string,
        hikingDate: (departureDates[0] ?? "") as string,
        pricePerPerson: Number(p.pricePerPerson ?? 0),
        durationDays: (p.durationDays ?? 0) as number,
        status: (p.status ?? "DRAFT") as string,
        rating: Number(p.rating ?? 0),
        bookings: (p.totalBookings ?? 0) as number,
        capacity: (p.maxCapacity ?? 0) as number,
        revenue: (p.totalRevenue ?? 0) as number,
        image: images[0] ?? FALLBACK_IMAGE,
        secondaryImages: images.slice(1) as string[],
        requirements,
        monthlyBookings: [] as { month: string; bookings: number }[],
    };
}

function PackageStatsModal({ pkg, open, onClose }: { pkg: any; open: boolean; onClose: () => void }) {
    if (!pkg) return null;
    const fillRate = pkg.capacity > 0 ? Math.round((pkg.bookings / pkg.capacity) * 100) : 0;
    const pieData = [
        { name: "Filled", value: pkg.bookings },
        { name: "Available", value: Math.max(0, pkg.capacity - pkg.bookings) },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Package Statistics
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <Mountain className="w-4 h-4" />
                        {pkg.titleEn} — {pkg.destination}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Revenue", value: `${(pkg.revenue || 0).toLocaleString("fr-DZ")} DZD`, icon: DollarSign, color: "bg-primary/5 border-primary/20 text-primary" },
                            { label: "Bookings", value: `${pkg.bookings} / ${pkg.capacity}`, icon: Users, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                            { label: "Fill Rate", value: `${fillRate}%`, icon: TrendingUp, color: "bg-blue-50 border-blue-200 text-blue-700" },
                            { label: "Rating", value: pkg.rating > 0 ? `★ ${pkg.rating}` : "N/A", icon: Star, color: "bg-amber-50 border-amber-200 text-amber-700" },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className={`rounded-xl border p-4 ${color}`}>
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <Icon className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                                </div>
                                <div className="text-xl font-black">{value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Package Images Gallery */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Package Images
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative col-span-2 h-48 rounded-xl overflow-hidden border border-border">
                                <img src={pkg.image} alt="Main" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold">Main Image</div>
                            </div>
                            <div className="col-span-1 flex flex-col gap-3">
                                {pkg.secondaryImages?.length > 0 ? pkg.secondaryImages.slice(0, 2).map((img: string, i: number) => (
                                    <div key={i} className="h-[90px] rounded-xl overflow-hidden border border-border relative">
                                        <img src={img} alt={`Secondary ${i + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                )) : (
                                    <div className="h-48 rounded-xl border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground text-xs">
                                        No secondary images
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    {pkg.monthlyBookings && pkg.monthlyBookings.length > 0 && (
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Monthly Bookings</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={pkg.monthlyBookings}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Bar dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Capacity Fill</h3>
                                <div className="h-48 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                                {pieData.map((_, index) => (
                                                    <Cell key={index} fill={CHART_COLORS[index]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requirements List */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-600" /> Client Requirements
                        </h3>
                        <div className="space-y-2">
                            {pkg.requirements?.map((req: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">
                                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                    {req}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminPackages() {
    const { data: pkgData, isLoading: pkgsLoading } = usePackages();
    const createPackage = useCreatePackage();
    const updatePackage = useUpdatePackage();
    const deletePackage = useDeletePackage();

    const packages = ((pkgData as any[]) ?? []).map(normalizePkg);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [view, setView] = useState<"grid" | "table">("grid");
    const [createModal, setCreateModal] = useState(false);
    const [editPkg, setEditPkg] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [newRequirement, setNewRequirement] = useState("");
    const [statsModal, setStatsModal] = useState(false);
    const [statsPkg, setStatsPkg] = useState<any>(null);
    const mainImageRef = useRef<HTMLInputElement>(null);
    const secImageRef = useRef<HTMLInputElement>(null);

    const ITEMS_PER_PAGE = 6;

    const [form, setForm] = useState({
        titleEn: "",
        destination: "",
        hikingDate: "",
        pricePerPerson: "",
        durationDays: "",
        capacity: "",
        status: "DRAFT",
        requirements: [...defaultRequirements],
        mainImageUrl: "",
        secondaryImagesUrl: "",
        mainImagePreview: "",
        secondaryImagePreviews: [] as string[],
    });

    const filtered = packages.filter(p => {
        const matchSearch = p.titleEn.toLowerCase().includes(search.toLowerCase()) || p.destination.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const paginated = view === "grid" ? filtered : filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const resetForm = () => setForm({
        titleEn: "", destination: "", hikingDate: "", pricePerPerson: "",
        durationDays: "", capacity: "", status: "DRAFT", requirements: [...defaultRequirements],
        mainImageUrl: "", secondaryImagesUrl: "", mainImagePreview: "", secondaryImagePreviews: [],
    });

    const handleMainImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setForm(f => ({ ...f, mainImagePreview: ev.target?.result as string }));
        reader.readAsDataURL(file);
    };

    const handleSecondaryImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => setForm(f => ({ ...f, secondaryImagePreviews: [...f.secondaryImagePreviews, ev.target?.result as string] }));
            reader.readAsDataURL(file);
        });
    };

    const removeSecondaryImage = (index: number) => {
        setForm(f => ({ ...f, secondaryImagePreviews: f.secondaryImagePreviews.filter((_, i) => i !== index) }));
    };

    const handleSave = async () => {
        const mainImg = form.mainImagePreview || form.mainImageUrl || FALLBACK_IMAGE;
        const secImgs = [
            ...form.secondaryImagePreviews,
            ...form.secondaryImagesUrl.split(",").map(s => s.trim()).filter(Boolean)
        ];
        const allImages = [mainImg, ...secImgs].filter(Boolean);

        const payload: Record<string, unknown> = {
            titleEn: form.titleEn,
            titleAr: form.titleEn,
            titleFr: form.titleEn,
            destination: form.destination,
            type: "DOMESTIC",
            pricePerPerson: form.pricePerPerson,
            durationDays: Number(form.durationDays),
            maxCapacity: Number(form.capacity),
            departureDates: form.hikingDate ? [form.hikingDate] : [],
            images: allImages,
            requirements: form.requirements,
            status: form.status,
            inclusions: [],
            exclusions: [],
            itinerary: [],
        };

        if (editPkg) {
            await updatePackage.mutateAsync({ id: editPkg.id, ...payload });
        } else {
            await createPackage.mutateAsync(payload);
        }
        setCreateModal(false);
        setEditPkg(null);
        resetForm();
    };

    const openEdit = (pkg: any) => {
        setEditPkg(pkg);
        setForm({
            titleEn: pkg.titleEn,
            destination: pkg.destination,
            hikingDate: pkg.hikingDate,
            pricePerPerson: String(pkg.pricePerPerson),
            durationDays: String(pkg.durationDays),
            capacity: String(pkg.capacity),
            status: pkg.status,
            requirements: [...(pkg.requirements || [])],
            mainImageUrl: pkg.image || "",
            secondaryImagesUrl: "",
            mainImagePreview: "",
            secondaryImagePreviews: [...(pkg.secondaryImages || [])],
        });
        setCreateModal(true);
    };

    const archivePkg = (id: number) => {
        deletePackage.mutate(id);
    };

    const addRequirement = () => {
        const trimmed = newRequirement.trim();
        if (!trimmed) return;
        setForm(f => ({ ...f, requirements: [...f.requirements, trimmed] }));
        setNewRequirement("");
    };

    const removeRequirement = (index: number) => {
        setForm(f => ({ ...f, requirements: f.requirements.filter((_, i) => i !== index) }));
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const isSaving = createPackage.isPending || updatePackage.isPending;

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Mountain className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold">Hiking Packages</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {pkgsLoading ? "Loading..." : `${packages.filter(p => p.status === "ACTIVE").length} active · ${packages.filter(p => p.status === "DRAFT").length} drafts`}
                    </p>
                </div>
                <Button
                    onClick={() => { setEditPkg(null); resetForm(); setCreateModal(true); }}
                    className="gap-2 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-md shadow-primary/20 hover:opacity-90"
                >
                    <Plus className="w-4 h-4" /> New Hiking Package
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search packages..." className="pl-10 h-10 border-muted" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex border border-border rounded-lg overflow-hidden">
                    {(["grid", "table"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-2 text-xs font-semibold capitalize transition-colors ${view === v ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/50"}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading skeleton */}
            {pkgsLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-white overflow-hidden">
                            <div className="h-44 animate-pulse bg-muted" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
                                <div className="h-3 w-1/2 animate-pulse bg-muted rounded" />
                                <div className="h-3 w-full animate-pulse bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid view */}
            {!pkgsLoading && view === "grid" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filtered.map((pkg, i) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Main Image */}
                                <div className="relative h-44 overflow-hidden">
                                    <img src={pkg.image} alt={pkg.titleEn} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-100 text-emerald-800 border-emerald-200">
                                            🥾 Hiking
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[pkg.status]}`}>
                                            {pkg.status}
                                        </span>
                                    </div>
                                    {pkg.rating > 0 && (
                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="text-white text-xs font-bold">{pkg.rating}</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-primary/90 rounded-full px-2 py-0.5">
                                        <CalendarDays className="w-3 h-3 text-white" />
                                        <span className="text-white text-xs font-bold">{formatDate(pkg.hikingDate)}</span>
                                    </div>
                                </div>

                                {/* Secondary images strip */}
                                {pkg.secondaryImages && pkg.secondaryImages.length > 0 && (
                                    <div className="flex gap-1 p-2 bg-muted/20 border-b border-border">
                                        {pkg.secondaryImages.slice(0, 3).map((img, idx) => (
                                            <img key={idx} src={img} alt="" className="w-14 h-10 object-cover rounded-md border border-border flex-shrink-0" />
                                        ))}
                                        {pkg.secondaryImages.length > 3 && (
                                            <div className="w-14 h-10 rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground font-semibold flex-shrink-0">
                                                +{pkg.secondaryImages.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-4">
                                    <h3 className="font-bold text-foreground mb-1">{pkg.titleEn}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                        <Globe className="w-3.5 h-3.5" /> {pkg.destination}
                                    </p>

                                    {/* Requirements preview */}
                                    {pkg.requirements && pkg.requirements.length > 0 && (
                                        <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-100">
                                            <div className="flex items-center gap-1 mb-1">
                                                <ShieldCheck className="w-3 h-3 text-amber-600" />
                                                <span className="text-xs font-semibold text-amber-700">Client Requirements</span>
                                            </div>
                                            <div className="text-xs text-amber-800">
                                                {pkg.requirements.slice(0, 2).map((r, i) => (
                                                    <div key={i} className="flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                                        {r}
                                                    </div>
                                                ))}
                                                {pkg.requirements.length > 2 && (
                                                    <span className="text-amber-600 font-medium">+{pkg.requirements.length - 2} more...</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {pkg.durationDays} days</span>
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {pkg.bookings}/{pkg.capacity}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Per person</div>
                                            <div className="font-black text-primary">{pkg.pricePerPerson.toLocaleString('fr-DZ')} DZD</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setStatsPkg(pkg); setStatsModal(true); }}
                                                className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                                                title="View Statistics"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEdit(pkg)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => archivePkg(pkg.id)}
                                                disabled={deletePackage.isPending}
                                                className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Table view */}
            {!pkgsLoading && view === "table" && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/40 border-b border-border">
                                {["Package", "Destination", "Hiking Date", "Duration", "Price/Person", "Bookings", "Requirements", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((pkg) => (
                                <tr key={pkg.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={pkg.image} className="w-10 h-10 rounded-lg object-cover shrink-0" alt={pkg.titleEn} />
                                            <div className="font-semibold text-sm">{pkg.titleEn}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-muted-foreground">{pkg.destination}</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                                            <CalendarDays className="w-3 h-3" />
                                            {formatDate(pkg.hikingDate)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-xs">{pkg.durationDays} days</td>
                                    <td className="px-4 py-4 font-bold text-xs">{pkg.pricePerPerson.toLocaleString('fr-DZ')} DZD</td>
                                    <td className="px-4 py-4 text-xs">{pkg.bookings}/{pkg.capacity}</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                            <ShieldCheck className="w-3 h-3" />
                                            {pkg.requirements?.length || 0} rules
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[pkg.status]}`}>
                                            {pkg.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setStatsPkg(pkg); setStatsModal(true); }}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                                                title="Statistics"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEdit(pkg)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => archivePkg(pkg.id)}
                                                disabled={deletePackage.isPending}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={createModal} onOpenChange={(open) => { if (!open) { setCreateModal(false); setEditPkg(null); resetForm(); } }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mountain className="w-5 h-5 text-primary" />
                            {editPkg ? "Edit Hiking Package" : "Create New Hiking Package"}
                        </DialogTitle>
                        <DialogDescription>Fill in the hiking package details and set client eligibility requirements</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Mountain className="w-4 h-4" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-semibold">Package Title *</Label>
                                    <Input
                                        value={form.titleEn}
                                        onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
                                        placeholder="e.g., Tassili N'Ajjer Expedition"
                                        className="h-10"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-semibold">Destination *</Label>
                                    <Input
                                        value={form.destination}
                                        onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                                        placeholder="e.g., Tamanrasset, Algeria"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5 text-primary" />
                                        Hiking Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.hikingDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={e => setForm(f => ({ ...f, hikingDate: e.target.value }))}
                                        className="h-10"
                                    />
                                    <p className="text-xs text-muted-foreground">Auto-assigned to client reservations</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Status *</Label>
                                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Price per Person (DZD) *</Label>
                                    <Input
                                        type="number"
                                        value={form.pricePerPerson}
                                        onChange={e => setForm(f => ({ ...f, pricePerPerson: e.target.value }))}
                                        placeholder="45000"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Duration (Days) *</Label>
                                    <Input
                                        type="number"
                                        value={form.durationDays}
                                        onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                                        placeholder="3"
                                        className="h-10"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-semibold">Max Capacity *</Label>
                                    <Input
                                        type="number"
                                        value={form.capacity}
                                        onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                                        placeholder="20"
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" /> Package Images
                            </h3>

                            {/* Main Image */}
                            <div className="space-y-3 mb-4">
                                <Label className="text-xs font-semibold">Main Image</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => mainImageRef.current?.click()}
                                            className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
                                        >
                                            <Upload className="w-6 h-6 text-primary" />
                                            <span className="text-xs font-semibold">Upload File</span>
                                        </button>
                                        <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageFile} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Input
                                            value={form.mainImageUrl}
                                            onChange={e => setForm(f => ({ ...f, mainImageUrl: e.target.value }))}
                                            placeholder="or paste image URL..."
                                            className="h-10 text-xs"
                                        />
                                        <p className="text-xs text-muted-foreground">Upload file or paste URL</p>
                                    </div>
                                </div>
                                {(form.mainImagePreview || form.mainImageUrl) && (
                                    <div className="relative rounded-xl overflow-hidden border border-border h-32">
                                        <img
                                            src={form.mainImagePreview || form.mainImageUrl}
                                            alt="Main preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, mainImagePreview: "", mainImageUrl: "" }))}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">Main Image</div>
                                    </div>
                                )}
                            </div>

                            {/* Secondary Images */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold">Secondary Images (Gallery)</Label>
                                <button
                                    type="button"
                                    onClick={() => secImageRef.current?.click()}
                                    className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-secondary/30 hover:border-secondary hover:bg-secondary/5 transition-all"
                                >
                                    <Upload className="w-6 h-6 text-secondary" />
                                    <span className="text-xs font-semibold">Upload Multiple Gallery Images</span>
                                    <span className="text-xs text-muted-foreground">Select multiple files at once</span>
                                </button>
                                <input ref={secImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSecondaryImageFiles} />

                                {form.secondaryImagePreviews.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {form.secondaryImagePreviews.map((img, idx) => (
                                            <div key={idx} className="relative rounded-lg overflow-hidden border border-border h-16">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSecondaryImage(idx)}
                                                    className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Client Requirements Section */}
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-600" /> Client Eligibility Requirements
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Clients must meet these requirements when making a reservation. They will be shown the list and asked to confirm compliance.
                            </p>

                            {/* Info Banner */}
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-3">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    <strong>Important:</strong> Clients will be required to upload a photo of their ID card to verify age and identity during reservation.
                                </p>
                            </div>

                            {/* Existing requirements */}
                            <div className="space-y-2 mb-3">
                                {form.requirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border group">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="text-sm flex-1">{req}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeRequirement(i)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add new requirement */}
                            <div className="flex gap-2">
                                <Input
                                    value={newRequirement}
                                    onChange={e => setNewRequirement(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
                                    placeholder="Add a requirement (e.g., Age between 18-55)"
                                    className="h-9 text-sm"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addRequirement}
                                    disabled={!newRequirement.trim()}
                                    className="h-9 px-3 bg-primary text-white shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Press Enter or click + to add</p>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => { setCreateModal(false); setEditPkg(null); resetForm(); }}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !form.titleEn || !form.destination || !form.hikingDate || !form.pricePerPerson}
                            className="bg-gradient-to-r from-primary to-secondary text-white border-0"
                        >
                            {isSaving ? "Saving..." : (editPkg ? "Save Changes" : "Create Package")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Package Stats Modal */}
            <PackageStatsModal
                pkg={statsPkg}
                open={statsModal}
                onClose={() => setStatsModal(false)}
            />
        </div>
    );
}
