import React from "react";
import ProductCard from "@/components/products/ProductCard";

export default function NewArrivalsMarquee({ products, title = "New Arrivals", subtitle = "The latest tools and equipment added to our catalog" }) {
  if (!products || products.length === 0) return null;

  // We need 3 copies to make the -33.33% transform loop seamlessly
  const duplicatedProducts = [...products, ...products, ...products];

  return (
    <section className="w-full bg-[#08090c] pt-12 pb-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-white uppercase">
          {title}
        </h2>
        <p className="text-white/60 text-sm mt-2">{subtitle}</p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee-slow hover:[animation-play-state:paused] w-max">
          {duplicatedProducts.map((product, i) => (
            <div key={`${product.id}-${i}`} className="w-[200px] sm:w-[240px] px-2 shrink-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
