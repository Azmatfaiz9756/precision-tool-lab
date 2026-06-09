import React from "react";
import { Shield, Truck, Award, Users, Target, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading font-bold text-4xl mb-4">
          About <span className="text-primary">TSTTOOLS</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          We are the UAE's trusted source for professional mobile repair tools. 
          Our mission is to equip technicians with authentic, high-quality tools 
          at competitive prices with fast delivery across all emirates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Target, title: "Our Mission", text: "To make professional-grade repair tools accessible to every technician in the UAE, with unmatched quality and service." },
          { icon: Shield, title: "Authenticity", text: "Every product is 100% genuine and sourced directly from manufacturers. No counterfeits, no compromises." },
          { icon: Zap, title: "Fast Delivery", text: "Same-day delivery in Dubai, next-day across UAE. We understand that downtime costs money." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-16">
        {[
          { value: "5,000+", label: "Products Sold" },
          { value: "2,500+", label: "Happy Customers" },
          { value: "7", label: "Emirates Covered" },
          { value: "4.8★", label: "Average Rating" },
        ].map(({ value, label }) => (
          <div key={label}>
            <p className="font-mono font-bold text-2xl text-primary">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <h2 className="font-heading font-bold text-2xl mb-4">Why Choose TSTTOOLS?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            "100% Authentic professional-grade tools",
            "Same-day delivery available in Dubai",
            "Free shipping on orders over AED 200",
            "Dedicated WhatsApp support",
            "30-day hassle-free returns",
            "Secure online payments",
          ].map((point) => (
            <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}