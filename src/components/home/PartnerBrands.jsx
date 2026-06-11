import React from "react";

const brands = [
  "2UUL", "3M", "AiXun", "Mechanic", "Andonstar",
  "ANKER", "ATTEN", "Baseus", "Benks", "BEST"
];

export default function PartnerBrands() {
  return (
    <section className="bg-secondary/30 border-y border-border py-12 mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-8">
        <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
          Our Partner Brands
        </h2>
        <p className="text-muted-foreground text-sm mt-2">Trusted by the best in the industry</p>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="py-4 animate-marquee whitespace-nowrap flex items-center gap-12 px-6">
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <span key={i} className="text-2xl font-black text-muted-foreground/30 hover:text-primary transition-colors cursor-default uppercase">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
