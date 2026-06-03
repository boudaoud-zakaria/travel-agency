import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Globe, Mail, Phone, MapPin, Facebook, Instagram, Twitter,
    Save, Loader2, Building, Image, Link, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { settingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const sections = [
    { id: "agency", label: "Agency Profile", icon: Building },
    { id: "contact", label: "Contact & Social", icon: Globe },
    { id: "homepage", label: "Homepage Content", icon: Image },
];

const defaults = {
    name: "",
    nameAr: "",
    nameFr: "",
    address: "",
    email: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    heroTitle: "",
    heroSubtitle: "",
    featuredPackages: "",
};

export default function AdminSettings() {
    const [activeSection, setActiveSection] = useState("agency");
    const [saved, setSaved] = useState(false);
    const [agency, setAgency] = useState(defaults);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["/api/settings"],
        queryFn: () => settingsApi.get(),
    });

    // Populate form when settings load
    useEffect(() => {
        if (!settingsData) return;
        const s = settingsData as any;
        const social = s.socialLinks ?? {};
        setAgency({
            name: s.nameEn ?? "",
            nameAr: s.nameAr ?? "",
            nameFr: s.nameFr ?? "",
            address: s.address ?? "",
            email: s.email ?? "",
            phone: s.phone ?? "",
            whatsapp: social.whatsapp ?? "",
            facebook: social.facebook ?? "",
            instagram: social.instagram ?? "",
            twitter: social.twitter ?? "",
            heroTitle: s.heroTitleEn ?? "",
            heroSubtitle: s.heroSubtitleEn ?? "",
            featuredPackages: s.featuredPackages ?? "",
        });
    }, [settingsData]);

    const updateSettings = useMutation({
        mutationFn: (data: Record<string, unknown>) => settingsApi.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    const handleSave = () => {
        updateSettings.mutate({
            nameEn: agency.name,
            nameAr: agency.nameAr,
            nameFr: agency.nameFr,
            address: agency.address,
            email: agency.email,
            phone: agency.phone,
            heroTitleEn: agency.heroTitle,
            heroTitleAr: agency.heroTitle,
            heroTitleFr: agency.heroTitle,
            heroSubtitleEn: agency.heroSubtitle,
            heroSubtitleAr: agency.heroSubtitle,
            heroSubtitleFr: agency.heroSubtitle,
            socialLinks: {
                whatsapp: agency.whatsapp,
                facebook: agency.facebook,
                instagram: agency.instagram,
                twitter: agency.twitter,
            },
        });
    };

    const saving = updateSettings.isPending;

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">System Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage agency profile, contact info, and homepage content</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Loading settings...</div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar */}
                        <aside className="w-full md:w-56 shrink-0">
                            <nav className="space-y-1">
                                {sections.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === s.id
                                                ? "bg-primary text-white shadow-md"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            }`}
                                    >
                                        <s.icon className="w-4 h-4 shrink-0" />
                                        {s.label}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="flex-1">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6"
                            >
                                {activeSection === "agency" && (
                                    <>
                                        <div>
                                            <h2 className="font-bold text-lg mb-4">Agency Profile</h2>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Agency Name (English) *</Label>
                                                        <Input value={agency.name} onChange={e => setAgency(f => ({ ...f, name: e.target.value }))} className="h-10" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Agency Name (Arabic)</Label>
                                                        <Input value={agency.nameAr} onChange={e => setAgency(f => ({ ...f, nameAr: e.target.value }))} className="h-10 text-right" dir="rtl" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Agency Name (French)</Label>
                                                        <Input value={agency.nameFr} onChange={e => setAgency(f => ({ ...f, nameFr: e.target.value }))} className="h-10" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" /> Address
                                                        </Label>
                                                        <Textarea value={agency.address} onChange={e => setAgency(f => ({ ...f, address: e.target.value }))} rows={2} className="resize-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeSection === "contact" && (
                                    <>
                                        <div>
                                            <h2 className="font-bold text-lg mb-4">Contact & Social Links</h2>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</Label>
                                                        <Input type="email" value={agency.email} onChange={e => setAgency(f => ({ ...f, email: e.target.value }))} className="h-10" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</Label>
                                                        <Input value={agency.phone} onChange={e => setAgency(f => ({ ...f, phone: e.target.value }))} className="h-10" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">WhatsApp</Label>
                                                        <Input value={agency.whatsapp} onChange={e => setAgency(f => ({ ...f, whatsapp: e.target.value }))} className="h-10" />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-border">
                                                    <h3 className="font-semibold text-sm mb-3">Social Media Links</h3>
                                                    <div className="space-y-3">
                                                        {[
                                                            { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/..." },
                                                            { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/..." },
                                                            { key: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/..." },
                                                        ].map(({ key, label, icon: Icon, placeholder }) => (
                                                            <div key={key} className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                                                </div>
                                                                <Input
                                                                    value={(agency as any)[key]}
                                                                    onChange={e => setAgency(f => ({ ...f, [key]: e.target.value }))}
                                                                    placeholder={placeholder}
                                                                    className="h-10 flex-1"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeSection === "homepage" && (
                                    <>
                                        <div>
                                            <h2 className="font-bold text-lg mb-4">Homepage Content</h2>
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                                    <h3 className="font-semibold text-sm mb-3">Hero Section</h3>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold">Hero Title</Label>
                                                            <Input value={agency.heroTitle} onChange={e => setAgency(f => ({ ...f, heroTitle: e.target.value }))} className="h-10" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold">Hero Subtitle</Label>
                                                            <Textarea value={agency.heroSubtitle} onChange={e => setAgency(f => ({ ...f, heroSubtitle: e.target.value }))} rows={2} className="resize-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                                    <h3 className="font-semibold text-sm mb-3">Featured Packages</h3>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold">Package IDs (comma-separated)</Label>
                                                        <Input value={agency.featuredPackages} onChange={e => setAgency(f => ({ ...f, featuredPackages: e.target.value }))} placeholder="1, 2, 3" className="h-10" />
                                                        <p className="text-xs text-muted-foreground">Enter the IDs of packages to feature on the homepage.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Save Button */}
                                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                                    {saved && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 text-emerald-600 text-sm font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Settings saved!
                                        </motion.div>
                                    )}
                                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-white px-6">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Settings
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
