import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    category: "Soldering Stations",
    label: "SOLDERING STATIONS",
    tagline: "Professional rework & hot air stations for precision PCB repair",
    link: "/shop?category=soldering_kits",
    accent: "#f59e0b",
    images: [
      "https://www.diyfixtool.com/cdn/shop/files/CH898_1.png",
      "https://www.diyfixtool.com/cdn/shop/files/aifenF4_3.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/hotairgun_6.jpg",
    ],
  },
  {
    category: "Soldering Irons",
    label: "SOLDERING IRONS",
    tagline: "Cordless & temperature-controlled irons for every repair job",
    link: "/shop?category=soldering_kits",
    accent: "#0ea5e9",
    images: [
      "https://www.diyfixtool.com/cdn/shop/files/FNIRSIHS-03_1.png",
      "https://www.diyfixtool.com/cdn/shop/files/aifenF4_3.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/CH898_1.png",
    ],
  },
  {
    category: "Opening Tools",
    label: "OPENING TOOLS",
    tagline: "Screen separators & heating presses for safe device opening",
    link: "/shop?category=opening_tools",
    accent: "#10b981",
    images: [
      "https://www.diyfixtool.com/cdn/shop/files/ls6pro.png",
      "https://www.diyfixtool.com/cdn/shop/files/MobiToolSTD-15Ultra_1.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/MobiToolSTD-15Ultra_2.jpg",
    ],
  },
  {
    category: "Precision Tools",
    label: "PRECISION TOOLS",
    tagline: "Screwdriver sets & tweezers built for micro-level accuracy",
    link: "/shop?category=precision_tools",
    accent: "#8b5cf6",
    images: [
      "https://www.diyfixtool.com/cdn/shop/files/6558SE_3.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/MobiToolSTD-15Ultra_2.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/E08P.jpg",
    ],
  },
  {
    category: "Testing Equipment",
    label: "TESTING EQUIPMENT",
    tagline: "Multimeters & diagnostic tools to detect faults instantly",
    link: "/shop?category=testing_equipment",
    accent: "#ef4444",
    images: [
      "https://www.diyfixtool.com/cdn/shop/files/DT-101T.png",
      "https://www.diyfixtool.com/cdn/shop/files/YCSX5_1.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/E08P.jpg",
    ],
  },
  {
    category: "Complete Repair Kits",
    label: "COMPLETE REPAIR KITS",
    tagline: "All-in-one kits — everything you need to start repairing today",
    link: "/shop?category=complete_repair_kits",
    accent: "#06b6d4",
    images: [
      "https://www.diyfixtool.com/cdn/shop/files/MobiToolSTD-15Ultra_2.jpg",
      "https://www.diyfixtool.com/cdn/shop/files/CH898_1.png",
      "https://www.diyfixtool.com/cdn/shop/files/aifenF4_3.jpg",
    ],
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const go = (idx) => {
    clearInterval(timerRef.current);
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    startTimer();
  };

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);
  const slide = slides[current];

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 my-3 bg-[#08090c] max-w-7xl lg:mx-auto">
      {/* Responsive height wrapper so section doesn't collapse during animation */}
      <div className="relative h-[170px] sm:h-[250px] md:h-[320px] lg:h-[380px] xl:h-[440px] w-full">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60, transition: { duration: 0.25 } }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Images row — takes remaining height above text bar */}
            <div className="flex flex-1 min-h-0 bg-[#0d1117]">
              {slide.images.map((img, i) => (
                <div
                  key={i}
                  className="flex-1 relative bg-[#0d1117] flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={img}
                    alt={slide.category}
                    className="w-full h-full object-contain p-0.5 sm:p-1 md:p-1.5"
                    onError={(e) => { e.target.style.opacity = "0.05"; }}
                  />
                  {i < slide.images.length - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/10 z-10" />
                  )}
                </div>
              ))}
            </div>

            {/* Text bar */}
            <div
              className="flex items-center justify-between px-5 py-3 md:px-6 md:py-4 flex-shrink-0"
              style={{ background: slide.accent }}
            >
              <div className="min-w-0 pr-3">
                <span className="text-xs md:text-sm lg:text-base font-black tracking-[0.18em] text-black block leading-none">{slide.label}</span>
                <p className="text-[11px] md:text-xs lg:text-sm text-black/70 font-medium leading-tight mt-1 truncate">{slide.tagline}</p>
              </div>
              <Link
                to={slide.link}
                className="text-[10px] md:text-xs lg:text-sm font-black tracking-widest text-black bg-black/10 hover:bg-black/20 px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                SHOP NOW →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      <div className="absolute inset-x-0 top-0 bottom-[52px] md:bottom-[64px] flex items-center justify-between px-3 pointer-events-none z-20">
        <button
          onClick={prev}
          className="pointer-events-auto h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/75 transition-all duration-200 backdrop-blur-sm border border-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          className="pointer-events-auto h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/75 transition-all duration-200 backdrop-blur-sm border border-white/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dots */}
      <div 
        className="absolute z-20 flex gap-1.5 items-center left-1/2 -translate-x-1/2 bottom-[60px] md:bottom-[76px]"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? "24px" : "6px",
              background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 z-20">
        <motion.div
          key={current + "-bar"}
          className="h-full"
          style={{ background: slide.accent }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </div>
    </section>
  );
}