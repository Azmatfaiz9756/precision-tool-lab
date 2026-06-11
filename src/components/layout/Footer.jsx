import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, MapPin, Shield, Truck, Award, Clock } from "lucide-react";
import { useSettings } from "@/lib/utils";

export default function Footer() {
  const settings = useSettings();

  return (
    <footer className="bg-card border-t border-border">
      {/* Trust badges */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Shield, label: "Authentic Products", sub: "100% Genuine Tools" },
            { icon: Truck, label: "Fast Shipping", sub: "Same Day in Dubai" },
            { icon: Award, label: "Quality Guaranteed", sub: "Professional Grade" },
            { icon: Clock, label: "24/7 Support", sub: "WhatsApp Available" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <span className="font-heading font-black text-xl tracking-tight uppercase">
            {settings.store_name?.toUpperCase() === "TSTTOOLS" ? (
              <>
                <span className="text-foreground">TST</span>
                <span className="text-[#00a854]">TOOLS</span>
              </>
            ) : (
              <span className="text-foreground">{settings.store_name}</span>
            )}
          </span>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {settings.store_tagline}
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <a href={`https://wa.me/${settings.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              title="Chat on WhatsApp">
              <MessageCircle className="h-4 w-4 text-primary" />
            </a>
            <a href={`mailto:${settings.store_email}`} className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              title="Email support">
              <Mail className="h-4 w-4 text-primary" />
            </a>
            <a href={`tel:${settings.store_phone.replace(/\s+/g, "")}`} className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              title="Call support">
              <Phone className="h-4 w-4 text-primary" />
            </a>
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Facebook">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Instagram">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-primary stroke-2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            {settings.twitter_url && (
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Twitter/X">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="YouTube">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.482 20.455 12 20.455 12 20.455s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shop All</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4">Policies</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">Shipping & Delivery</Link>
            <Link to="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">Return Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4">Contact</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{settings.store_phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{settings.store_email}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{settings.store_address}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 {settings.store_name}. All rights reserved.</span>
          <span className="font-mono">Prices in AED · UAE Market</span>
        </div>
      </div>
    </footer>
  );
}