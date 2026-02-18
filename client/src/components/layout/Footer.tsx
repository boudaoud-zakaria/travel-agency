import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Al-Anwar
            </h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted partner for Hajj, Umrah, and Halal travel experiences. We make your spiritual journey comfortable and memorable.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse pt-2">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Packages</Link></li>
              <li><Link href="/hajj-umrah" className="hover:text-white transition-colors">Hajj & Umrah</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start space-x-3 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 shrink-0 text-accent" />
                <span>123 Al-Madina Street,<br />Algiers, Algeria</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-5 w-5 shrink-0 text-accent" />
                <span dir="ltr">+213 555 123 456</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-5 w-5 shrink-0 text-accent" />
                <span>info@al-anwar.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Al-Anwar Travel Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
