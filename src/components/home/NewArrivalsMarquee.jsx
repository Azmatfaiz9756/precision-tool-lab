import React, { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";

import { useSettings } from "@/lib/utils";

const Firework = ({ className, delay = "0s" }) => (
  <div className={`absolute pointer-events-none flex items-center justify-center ${className}`}>
    <div className="relative flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12">
      <div className="absolute text-2xl sm:text-4xl animate-ping opacity-80" style={{ animationDuration: '1.5s', animationDelay: delay }}>🎇</div>
      <div className="absolute text-xl sm:text-3xl animate-pulse" style={{ animationDuration: '1s', animationDelay: delay }}>🎆</div>
      <div className="absolute text-base sm:text-2xl animate-bounce text-yellow-400" style={{ animationDelay: delay }}>✨</div>
    </div>
  </div>
);

export default function NewArrivalsMarquee({ products, title }) {
  const settings = useSettings() || {};
  const displayTitle = title || settings.new_arrivals_title || "New Arrivals";
  
  if (!products || products.length === 0) return null;

  const [subtitleText, setSubtitleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const defaultSubtitles = [
    "✨ The latest tools and equipment ✨",
    "🔥 Premium quality for professionals 🔥",
    "🚀 Next generation repair gear 🚀",
    "⚡ Unmatched precision & performance ⚡",
    "🛠️ Upgrade your workshop today 🛠️"
  ];
  
  const parsedSubtitles = (settings && typeof settings.new_arrivals_subtitle === 'string')
    ? settings.new_arrivals_subtitle.split('\n').map(s => s.trim()).filter(Boolean)
    : [];
    
  const subtitles = parsedSubtitles.length > 0 ? parsedSubtitles : defaultSubtitles;

  const colorGradients = [
    "from-red-500 to-pink-500",
    "from-yellow-400 to-orange-500",
    "from-blue-600 to-sky-400",
    "from-green-400 to-emerald-500",
    "from-purple-500 to-fuchsia-500"
  ];
  
  const currentColor = colorGradients[loopNum % colorGradients.length];

  useEffect(() => {
    let timer;
    const handleType = () => {
      const i = loopNum % subtitles.length;
      const fullText = subtitles[i];

      setSubtitleText(isDeleting ? fullText.substring(0, subtitleText.length - 1) : fullText.substring(0, subtitleText.length + 1));
      setTypingSpeed(isDeleting ? 50 : 100);

      if (!isDeleting && subtitleText === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && subtitleText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        timer = setTimeout(() => {}, 500);
      } else {
        timer = setTimeout(handleType, typingSpeed);
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [subtitleText, isDeleting, loopNum]);

  // We need 3 copies to make the -33.33% transform loop seamlessly
  const duplicatedProducts = [...products, ...products, ...products];

  return (
    <section className="w-full bg-[#08090c] pt-12 pb-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center relative">
        <div className="relative inline-block">
          <Firework className="-left-10 sm:-left-16 top-1/2 -translate-y-1/2" delay="0s" />
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight uppercase bg-clip-text text-transparent animate-text-gradient bg-[length:200%_auto] bg-[linear-gradient(to_right,#ef4444,#22c55e,#3b82f6,#eab308,#0ea5e9,#ec4899,#ef4444)] pb-1 relative z-10 px-4">
            {displayTitle}
          </h2>
          <Firework className="-right-10 sm:-right-16 top-1/2 -translate-y-1/2" delay="0.5s" />
        </div>
        <div className="h-6 mt-2 flex items-center justify-center">
          <p className={`text-[13px] sm:text-sm font-[Caveat] italic font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${currentColor} transition-colors duration-1000`}>
            {subtitleText}
            <span className={`inline-block w-1.5 h-3.5 sm:h-4 ml-1 bg-gradient-to-r ${currentColor} animate-pulse align-middle`} />
          </p>
        </div>
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
