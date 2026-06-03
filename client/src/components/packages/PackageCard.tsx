import { Link } from "wouter";
import { Clock, Users, Star, ArrowRight, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PackageCardProps {
  id: number | string;
  title: string;
  description: string;
  price: number;
  image: string;
  duration: number;
  type: string;
  rating: number;
  destination?: string;
  capacity?: number;
}

const typeConfig: Record<string, { label: string; class: string; emoji: string }> = {
  HAJJ: { label: "Hajj", class: "bg-amber-500/90 text-white", emoji: "🕋" },
  UMRAH: { label: "Umrah", class: "bg-emerald-500/90 text-white", emoji: "🌙" },
  DOMESTIC: { label: "Domestic", class: "bg-blue-500/90 text-white", emoji: "🗺️" },
  INTERNATIONAL: { label: "International", class: "bg-purple-500/90 text-white", emoji: "✈️" },
};

export function PackageCard({
  id, title, description, price, image, duration, type, rating, destination, capacity
}: PackageCardProps) {
  const [liked, setLiked] = useState(false);
  const config = typeConfig[type] || { label: type, class: "bg-primary/80 text-white", emoji: "🌐" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-2xl hover:border-primary/10 transition-all duration-400 flex flex-col h-full"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800";
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${config.class}`}>
            {config.emoji} {config.label}
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-md"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
        </button>

        {/* Rating */}
        {rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Destination tag */}
        {destination && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            {destination}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            {duration} Days
          </span>
          {capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-secondary" />
              Max {capacity}
            </span>
          )}
        </div>

        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 flex-grow leading-relaxed">
          {description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div>
            <span className="text-xs text-muted-foreground block">From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-primary">
                {price.toLocaleString('fr-DZ')}
              </span>
              <span className="text-sm font-bold text-muted-foreground">DZD</span>
            </div>
          </div>

          <Link href={`/packages/${id}`}>
            <button className="group/btn flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary/20">
              View Details
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
