import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import {
  LayoutDashboard, Package, Calendar, Users, Settings, LogOut,
  Plane, Bell, ChevronDown, Menu, X,
  Globe, ChevronRight, ClipboardList, BarChart3, UserCheck
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  icon: any;
  label: string;
  badge?: number;
  children?: NavItem[];
}

const adminNav: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/reservations", icon: Calendar, label: "Reservations", badge: 18 },
  { href: "/admin/packages", icon: Package, label: "Packages" },
  { href: "/admin/employees", icon: Users, label: "Employees" },
  { href: "/admin/schedule", icon: ClipboardList, label: "Schedule" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

const employeeNav: NavItem[] = [
  { href: "/employee", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/employee/reservations", icon: Calendar, label: "My Reservations", badge: 5 },
  { href: "/employee/stats", icon: BarChart3, label: "My Statistics" },
  { href: "/employee/profile", icon: UserCheck, label: "Profile" },
];

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const [location] = useLocation();
  const isActive = location === item.href;

  return (
    <Link href={item.href}>
      <div
        className={`sidebar-item group cursor-pointer ${isActive ? "sidebar-item-active" : "text-white/60"}`}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-accent" : "text-white/50 group-hover:text-white"}`} />
        {!collapsed && (
          <span className="text-sm font-medium flex-1">{item.label}</span>
        )}
        {!collapsed && item.badge && item.badge > 0 ? (
          <span className="ml-auto bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        ) : null}
        {collapsed && item.badge && item.badge > 0 ? (
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        ) : null}
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const isAdmin = (user as any)?.role === "SUPER_ADMIN";
  const navItems = isAdmin ? adminNav : employeeNav;

  // Breadcrumb
  const crumbs = location.split("/").filter(Boolean);

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed && !mobile ? "justify-center px-4" : "gap-3 px-6"} py-6 border-b border-white/10`}>
        <div className="w-9 h-9 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center shrink-0">
          <Plane className="w-4 h-4 text-white rotate-45" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <div className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>رحلة</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest">RIHLA</div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white/40 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!collapsed || mobile) && (
        <div className="px-6 py-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isAdmin ? "bg-accent/20 text-accent" : "bg-blue-400/20 text-blue-300"
            }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {isAdmin ? "Super Admin" : "Employee"}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {(!collapsed || mobile) && (
          <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Navigation</div>
        )}
        {navItems.map((item) => (
          <div key={item.href} className="relative">
            <SidebarItem item={item} collapsed={collapsed && !mobile} />
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-white/10 p-4 ${collapsed && !mobile ? "flex justify-center" : ""}`}>
        {collapsed && !mobile ? (
          <button
            onClick={() => logout()}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user as any)?.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{(user as any)?.name || "User"}</div>
              <div className="text-white/40 text-xs truncate">{(user as any)?.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-primary shadow-2xl shrink-0 relative z-30"
        style={{ background: "linear-gradient(180deg, hsl(215 52% 20%) 0%, hsl(215 52% 16%) 100%)" }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 bottom-0 w-[260px] z-50 md:hidden flex flex-col shadow-2xl"
              style={{ background: "linear-gradient(180deg, hsl(215 52% 20%) 0%, hsl(215 52% 16%) 100%)" }}
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
          <div className="flex items-center px-4 md:px-6 h-16 gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm flex-1 min-w-0">
              <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              {crumbs.slice(1).map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="capitalize font-medium text-foreground">{crumb}</span>
                </span>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Public site link */}
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hidden md:flex text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  View Site
                </Button>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
              </button>

              {/* User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {(user as any)?.name?.[0] || "U"}
                    </div>
                    <span className="text-sm font-medium hidden md:block">{(user as any)?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
