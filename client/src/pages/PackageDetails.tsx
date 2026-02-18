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
  Plane,
  Hotel,
  Utensils
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useState } from "react";
import { format } from "date-fns";

export default function PackageDetails() {
  const [match, params] = useRoute("/packages/:id");
  const id = parseInt(params?.id || "0");
  const { data: pkg, isLoading } = usePackage(id);
  const { data: user } = useUser();
  
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!pkg) return <div className="min-h-screen flex items-center justify-center">Package not found</div>;

  const images = pkg.images.length > 0 ? pkg.images : ["https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Image Gallery Header */}
      <div className="relative h-[60vh] bg-black">
        <img 
          src={images[activeImage]} 
          alt={pkg.titleEn}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto flex gap-2 overflow-x-auto pb-4">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === idx ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-secondary">{pkg.type}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {pkg.durationDays} Days
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {pkg.destination}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary">{pkg.titleEn}</h1>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                {pkg.descEn}
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <Plane className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Transport</div>
                  <div className="font-semibold">Included</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <Hotel className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hotel</div>
                  <div className="font-semibold">5 Star</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-xl">
                  <Utensils className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Meals</div>
                  <div className="font-semibold">Full Board</div>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-card rounded-3xl p-8 shadow-md border border-border">
              <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
              <div className="space-y-6">
                {pkg.itinerary.map((day: any, idx: number) => (
                  <div key={idx} className="relative pl-8 border-l-2 border-muted pb-6 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-2 border-white" />
                    <div className="text-sm text-accent font-bold mb-1">Day {day.day}</div>
                    <h3 className="font-bold text-lg mb-2">{day.title}</h3>
                    <p className="text-muted-foreground">{day.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-3xl p-8 shadow-md border border-border">
                <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" /> Included
                </h3>
                <ul className="space-y-3">
                  {pkg.inclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-3xl p-8 shadow-md border border-border">
                <h3 className="text-xl font-bold mb-4 text-red-500 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" /> Excluded
                </h3>
                <ul className="space-y-3">
                  {pkg.exclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 mr-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-3xl p-6 shadow-xl border border-border">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Price per person</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {Number(pkg.pricePerPerson).toLocaleString()} 
                  </span>
                  <span className="text-lg font-medium text-muted-foreground">DZD</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Departure Date</label>
                  <select className="w-full p-3 rounded-xl border border-input bg-background">
                    {pkg.departureDates.map((date: string) => (
                      <option key={date} value={date}>
                        {format(new Date(date), "MMMM d, yyyy")}
                      </option>
                    ))}
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="text-green-600 font-bold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> {pkg.maxCapacity} Seats
                  </span>
                </div>

                <Link href={`/book/${id}`}>
                  <Button className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25">
                    Book Now
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground">
                  No payment required today. Reserve your spot now.
                </p>
              </div>
            </div>

            {/* Support Box */}
            <div className="mt-6 bg-primary text-primary-foreground rounded-3xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Our travel experts are here to assist you with any questions.
              </p>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                Contact Support
              </Button>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
