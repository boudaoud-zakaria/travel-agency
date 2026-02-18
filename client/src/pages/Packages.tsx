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
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Packages() {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    sort: "price_asc"
  });

  const { data: packages, isLoading } = usePackages({ 
    status: "ACTIVE",
    search: filters.search,
    type: filters.type !== "all" ? filters.type : undefined
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <div className="bg-primary pb-24 pt-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Our Travel Packages</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Browse our carefully curated selection of spiritual journeys and holiday destinations.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-16 mb-24 flex-grow">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-lg border border-border mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search destinations..." 
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <Select 
              value={filters.type} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Package Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HAJJ">Hajj</SelectItem>
                <SelectItem value="UMRAH">Umrah</SelectItem>
                <SelectItem value="DOMESTIC">Domestic</SelectItem>
                <SelectItem value="INTERNATIONAL">International</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.sort} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, sort: val }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="date_new">Newest First</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : packages?.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No packages found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages?.map((pkg: any) => (
              <PackageCard 
                key={pkg.id}
                id={pkg.id}
                title={pkg.titleEn}
                description={pkg.descEn}
                price={Number(pkg.pricePerPerson)}
                image={pkg.images[0] || "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800"} 
                duration={pkg.durationDays}
                type={pkg.type}
                rating={Number(pkg.rating)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
