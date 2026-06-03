import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import {
    LayoutDashboard, Calendar, BarChart3, UserCheck, LogOut,
    Plane, ChevronDown, Menu, X, ChevronRight, Globe
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import NotificationPanel from "@/components/employee/NotificationPanel";

const navItems = [
    { href: "/employee", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/employee/reservations", icon: Calendar, label: "My Reservations", badge: 5 },
    { href: "/employee/stats", icon: BarChart3, label: "My Statistics" },
    { href: "/employee/profile", icon: UserCheck, label: "Profile" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { data: user } = useUser();
    const { mutate: logout } = useLogout();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [location] = useLocation();

    const crumbs = location.split("/").filter(Boolean);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
                <div className="w-9 h-9 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4 text-white rotate-45" />
                </div>
                <div>
                    <div className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>رحلة</div>
                    <div className="text-white/40 text-[10px] uppercase tracking-widest">Employee Portal</div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="ml-auto text-white/40 hover:text-white md:hidden" aria-label="Close navigation menu">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="px-6 py-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    Employee
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`sidebar-item group cursor-pointer ${isActive ? "sidebar-item-active" : "text-white/60"}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-accent" : "text-white/50 group-hover:text-white"}`} />
                                <span className="text-sm font-medium flex-1">{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(user as any)?.name?.[0] || "E"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{(user as any)?.name || "Employee"}</div>
                        <div className="text-white/40 text-xs truncate">{(user as any)?.email}</div>
                    </div>
                    <button onClick={() => logout()} className="text-white/40 hover:text-white p-1" aria-label="Sign out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-muted/10 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-[240px] shrink-0"
                style={{ background: "linear-gradient(180deg, hsl(215 52% 20%) 0%, hsl(215 52% 16%) 100%)" }}
            >
                <SidebarContent />
            </aside>

            {/* Mobile */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                            transition={{ duration: 0.25 }}
                            className="fixed left-0 top-0 bottom-0 w-[240px] z-50 md:hidden flex flex-col"
                            style={{ background: "linear-gradient(180deg, hsl(215 52% 20%) 0%, hsl(215 52% 16%) 100%)" }}
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center px-4 md:px-6 h-16 gap-4">
                        <button onClick={() => setMobileOpen(true)} className="md:hidden text-muted-foreground" aria-label="Open navigation menu">
                            <Menu className="w-5 h-5" />
                        </button>
                        <nav className="flex items-center gap-1 text-sm flex-1">
                            <Link href="/employee" className="text-muted-foreground hover:text-primary">Home</Link>
                            {crumbs.slice(1).map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                                    <span className="capitalize font-medium text-foreground">{crumb}</span>
                                </span>
                            ))}
                        </nav>
                        <div className="flex items-center gap-2">
                            <Link href="/"><Button variant="ghost" size="sm" className="gap-1.5 text-xs hidden md:flex"><Globe className="w-3.5 h-3.5" />View Site</Button></Link>
                            <NotificationPanel />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-border">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                                            {(user as any)?.name?.[0] || "E"}
                                        </div>
                                        <span className="text-sm hidden md:block">{(user as any)?.name}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild><Link href="/employee/profile">Profile</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => logout()} className="text-destructive gap-2">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
