import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Mountain, ArrowRight, Clock, ShieldCheck, Zap } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Expeditions" },
  { href: "/packages", label: "Trekking Tours" },
  { href: "/about", label: "Explore Our HQ" },
  { href: "/contact", label: "Basecamp Contact" },
];

const packageTypes = [
  { href: "/packages?type=TREK", label: "🏔️ Alpine Treks" },
  { href: "/packages?type=SAHARA", label: "🏜️ Desert expeditions" },
  { href: "/packages?type=FOREST", label: "🌲 Wilderness Retreats" },
  { href: "/packages?type=CAMPING", label: "⛺ Camping Adventures" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground relative">
      {/* Top topographic-like separator */}
      <div className="bg-muted/10 h-2 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10" />

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">

          {/* Brand Col */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group cursor-pointer">
                <Mountain className="w-6 h-6 text-emerald-400 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <div className="text-2xl font-black uppercase tracking-tighter leading-none">Travel Genius</div>
                <div className="text-[10px] tracking-[4px] uppercase text-emerald-400 font-black mt-1">Adventure HQ</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed font-medium">
              Algeria's premier expedition agency. We specialize in high-altitude trekking, deep Sahara expeditions, and wilderness survival experiences. Leave the city, find the wild.
            </p>
            {/* Certifications */}
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Alpinist Certified
              </span>
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Pro Gear Rental
              </span>
            </div>
            {/* Socials */}
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/10 shadow-lg"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="font-black text-xs text-white tracking-[4px] uppercase border-b border-white/10 pb-4">Navigation</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-all font-bold group"
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Expedition Categories */}
          <div className="space-y-8">
            <h4 className="font-black text-xs text-white tracking-[4px] uppercase border-b border-white/10 pb-4">Categories</h4>
            <ul className="space-y-4">
              {packageTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold text-white/60 hover:text-emerald-400 transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-6 border-t border-white/10">
              <h4 className="font-black text-[10px] text-white/40 uppercase tracking-[3px] mb-4">Basecamp Comms</h4>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-white/50">Mon – Fri:</span>
                  <span className="text-emerald-400">08:00 – 18:00</span>
                </div>
                <div className="flex justify-between items-center px-3">
                  <span className="text-white/30 uppercase tracking-widest text-[9px]">Sat Support:</span>
                  <span className="text-white/60">09:00 – 16:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* HQ Location */}
          <div className="space-y-8">
            <h4 className="font-black text-xs text-white tracking-[4px] uppercase border-b border-white/10 pb-4">HQ Location</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-sm text-white/60 font-medium leading-relaxed">
                  123 Rue Didouche Mourad,<br />
                  Alger-Centre 16000, Algeria
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <a href="tel:+213210000000" className="text-sm text-white/60 hover:text-white font-bold transition-all" dir="ltr">
                  +213 21 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <a href="mailto:hq@travelgenius.dz" className="text-sm text-white/60 hover:text-white font-bold transition-all">
                  hq@travelgenius.dz
                </a>
              </li>
            </ul>

            {/* Newsletter mini */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-white/50 mb-4">Expedition Log Updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="comm-link@email.com"
                  className="flex-1 bg-white/5 text-white placeholder:text-white/20 rounded-xl px-4 py-3 text-xs border border-white/10 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <button className="bg-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
              © {new Date().getFullYear()} TRAVEL GENIUS ALGERIA — EST 2009.
            </p>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
              <Link href="/privacy" className="hover:text-emerald-400 transition-all">Privacy Log</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition-all">Rules of Conduct</Link>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Made in Algiers</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-lg">🇩🇿</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
