import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PackageCard } from "@/components/packages/PackageCard";
import { usePackages } from "@/hooks/use-packages";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Search, SlidersHorizontal, Grid3X3, List, X, Mountain, Compass, Map, Wind, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

const packageTypes = [
  { value: "all", label: "All Routes", emoji: "🧭" },
  { value: "TREK", label: "Mountain Treks", emoji: "🏔️" },
  { value: "SAHARA", label: "Sahara Expeditions", emoji: "🏜️" },
  { value: "FOREST", label: "Forest Trails", emoji: "🌲" },
  { value: "CAMPING", label: "Wild Camping", emoji: "⛺" },
];

export default function Packages() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("price_asc");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data: packages, isLoading } = usePackages({
    status: "ACTIVE",
    search,
    type: type !== "all" ? type : undefined,
  });

  // Local sort + price filter
  const filtered = (packages || []).filter((pkg: any) => {
    const price = Number(pkg.pricePerPerson);
    return price >= priceRange[0] && price <= priceRange[1];
  }).sort((a: any, b: any) => {
    if (sort === "price_asc") return Number(a.pricePerPerson) - Number(b.pricePerPerson);
    if (sort === "price_desc") return Number(b.pricePerPerson) - Number(a.pricePerPerson);
    if (sort === "rating") return Number(b.rating) - Number(a.rating);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />

      {/* Page Header */}
      <section className="relative bg-primary py-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-emerald-950 pointer-events-none" />
        
        {/* Animated Background Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
           <Mountain className="absolute top-10 right-20 w-64 h-64 rotate-12" />
           <Compass className="absolute bottom-[-50px] left-10 w-96 h-96 -rotate-12" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-emerald-400 text-[10px] font-black uppercase tracking-[4px] mb-8">
              <Map className="w-3.5 h-3.5" /> Discovery & Expedition
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
              Explore The Trails
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg font-medium">
              From the highest peaks of the Djurdjura to the deepest whispers of the Tassili — 
              your next adventure is mapped out below.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0 space-y-10">
             <div>
                <h3 className="text-xs font-black text-primary/40 uppercase tracking-[4px] mb-6">Route Categories</h3>
                <div className="flex flex-col gap-2">
                  {packageTypes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${type === t.value
                          ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                          : "bg-white text-muted-foreground border border-border/50 hover:bg-muted/50 hover:text-primary"
                        }`}
                    >
                      <span className="text-lg opacity-70 group-hover:opacity-100">{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
             </div>

             <div className="p-8 rounded-3xl bg-white border border-border shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Wind className="w-12 h-12" />
                </div>
                <h3 className="text-xs font-black text-primary/40 uppercase tracking-[4px] mb-8">Expedition Cost</h3>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                      <span>DZD Range</span>
                      <span className="text-primary font-bold">{priceRange[1].toLocaleString()}</span>
                    </div>
                    <Slider
                      min={0}
                      max={1000000}
                      step={10000}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      className="w-full"
                    />
                  </div>
                  <div className="pt-6 border-t border-border/50 space-y-3">
                     <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Team Priority</div>
                     <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="h-12 border-muted bg-muted/20 rounded-xl font-bold text-xs uppercase tracking-widest">
                          <SelectValue placeholder="Sort Expedition" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="price_asc" className="text-xs font-bold uppercase py-3">Low → High Cost</SelectItem>
                          <SelectItem value="price_desc" className="text-xs font-bold uppercase py-3">High → Low Cost</SelectItem>
                          <SelectItem value="rating" className="text-xs font-bold uppercase py-3">Top Rated Peaks</SelectItem>
                          <SelectItem value="newest" className="text-xs font-bold uppercase py-3">Latest Routes</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
             </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            {/* Search + View Toggle Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search routes, peaks, or basecamps..."
                  className="pl-12 h-14 border-0 bg-white shadow-xl shadow-black/5 rounded-2xl focus-visible:ring-primary/10 font-medium text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex p-1.5 bg-white rounded-2xl border border-border shadow-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="space-y-8">
              {!isLoading && (
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border/50" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px]">
                    Found {filtered.length} Potential Expeditions
                  </p>
                  <span className="h-px w-10 bg-border/50" />
                </div>
              )}

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-6">
                      <div className="h-80 bg-white animate-pulse rounded-[2.5rem] shadow-xl" />
                      <div className="space-y-3 px-2">
                        <div className="h-6 bg-muted/50 animate-pulse rounded-full w-3/4" />
                        <div className="h-4 bg-muted/50 animate-pulse rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-border/50 shadow-2xl">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/30 mb-8 border border-border/50">
                    <Compass className="h-10 w-10 text-muted-foreground animate-spin-slow" />
                  </div>
                  <h3 className="text-3xl font-black text-primary mb-4 tracking-tighter uppercase">Route Not Discovered</h3>
                  <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">We couldn't find any expeditions matching your current tracking parameters.</p>
                  <Button onClick={() => { setSearch(""); setType("all"); }} className="h-14 px-10 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                    Reset Coordinates
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${type}-${sort}-${viewMode}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className={viewMode === "grid"
                      ? "grid md:grid-cols-2 gap-8"
                      : "flex flex-col gap-6"
                    }
                  >
                    {filtered.map((pkg: any) => (
                      <PackageCard
                        key={pkg.id}
                        id={pkg.id}
                        title={pkg.titleEn}
                        description={pkg.descEn}
                        price={Number(pkg.pricePerPerson)}
                        image={pkg.images?.[0] || "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"}
                        duration={pkg.durationDays}
                        type={pkg.type}
                        rating={Number(pkg.rating)}
                        destination={pkg.destination}
                        capacity={pkg.maxCapacity}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
