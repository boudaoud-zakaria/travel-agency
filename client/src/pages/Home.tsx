import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PackageCard } from "@/components/packages/PackageCard";
import { usePackages } from "@/hooks/use-packages";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Star } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: packages, isLoading } = usePackages({ status: "ACTIVE" });

  const featuredPackages = packages?.slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Hero Background Image - Kaaba/Mecca */}
          <div className="absolute inset-0 z-0">
            {/* Standard Unsplash image of Mecca */}
            <img 
              src="https://pixabay.com/get/g157c353415b88e3504d87942b56a63e6ff0ebd4170284fed03ba539dd4cd66d46ff07d8356dcfcb384bcefcc45d815c6cbce7c5b8f3eed8748085ed849cde656_1280.jpg" 
              alt="Mecca Grand Mosque" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="container relative z-10 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                Your Spiritual Journey <br />
                <span className="text-accent">Starts Here</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
                Experience peace of mind with our premium Hajj & Umrah packages. 
                Full service support from departure to return.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                <Link href="/packages">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-xl shadow-xl shadow-accent/20">
                    Explore Packages
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur text-lg px-8 py-6 rounded-xl">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white relative z-20 -mt-20 mx-4 rounded-3xl shadow-xl container border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Happy Pilgrims", value: "10,000+" },
              { label: "Successful Tours", value: "500+" },
              { label: "Years Experience", value: "15+" },
              { label: "Support", value: "24/7" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Packages */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Featured Packages</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Handpicked travel experiences designed for your comfort and spiritual fulfillment.
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {featuredPackages.map((pkg: any) => (
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
            
            <div className="text-center mt-12">
              <Link href="/packages">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                  View All Packages
                  <ArrowRight className="ml-2 w-4 h-4 rtl:mr-2 rtl:ml-0" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-white">Why Choose Al-Anwar?</h2>
                <div className="space-y-8">
                  {[
                    { title: "Expert Guidance", desc: "Our religious guides accompany you every step of the way." },
                    { title: "Premium Accommodation", desc: "Hotels closest to Haram with best-in-class service." },
                    { title: "Seamless Transport", desc: "Private, air-conditioned buses for all transfers." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 text-accent mt-1">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{item.title}</h3>
                        <p className="text-white/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/20 rounded-full blur-3xl" />
                {/* Standard Unsplash image of travel/planning */}
                <img 
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop" 
                  alt="Travel Planning" 
                  className="relative rounded-2xl shadow-2xl border-4 border-white/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">What Our Pilgrims Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Ahmed Benali", text: "The organization was flawless. The hotels were exactly as promised, very close to Haram.", role: "Hajj 2023" },
                { name: "Fatima Zohra", text: "An unforgettable spiritual experience. The guides were knowledgeable and very patient.", role: "Umrah Ramadan" },
                { name: "Karim Saadi", text: "Excellent service from start to finish. Highly recommended for anyone looking for peace of mind.", role: "Family Umrah" },
              ].map((t, i) => (
                <div key={i} className="bg-muted/30 p-8 rounded-2xl border border-border hover:border-primary/20 transition-colors">
                  <div className="flex space-x-1 mb-4 text-accent">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
