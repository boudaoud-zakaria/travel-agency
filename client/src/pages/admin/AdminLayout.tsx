import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Mail
} from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { mutate: logout } = useLogout();
  const { data: user, isLoading } = useUser();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user || (user.role !== 'EMPLOYEE' && user.role !== 'SUPER_ADMIN')) {
    window.location.href = "/auth";
    return null;
  }

  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/packages", icon: Package, label: "Packages" },
    { href: "/admin/reservations", icon: Calendar, label: "Reservations" },
    { href: "/admin/contact", icon: Mail, label: "Messages" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Al-Anwar
          </h2>
          <p className="text-xs text-primary-foreground/60">Admin Portal</p>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-primary-foreground/70 hover:bg-white/5 hover:text-white"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              {user.name[0]}
            </div>
            <div className="flex-grow min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-primary-foreground/50 truncate">{user.email}</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 mt-2"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
