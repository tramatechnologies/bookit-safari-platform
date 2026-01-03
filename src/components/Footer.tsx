import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import OptimizedImage from '@/components/Image';

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <OptimizedImage 
                src="/images/logo.png" 
                alt="BookitSafari Logo" 
                className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
                width={40}
                height={40}
                priority={true}
              />
              <span className="font-display text-xl font-bold">
                Bookit<span className="text-amber">Safari</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner for bus travel across Tanzania. Book tickets easily, 
              travel comfortably, and explore the beauty of our nation.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com/bookitsafari" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-amber hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com/bookitsafari" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-amber hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/bookitsafari" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-amber hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/search" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Find Buses
                </Link>
              </li>
              <li>
                <Link to="/routes" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Popular Routes
                </Link>
              </li>
              <li>
                <Link to="/operators" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Bus Operators
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">For Business</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/operator/register" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Express Interest as Operator
                </Link>
              </li>
              <li>
                <Link to="/operator/login" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Operator Dashboard
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  Advertise
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-amber shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Millenium Towers II, 19th Floor,<br />Dar es Salaam, Tanzania
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber shrink-0" />
                <a href="tel:+255740360478" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  +255 740 360 478
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber shrink-0" />
                <a href="mailto:support@bookitsafari.com" className="text-primary-foreground/70 hover:text-amber text-sm transition-colors">
                  support@bookitsafari.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © 2026 Bookit Safari. All rights reserved.<br />
              <span className="text-primary-foreground/40 text-xs mt-1 block">
                Bookit Safari is a product of Trama Technologies (Holding Company)
              </span>
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-primary-foreground/50 hover:text-amber text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary-foreground/50 hover:text-amber text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
