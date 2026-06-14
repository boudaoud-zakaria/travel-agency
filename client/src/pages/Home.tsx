import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PackageCard } from "@/components/packages/PackageCard";
import { usePackages } from "@/hooks/use-packages";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, MapPin, Clock,
  Shield, Award, HeartHandshake, Globe, Phone, Mountain, Tent, Trees, Wind, Camera, ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { useRef, useState, useEffect } from "react"; // useState used in AnimatedCounter
import { useTranslation } from "react-i18next";

/* ── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Fade In Section ──────────────────────────────────────── */
function FadeSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { data: packages, isLoading } = usePackages({ status: "ACTIVE" });
  const featuredPackages = packages?.slice(0, 3) || [];

  const packageTypes = [
    {
      type: "TREK",
      icon: Mountain,
      title: "Alpine Treks",
      titleAr: "قمم الأطلس",
      color: "from-blue-500 to-indigo-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      desc: "Challenging summits and ridge walks in the Djurdjura and Blida Atlas ranges.",
    },
    {
      type: "SAHARA",
      icon: Wind,
      title: "Desert Expeditions",
      titleAr: "رحلات الصحراء",
      color: "from-amber-500 to-orange-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      desc: "Venture deep into the Tassili N'Ajjer and Hoggar for multi-day desert trekking.",
    },
    {
      type: "FOREST",
      icon: Trees,
      title: "Wilderness Retreats",
      titleAr: "خلوة الغابات",
      color: "from-emerald-500 to-teal-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      desc: "Lush forest trails and hidden waterfalls in El Kala and Akfadou regions.",
    },
    {
      type: "CAMPING",
      icon: Tent,
      title: "Camping Adventures",
      titleAr: "مغامرات التخييم",
      color: "from-rose-500 to-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      desc: "Night-under-stars experiences with full equipment provided for wild terrains.",
    },
  ];

  const stats = [
    { labelKey: "stats.summits", value: 450, suffix: "+", icon: "🏔️" },
    { labelKey: "stats.miles", value: 15000, suffix: "+", icon: "🥾" },
    { labelKey: "stats.guides", value: 25, suffix: "+", icon: "👤" },
    { labelKey: "stats.safety", value: 100, suffix: "%", icon: "🛡️" },
  ];

  const whyUs = [
    { icon: Shield, titleKey: "about.why.safety_title", descKey: "about.why.safety_desc", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: HeartHandshake, titleKey: "about.why.guides_title", descKey: "about.why.guides_desc", color: "text-rose-600", bg: "bg-rose-50" },
    { icon: Award, titleKey: "about.why.eco_title", descKey: "about.why.eco_desc", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: Camera, titleKey: "about.why.photo_title", descKey: "about.why.photo_desc", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">

        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&auto=format&fit=crop&q=80"
              alt="Algerian Mountains"
              className="w-full h-full object-cover"
              style={{ animation: "heroZoom 20s ease-in-out infinite alternate" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          </div>

          {/* Decorative horizontal lines */}
          <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
            {[15, 40, 65, 88].map((top, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-white/5"
                style={{ top: `${top}%` }}
              />
            ))}
          </div>

          <div className="container relative z-10 px-4 text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Country badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2.5 text-white text-xs font-semibold tracking-wider"
              >
                <span className="text-base">🇩🇿</span>
                {t("hero.badge")}
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </motion.div>

              {/* Main brand name */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9 }}
                className="flex flex-col items-center"
              >
                <h1
                  className="text-[clamp(2.5rem,8vw,6rem)] font-black text-white leading-none tracking-tighter uppercase"
                  style={{ fontFamily: "'Inter', sans-serif", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}
                >
                  {t("hero.headline1")}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="h-1 w-12 bg-emerald-400 rounded-full" />
                  <span
                    className="text-[clamp(1.8rem,5vw,4rem)] font-black tracking-tighter"
                    style={{ color: "#34d399", textShadow: "0 0 60px rgba(52,211,153,0.5)" }}
                  >
                    {t("hero.headline2")}
                  </span>
                  <div className="h-1 w-12 bg-emerald-400 rounded-full" />
                </div>
                <p className="text-white/60 text-sm font-black uppercase tracking-[6px] mt-3">
                  {t("hero.tagline")}
                </p>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.8 }}
                className="text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed font-medium"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/packages">
                  <Button
                    size="lg"
                    className="h-13 px-8 bg-white text-primary hover:bg-white/90 text-sm font-black rounded-2xl shadow-2xl border-0 gap-2"
                  >
                    <Mountain className="h-5 w-5" />
                    {t("hero.viewPeaks")}
                  </Button>
                </Link>
                <Link href="/reserve">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-13 px-8 bg-white/5 border-white/25 text-white hover:bg-white/15 backdrop-blur-md text-sm font-bold rounded-2xl gap-2"
                  >
                    {t("hero.startReservation")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40">
            <div className="w-px h-10 bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
          </div>
        </section>

        {/* ─── STATS STRIP ─────────────────────────────────── */}
        <section className="relative z-20 -mt-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-border/30 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <FadeSection key={idx} delay={idx * 0.1}>
                  <div className="text-center space-y-2 group">
                    <div className="text-4xl mb-2 flex justify-center group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
                    <div className="text-3xl md:text-4xl font-black text-primary">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t(stat.labelKey)}</div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PACKAGE TYPES ────────────────────────────────── */}
        <section className="py-24 mountain-bg">
          <div className="container mx-auto px-4">
            <FadeSection>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-[2px] border border-emerald-100 mb-6">
                  {t("trekTypes.sectionLabel")}
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-primary mb-4 leading-none">
                  {t("trekTypes.heading")}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto font-medium">
                  {t("trekTypes.desc")}
                </p>
              </div>
            </FadeSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packageTypes.map((type, idx) => (
                <FadeSection key={type.type} delay={idx * 0.1}>
                  <Link href={`/packages?type=${type.type}`}>
                    <div className={`group relative overflow-hidden rounded-3xl border-2 ${type.border} ${type.bg} p-8 h-full cursor-pointer hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl`}>
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <type.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-3 flex flex-col">
                        <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1">{type.titleAr}</span>
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{type.desc}</p>

                      <div className={`mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-gradient-to-r ${type.color} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {t("trekTypes.viewRoutes")} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: "var(--primary)" }} />
                      </div>

                      <div className="absolute -bottom-4 -right-2 text-9xl font-black text-black/5 pointer-events-none select-none">
                        0{idx + 1}
                      </div>
                    </div>
                  </Link>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURED PACKAGES ─────────────────────────────── */}
        <section className="py-24 bg-primary/[0.02]">
          <div className="container mx-auto px-4">
            <FadeSection>
              <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-6 text-center md:text-left">
                <div>
                  <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] mb-2">{t("packages.sectionLabel")}</div>
                  <h2 className="text-4xl md:text-5xl font-black text-primary">
                    {t("packages.heading")}
                  </h2>
                </div>
                <Link href="/packages">
                  <Button variant="ghost" className="font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white group">
                    {t("packages.viewAll")} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </FadeSection>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-80 bg-muted/40 animate-pulse rounded-3xl" />
                    <div className="h-6 bg-muted/40 animate-pulse rounded-full w-3/4" />
                    <div className="h-4 bg-muted/40 animate-pulse rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {featuredPackages.map((pkg: any) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <PackageCard
                      id={pkg.id}
                      title={pkg.titleEn}
                      description={pkg.descEn}
                      price={Number(pkg.pricePerPerson)}
                      image={pkg.images?.[0] || "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"}
                      duration={pkg.durationDays}
                      type={pkg.type}
                      rating={Number(pkg.rating)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── ABOUT / WHY CHOOSE US ───────────────────────── */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-primary fill-current">
              <path d="M0 20 Q20 15 40 30 T80 25 T100 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 40 Q20 35 40 50 T80 45 T100 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 60 Q20 55 40 70 T80 65 T100 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <FadeSection>
                <div className="relative">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                      <img
                        src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
                        alt="Hiker at summit"
                        className="rounded-[2.5rem] w-full h-[450px] object-cover shadow-2xl border-8 border-white"
                      />
                    </div>
                    <div className="col-span-4 self-end space-y-4 -mb-8">
                      <img
                        src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400"
                        alt="Forest trail"
                        className="rounded-3xl w-full h-40 object-cover shadow-xl border-4 border-white"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400"
                        alt="Lake View"
                        className="rounded-3xl w-full h-60 object-cover shadow-xl border-4 border-white"
                      />
                    </div>
                  </div>

                  <div className="absolute -top-10 -left-6 bg-primary text-white p-6 rounded-[2rem] shadow-2xl rotate-[-5deg]">
                    <div className="text-4xl font-black">15+</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest leading-none mt-1">{t("about.years")}</div>
                  </div>
                </div>
              </FadeSection>

              <FadeSection delay={0.2}>
                <div className="space-y-10">
                  <div>
                    <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] mb-4">{t("about.label")}</div>
                    <h2 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-[0.9]">
                      {t("about.heading1")}<br />{t("about.heading2")}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                      {t("about.desc")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {whyUs.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-6 rounded-3xl bg-muted/30 border border-border/50 group hover:bg-white hover:shadow-xl transition-all duration-300"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <h4 className="font-black text-sm text-gray-900 mb-2 uppercase tracking-wide">{t(item.titleKey)}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{t(item.descKey)}</p>
                      </div>
                    ))}
                  </div>

                  <Link href="/about">
                    <Button className="bg-primary text-white hover:bg-primary/95 font-black h-16 px-10 rounded-2xl shadow-xl shadow-primary/20 text-xs uppercase tracking-widest">
                      {t("about.cta")} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </FadeSection>
            </div>
          </div>
        </section>

        {/* ─── CONTACT CTA SECTION ─────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <FadeSection>
              <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-900 opacity-60 transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-widest">{t("contact.label")}</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black mb-6 leading-none tracking-tighter">
                      {t("contact.heading1")}<br />{t("contact.heading2")}
                    </h2>
                    <p className="text-white/60 max-w-lg text-lg font-medium">
                      {t("contact.desc")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 shrink-0 sm:min-w-[280px]">
                    <a href="tel:+213210000000">
                      <Button size="lg" className="w-full h-20 px-10 bg-white text-primary hover:bg-emerald-50 font-black rounded-[2rem] shadow-2xl gap-3 text-sm uppercase tracking-widest">
                        <Phone className="w-6 h-6" />
                        {t("contact.call")}
                      </Button>
                    </a>
                    <Link href="/reserve">
                      <Button size="lg" variant="outline" className="w-full h-16 px-10 border-white/30 text-white hover:bg-white/10 rounded-2xl font-bold gap-3 uppercase tracking-tighter">
                        {t("contact.booking")} <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ─── CONTACT INFO ────────────────────────────────── */}
        <section className="py-24 bg-muted/20 border-t border-border/50">
          <div className="container mx-auto px-4">
            <FadeSection>
              <div className="max-w-2xl mx-auto space-y-10">
                <div>
                  <div className="text-[10px] font-black text-primary/40 uppercase tracking-[4px] mb-2">{t("contact.hq")}</div>
                  <h2 className="text-4xl font-black text-primary">{t("contact.findBasecamp")}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { icon: MapPin, labelKey: "contact.office", value: "123 Rue Didouche Mourad, Alger-Centre 16000" },
                    { icon: Phone, labelKey: "contact.emergency", value: "+213 21 00 00 00" },
                    { icon: Globe, labelKey: "contact.comms", value: "hq@tehwissa213.dz" },
                    { icon: Clock, labelKey: "contact.ops", value: "Mon–Fri: 08:00–18:00, Sat: 09:00–16:00" },
                  ].map(({ icon: Icon, labelKey, value }, i) => (
                    <div key={i} className="flex items-start gap-5 p-5 rounded-2xl bg-white border border-border/50 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t(labelKey)}</div>
                        <div className="text-sm font-bold text-foreground mt-1">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

      </main>

      <Footer />

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        .mountain-bg {
          background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
          background-attachment: fixed;
        }
      `}</style>
    </div>
  );
}
