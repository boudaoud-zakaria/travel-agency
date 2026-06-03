import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PackageCard } from "@/components/packages/PackageCard";
import { usePackages } from "@/hooks/use-packages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Star, Search, MapPin, Clock, Users,
  Shield, Award, HeartHandshake, Globe, TrendingUp, Plane, Quote,
  ChevronRight, Phone, Mountain, Tent, Trees, Wind, Camera
} from "lucide-react";
import { Link } from "wouter";
import { useRef, useState, useEffect } from "react";

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

/* ── Package type icons ──────────────────────────────────── */
const packageTypes = [
  {
    type: "TREK",
    emoji: "🏔️",
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
    emoji: "🏜️",
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
    emoji: "🌲",
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
    emoji: "⛺",
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
  { label: "Successful Summits", value: 450, suffix: "+", icon: "🏔️" },
  { label: "Trail Miles Guided", value: 15000, suffix: "+", icon: "🥾" },
  { label: "Expert Guides", value: 25, suffix: "+", icon: "👤" },
  { label: "Safety Rating", value: 100, suffix: "%", icon: "🛡️" },
];

const whyUs = [
  {
    icon: Shield,
    title: "Safety First Protocol",
    desc: "Certified first-aid guides and satellite GPS tracking on every mountain expedition.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: HeartHandshake,
    title: "Expert Local Guides",
    desc: "Guides who were born in these mountains and know every hidden trail and cave.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Award,
    title: "Eco-Friendly Travel",
    desc: "Strict 'Leave No Trace' policy. We protect the nature we love to explore.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Camera,
    title: "Photography Support",
    desc: "Our guides help you capture the most stunning viewpoints at the golden hour.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const testimonials = [
  {
    name: "Ahmed Benali",
    location: "Alger",
    role: "Djurdjura Summit 2024",
    text: "Standing on top of Lalla Khedidja at dawn was a dream come true. The gear was top-notch and our guide's knowledge of the terrain made us feel completely safe.",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Fatima Zohra",
    location: "Oran",
    role: "Tassili Trekker",
    text: "The silence of the Tassili at night is something everyone should experience. Sleeping under the stars after a 15km hike — absolutely unforgettable properly organized trip.",
    rating: 5,
    avatar: "F",
  },
  {
    name: "Karim Saadi",
    location: "Constantine",
    role: "Waterfall Explorer",
    text: "The Akfadou forest hike was perfect for my family. Lush greenery and cool waterfalls. The guide even identified all the local birds for us. Highly recommended!",
    rating: 5,
    avatar: "K",
  },
  {
    name: "Leila Mammeri",
    location: "Annaba",
    role: "Atlas Winter Hike",
    text: "I was worried about the snow, but the agency provided excellent crampons and professional winter gear. It was a rigorous but rewarding adventure.",
    rating: 5,
    avatar: "L",
  },
];

export default function Home() {
  const { data: packages, isLoading } = usePackages({ status: "ACTIVE" });
  const featuredPackages = packages?.slice(0, 3) || [];
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">

        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&auto=format&fit=crop&q=80"
              alt="Algerian Mountains"
              className="w-full h-full object-cover scale-105"
              style={{ animation: "heroZoom 20s ease-in-out infinite alternate" }}
            />
            {/* Multi-layer overlay */}
            <div className="absolute inset-0 bg-black/40 z-1" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent z-2" />
          </div>

          {/* Floating particles (Snow/Dust) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 3}s infinite`,
                }}
              />
            ))}
          </div>

          <div className="container relative z-10 px-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 text-white text-sm font-medium"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                Algeria's Premier Hiking & Trekking Agency 🏔️
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                UNLEASH THE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-400">
                  WILD WITHIN
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
              >
                Discover the untamed beauty of Algeria. From snow-capped 2,000m summits
                to ancient Tassili rock art trails — expedition start here.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="max-w-xl mx-auto p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex gap-2 mb-10 shadow-2xl"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Where do you want to hike?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/40"
                  />
                </div>
                <Link href={`/packages${searchQuery ? `?search=${searchQuery}` : ""}`}>
                  <Button className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg border-0 transition-all hover:scale-105">
                    Explore Trails
                  </Button>
                </Link>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/packages">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-white text-primary hover:bg-white/90 text-base font-black rounded-2xl shadow-2xl border-0"
                  >
                    <Mountain className="mr-2 h-5 w-5" />
                    View All Peaks
                  </Button>
                </Link>
                <Link href="/reserve">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md text-base font-bold rounded-2xl"
                  >
                    Start Reservation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
            <span className="text-[10px] font-black tracking-[3px] uppercase">Descend</span>
            <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
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
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</div>
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
                  Pathways to Adventure
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-primary mb-4 leading-none">
                  TREK YOUR WAY
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto font-medium">
                  We categorize our expeditions by terrain and intensity. Whether you're a ridge scrambler or a desert wanderer, your path is here.
                </p>
              </div>
            </FadeSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packageTypes.map((type, idx) => (
                <FadeSection key={type.type} delay={idx * 0.1}>
                  <Link href={`/packages?type=${type.type}`}>
                    <div className={`group relative overflow-hidden rounded-3xl border-2 ${type.border} ${type.bg} p-8 h-full cursor-pointer hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl`}>
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <type.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-3 flex flex-col">
                        <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1">{type.titleAr}</span>
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{type.desc}</p>

                      <div className={`mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-gradient-to-r ${type.color} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                        View Routes <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: "var(--primary)" }} />
                      </div>

                      {/* Decorative background number */}
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
                  <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] mb-2">CURATED SUMMITS</div>
                  <h2 className="text-4xl md:text-5xl font-black text-primary">
                    ELITE EXPEDITIONS
                  </h2>
                </div>
                <Link href="/packages">
                  <Button variant="ghost" className="font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white group">
                    View All Adventures <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
          {/* Top topographic lines decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-primary fill-current">
              <path d="M0 20 Q20 15 40 30 T80 25 T100 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 40 Q20 35 40 50 T80 45 T100 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0 60 Q20 55 40 70 T80 65 T100 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Left: Images */}
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

                  {/* High Tech Badge */}
                  <div className="absolute -top-10 -left-6 bg-primary text-white p-6 rounded-[2rem] shadow-2xl rotate-[-5deg]">
                    <div className="text-4xl font-black">15+</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Years of<br />Excellence</div>
                  </div>
                </div>
              </FadeSection>

              {/* Right: Content */}
              <FadeSection delay={0.2}>
                <div className="space-y-10">
                  <div>
                    <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] mb-4">THE TRAVEL GENIUS LEGACY</div>
                    <h2 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-[0.9]">
                      BORN IN THE<br />MOUNTAINS.
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                      Travel Genius isn't just a booking platform — we are a community of mountain lovers and professional alpinists.
                      Since 2009, we've guided over 12,000 adventurers through the most rigorous and rewarding terrains of Algeria.
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
                        <h4 className="font-black text-sm text-gray-900 mb-2 uppercase tracking-wide">{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <Link href="/about">
                    <Button className="bg-primary text-white hover:bg-primary/95 font-black h-16 px-10 rounded-2xl shadow-xl shadow-primary/20 text-xs uppercase tracking-widest">
                      Deep Dive Into Our Mission <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </FadeSection>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ────────────────────────────────── */}
        <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <FadeSection>
              <div className="mb-20">
                <div className="text-emerald-400 text-[10px] font-black uppercase tracking-[5px] mb-4">ECHOES FROM THE FIELD</div>
                <h2 className="text-4xl md:text-7xl font-black mb-6">VOICES OF THE WILD</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-emerald-400 text-emerald-400" />)}
                  <span className="ml-3 text-2xl font-black">4.9/5</span>
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Verified Alpinist Reviews</p>
              </div>
            </FadeSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {testimonials.map((t, i) => (
                <FadeSection key={i} delay={i * 0.1}>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 h-full flex flex-col hover:bg-white/10 transition-all group">
                    <Quote className="w-10 h-10 text-emerald-500 mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="text-white/80 text-sm leading-relaxed flex-1 italic font-medium mb-10">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-black text-xs uppercase tracking-widest tracking-tighter">{t.name}</div>
                        <div className="text-white/40 text-[10px] uppercase font-bold tracking-tight mt-1">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </FadeSection>
              ))}
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
                      <span className="text-xs font-bold uppercase tracking-widest">Basecamp Contact</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black mb-6 leading-none tracking-tighter">
                      YOUR SUMMIT<br />AWAITS.
                    </h2>
                    <p className="text-white/60 max-w-lg text-lg font-medium">
                      Don't just dream of the views — stand in them. Our experts are ready to design your ideal route today.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 shrink-0 sm:min-w-[280px]">
                    <a href="tel:+213210000000">
                      <Button size="lg" className="h-20 px-10 bg-white text-primary hover:bg-emerald-50 font-black rounded-[2rem] shadow-2xl gap-3 text-sm uppercase tracking-widest">
                        <Phone className="w-6 h-6" />
                        Call Command
                      </Button>
                    </a>
                    <Link href="/reserve">
                      <Button size="lg" variant="outline" className="h-16 px-10 border-white/30 text-white hover:bg-white/10 rounded-2xl font-bold gap-3 uppercase tracking-tighter">
                        Quick Booking <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ─── CONTACT & MAP ───────────────────────────────── */}
        <section className="py-24 bg-muted/20 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-16">
              <FadeSection className="lg:col-span-1 space-y-10">
                <div>
                  <div className="text-[10px] font-black text-primary/40 uppercase tracking-[4px] mb-2">HEADQUARTERS</div>
                  <h2 className="text-4xl font-black text-primary">FIND BASECAMP</h2>
                </div>
                <div className="space-y-6">
                  {[
                    { icon: MapPin, label: "Expedition Office", value: "123 Rue Didouche Mourad, Alger-Centre 16000" },
                    { icon: Phone, label: "Emergency Line", value: "+213 21 00 00 00" },
                    { icon: Globe, label: "Comms", value: "hq@travelgenius.dz" },
                    { icon: Clock, label: "Ops Hours", value: "Mon–Fri: 08:00–18:00, Sat: 09:00–16:00" },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div key={i} className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</div>
                        <div className="text-sm font-bold text-foreground mt-1">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeSection>

              {/* Map embed */}
              <FadeSection delay={0.2} className="lg:col-span-2">
                <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[500px] border-8 border-white group">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6401.558898064827!2d3.0588!3d36.7378!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fada7f77a6f2d%3A0x9e7e16d6ad50b6f!2sRue%20Didouche%20Mourad%2C%20Alger%2C%20Algeria!5e0!3m2!1sen!2sus!4v1700000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Travel Genius HQ Location"
                    className="grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </FadeSection>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .mountain-bg {
          background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
          background-attachment: fixed;
        }
      `}</style>
    </div>
  );
}
