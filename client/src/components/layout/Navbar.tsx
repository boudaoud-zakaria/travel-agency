import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Globe, Menu, User, LogOut, Mountain, ChevronDown, Phone, FileText, Map, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿', dir: 'rtl' },
];

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.expeditions") },
    { href: "/packages", label: t("nav.tours") },
  ];

  const handleLang = (code: string) => {
    const selected = languages.find(l => l.code === code)!;
    document.documentElement.dir = selected.dir;
    document.documentElement.lang = code;
    i18n.changeLanguage(code);
  };

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-border/50"
          : "bg-white/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest py-2 px-4 hidden md:block">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-emerald-400" /> +213 21 00 00 00
            </span>
            <span className="flex items-center gap-2">
              <Map className="w-3 h-3 text-emerald-400" /> hq@travelgenius.dz
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              {t("brand")} — Algeria 🇩🇿
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              {t("nav.guides")}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-300">
            <Mountain className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-lg border-2 border-white shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-primary leading-none tracking-tighter uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              {t("brand")}
            </span>
            <span className="text-[10px] font-black tracking-[4px] text-emerald-600 uppercase leading-none mt-1">
              {t("tagline")}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 group ${
                location === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
              {location === link.href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-full"
                />
              )}
              <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary h-10 px-4 rounded-xl border border-transparent hover:border-border/50">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-tighter">{currentLang.flag} {currentLang.code}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-border/50">
              {languages.map(l => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => handleLang(l.code)}
                  className={`gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${lang === l.code ? 'bg-primary text-white' : 'hover:bg-muted font-medium'}`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="text-sm font-bold">{l.label}</span>
                  {lang === l.code && <motion.div layoutId="lang-active" className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-3 h-11 px-4 rounded-2xl border border-border/50 hover:bg-muted/50 transition-all">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-emerald-900 flex items-center justify-center text-white text-[10px] font-black uppercase">
                    {(user as any).name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{(user as any).name}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-border/50">
                <DropdownMenuItem asChild className="p-0">
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-muted">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t("nav.dashboard")}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Manage Expeditions</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-destructive hover:bg-destructive/5">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/my-reservation">
                <Button variant="ghost" className="h-10 text-xs font-black uppercase tracking-widest gap-2 text-muted-foreground hover:text-primary px-4">
                  <FileText className="h-4 w-4" /> {t("nav.tracking")}
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="ghost" className="h-10 text-xs font-black uppercase tracking-widest px-4 hover:bg-muted rounded-xl">
                  {t("nav.entry")}
                </Button>
              </Link>
              <Link href="/reserve">
                <Button
                  size="sm"
                  className="h-11 px-6 bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/20 border-0 font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                >
                  {t("nav.book")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 rounded-xl">
                <Menu className="h-7 w-7" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-0">
              <div className="bg-primary p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/20">
                  <Mountain className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-white font-black text-2xl tracking-tighter uppercase">{t("brand")}</div>
                  <div className="text-emerald-400 text-[10px] tracking-[4px] uppercase font-black mt-1">{t("tagline")}</div>
                </div>
              </div>
              
              <div className="p-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      location === link.href
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ArrowRight className={`w-4 h-4 transition-transform ${location === link.href ? "translate-x-0" : "-translate-x-2 opacity-0"}`} />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="p-6 mt-auto space-y-4 border-t border-border/50 bg-muted/20">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comms</span>
                  <div className="flex gap-2">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => handleLang(l.code)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                          lang === l.code ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {l.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {user ? (
                  <Button onClick={() => logout()} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-destructive/10">
                    <LogOut className="mr-3 h-5 w-5" /> Leave HQ
                  </Button>
                ) : (
                  <div className="grid gap-3">
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">User Entry</Button>
                    </Link>
                    <Link href="/reserve" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl">
                        Start Reservation
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
