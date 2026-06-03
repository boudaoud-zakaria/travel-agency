import { useRoute, Link } from "wouter";
import { usePackage } from "@/hooks/use-packages";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Mountain,
  Map,
  Compass,
  Utensils,
  Share2,
  Heart,
  Info,
  ChevronLeft,
  ChevronRightIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tent,
  Trees,
  Bus
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function PackageDetails() {
  const [match, params] = useRoute("/packages/:id");
  const id = parseInt(params?.id || "0");
  const { data: pkg, isLoading } = usePackage(id);
  const { data: user } = useUser();
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Auto-scroll image gallery
  useEffect(() => {
    if (!pkg?.images || pkg.images.length <= 1) return;
    const interval = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % pkg.images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [pkg]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-muted-foreground text-xs uppercase tracking-widest">Identifying High-Altitude Data...</p>
    </motion.div>
  </div>;
  
  if (!pkg) return <div className="min-h-screen flex items-center justify-center">Expedition not found</div>;

  const images = pkg.images.length > 0 ? pkg.images : ["https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200"];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFF]">
      <Navbar />

      {/* Hero Gallery Section */}
      <div className="relative h-[65vh] md:h-[75vh] w-full overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            src={images[activeImage]} 
            initial={{ opacity: 0.6, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

        {/* Hero Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button 
                variant="ghost" size="icon" 
                onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                className="bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 w-12 h-12"
            >
                <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button 
                variant="ghost" size="icon" 
                onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                className="bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 w-12 h-12"
            >
                <ChevronRightIcon className="w-8 h-8" />
            </Button>
        </div>

        <div className="absolute bottom-16 left-0 right-0 px-4 md:px-8 z-10">
            <div className="container mx-auto">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl"
                >
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 text-[10px]">
                           {pkg.type} ROUTE
                        </Badge>
                        <Badge variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20 py-1.5 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                            <Clock className="w-3.5 h-3.5 mr-2" /> {pkg.durationDays} Days / {pkg.durationDays - 1} Nights
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white leading-none mb-6 drop-shadow-2xl tracking-tighter uppercase" style={{ fontFamily: "Inter, sans-serif" }}>
                        {pkg.titleEn}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                            <span className="font-black text-sm uppercase tracking-widest">{pkg.destination} BASECAMP</span>
                        </div>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/30" />
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            <span className="font-black text-sm uppercase tracking-widest">EST. {Number(pkg.pricePerPerson).toLocaleString()} DZD</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-16 right-8 hidden md:flex gap-3 z-10">
            {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                    activeImage === idx ? "border-emerald-500 scale-110 shadow-2xl shadow-emerald-500/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover rounded-xl" />
                </button>
            ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-20 -mt-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Details */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 space-y-12"
          >
            {/* Overview Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-blue-900/5 relative overflow-hidden group border border-border/50">
               <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-bl-full transition-all group-hover:w-56 group-hover:h-56" />
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-tr-full" />
               
               <div className="flex justify-between items-start mb-10 relative z-10">
                    <div>
                        <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] mb-2">Expedition Log</div>
                        <h2 className="text-4xl font-black text-primary tracking-tighter uppercase leading-none">
                            Route Briefing
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)} className={`w-12 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all ${isFavorite ? "text-red-500 bg-red-50" : "text-muted-foreground bg-muted/50"}`}>
                            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all bg-muted/50">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
               </div>

               <p className="text-muted-foreground leading-relaxed text-lg mb-12 whitespace-pre-line border-l-8 border-primary/10 pl-8 font-medium italic relative z-10">
                "{pkg.descEn}"
               </p>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                {[
                    { icon: Bus, label: "Logistics", value: "4x4 Support" },
                    { icon: Tent, label: "Basecamp", value: "Wild Camping" },
                    { icon: Compass, label: "Navigation", value: "Expert Guides" },
                    { icon: Users, label: "Crew Size", value: `Max ${pkg.maxCapacity}` }
                ].map((item, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-2 group/card">
                        <item.icon className="w-8 h-8 text-primary mb-4 group-hover/card:scale-110 transition-transform" />
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{item.label}</div>
                        <div className="font-black text-sm uppercase">{item.value}</div>
                    </div>
                ))}
               </div>
            </motion.div>

            {/* Timeline Itinerary */}
            <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-blue-900/5 border border-border/50">
                <div className="mb-14">
                    <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] mb-2">Day-by-Day tracking</div>
                    <h2 className="text-4xl font-black text-primary tracking-tighter uppercase">Elevation Timeline</h2>
                </div>

                <div className="relative pl-12 space-y-16">
                    {/* Vertical line with gradient */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-emerald-500 to-transparent rounded-full shadow-sm" />
                    
                    {pkg.itinerary.map((day: any, idx: number) => (
                      <div key={idx} className="relative group">
                        {/* Interactive Marker */}
                        <div className="absolute -left-[45px] top-6 w-8 h-8 rounded-xl bg-white border-4 border-primary z-10 group-hover:bg-primary group-hover:scale-110 transition-all flex items-center justify-center text-[10px] font-black text-primary group-hover:text-white">
                            {day.day}
                        </div>
                        
                        <div className="bg-muted/20 p-8 rounded-[2rem] group-hover:bg-primary/5 transition-all border border-transparent group-hover:border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-black text-white border-none py-1 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-black/20">ASCENT DAY {day.day}</Badge>
                                    <Badge variant="outline" className="border-black/10 text-muted-foreground text-[10px] font-black uppercase tracking-widest">08:00 HRS DEP</Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{format(new Date(pkg.departureDates?.[0] || new Date()), "MMM dd")}</span>
                            </div>
                            <h3 className="font-black text-2xl mb-4 text-primary tracking-tight uppercase group-hover:text-emerald-700 transition-colors">{day.title}</h3>
                            <p className="text-muted-foreground text-base leading-relaxed font-medium">{day.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
            </motion.div>

            {/* Inclusions / Exclusions */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/5 border-t-[12px] border-emerald-500 hover:shadow-emerald-500/10 transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 shadow-inner">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black mb-8 text-black uppercase tracking-tighter">Gear & Services</h3>
                <ul className="space-y-5">
                  {pkg.inclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start text-sm font-bold text-muted-foreground group">
                      <div className="w-3 h-3 rounded-md bg-emerald-500 mt-1 mr-4 shrink-0 transition-all group-hover:rotate-45" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/5 border-t-[12px] border-red-500 hover:shadow-red-500/10 transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-8 shadow-inner">
                    <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-2xl font-black mb-8 text-black uppercase tracking-tighter">Exclusions</h3>
                <ul className="space-y-5">
                  {pkg.exclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start text-sm font-bold text-muted-foreground group">
                      <div className="w-3 h-3 rounded-md bg-red-400 mt-1 mr-4 shrink-0 transition-all group-hover:rotate-45" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Participation Rules */}
            {pkg.requirements && pkg.requirements.length > 0 && (
                <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-blue-900/5 border border-amber-500/30 bg-gradient-to-br from-white to-amber-50/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] rounded-bl-full pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/[0.02] rounded-tr-full pointer-events-none" />
                    
                    <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="w-16 h-16 rounded-[2rem] bg-amber-500 text-white flex items-center justify-center shadow-2xl shadow-amber-500/30 border-4 border-white">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-amber-600 text-[10px] font-black uppercase tracking-[4px] mb-1">Mandatory Protocol</div>
                            <h2 className="text-4xl font-black text-amber-900 tracking-tighter uppercase">Summit Clearance</h2>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 relative z-10">
                        {pkg.requirements.map((req: string, i: number) => (
                            <div key={i} className="flex items-start gap-5 p-6 rounded-3xl bg-white border border-amber-100 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all">
                                <div className="mt-1 w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                                    <span className="text-[10px] font-black text-amber-700">0{i+1}</span>
                                </div>
                                <p className="text-amber-950 font-bold leading-relaxed text-sm">{req}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
          </motion.div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-4 h-full">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="sticky top-28"
            >
                <div className="bg-white rounded-[3rem] p-10 shadow-3xl shadow-primary/10 border border-border/50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="relative z-10">
                        <div className="mb-10">
                            <div className="text-[10px] font-black uppercase text-primary/40 tracking-[4px] mb-2">Expedition Cost</div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl font-black text-primary tracking-tighter">
                                    {(Number(pkg.pricePerPerson) / 1000).toFixed(0)}k
                                </span>
                                <div>
                                    <div className="text-xl font-black text-primary uppercase leading-none">DZD</div>
                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">per team member</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Assigned Date</div>
                                        <div className="text-sm font-black">{format(new Date(pkg.departureDates?.[0] || new Date()), "MMM dd, yyyy")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-0.5">Basecamp Slots</div>
                                        <div className="text-sm font-black text-emerald-700">{pkg.maxCapacity} Seats Available</div>
                                    </div>
                                </div>
                            </div>

                            <Link href={`/reserve/${pkg.id}`}>
                                <Button 
                                    className="w-full h-20 text-xs font-black uppercase tracking-[0.2em] bg-primary text-white hover:bg-primary/95 rounded-2xl shadow-2xl shadow-primary/25 transition-all active:scale-95 group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center">
                                        Initialize Reservation 
                                        <ArrowRight className="w-5 h-5 ml-4 transition-transform group-hover:translate-x-2" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </Link>

                            <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground p-5 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Instant Deployment · Pay at Basecamp
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Lead Contact */}
                <div className="mt-8 bg-black text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center mb-6 overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-black text-lg mb-2 uppercase tracking-tight">Speak with a Guide Lead</h3>
                        <p className="text-white/40 text-xs font-medium leading-relaxed mb-8">
                             Need a custom route or a corporate expedition? Our lead guides are operational 24/7.
                        </p>
                        <Button className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white rounded-2xl h-14 transition-all shadow-xl group-hover:scale-105">
                            Connect Via Satellite
                        </Button>
                    </div>
                </div>
            </motion.div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
