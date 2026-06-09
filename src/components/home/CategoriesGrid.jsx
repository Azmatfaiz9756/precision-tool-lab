import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Smartphone, Flame, Sparkles, Gauge, PackageOpen, Eye, Cpu, Grid, Shield, Apple } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  consumables: Sparkles,
  essential_tools: Wrench,
  microscopes: Eye,
  soldering_equipment: Flame,
  programming_tools: Cpu,
  workshop_organization: Grid,
  static_control_safety: Shield,
  screen_repair_tools: Smartphone,
  apple_device_repair: Apple,
  diagnostic_testing: Gauge,
  other_tools: PackageOpen,
};

export default function CategoriesGrid({ categories, categoryImages }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl">Shop by Category</h2>
          <p className="text-muted-foreground text-sm mt-1">Find the right tools for every repair</p>
        </div>
        <Link to="/shop" className="text-primary text-sm font-medium hover:underline hidden sm:block">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.key] || Wrench;
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/shop?category=${cat.key}`}
                className="group relative block aspect-[4/3] rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all duration-300"
              >
                <img
                  src={categoryImages[cat.key] || ""}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative h-full flex flex-col items-start justify-end p-4">
                  <div className="h-8 w-8 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:bg-primary/30 transition-colors border border-white/20">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{cat.label}</h3>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}