import { Link } from "wouter";
import { Clock, Users, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PackageCardProps {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  duration: number;
  type: string;
  rating: number;
}

export function PackageCard({ id, title, description, price, image, duration, type, rating }: PackageCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge className="bg-white/90 text-primary backdrop-blur hover:bg-white">{type}</Badge>
          {rating > 0 && (
            <Badge className="bg-accent text-accent-foreground flex items-center space-x-1">
              <Star className="w-3 h-3 fill-current" />
              <span>{rating}</span>
            </Badge>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4 rtl:space-x-reverse">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 rtl:ml-1 text-secondary" />
            <span>{duration} Days</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 rtl:ml-1 text-secondary" />
            <span>Group Tour</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
          {description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div>
            <span className="text-xs text-muted-foreground block">Starting from</span>
            <span className="text-lg font-bold text-primary">{price.toLocaleString()} DZD</span>
          </div>
          
          <Link href={`/packages/${id}`}>
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 shadow-md hover:shadow-lg transition-all">
              Details 
              <ArrowRight className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
