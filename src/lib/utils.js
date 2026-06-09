import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

export function handleProductImageError(e) {
  const currentSrc = e.target.src;
  if (e.target.dataset.triedFallbackSrc === currentSrc) {
    e.target.style.opacity = "0.3";
    return;
  }
  
  if (currentSrc && currentSrc.includes("unionrepair.com/images/thumbnails/") && !currentSrc.includes("ab__webp")) {
    let fallback = currentSrc.replace("/images/thumbnails/", "/images/ab__webp/thumbnails/");
    if (fallback.endsWith(".webp")) {
      fallback = fallback.slice(0, -5) + "_jpg.webp";
    } else if (fallback.endsWith(".png")) {
      fallback = fallback.slice(0, -4) + "_png.png";
    } else if (fallback.endsWith(".jpg")) {
      fallback = fallback.slice(0, -4) + "_jpg.jpg";
    } else if (fallback.endsWith(".jpeg")) {
      fallback = fallback.slice(0, -5) + "_jpg.jpeg";
    }
    e.target.dataset.triedFallbackSrc = fallback;
    e.target.src = fallback;
    e.target.style.opacity = "1";
    return;
  }
  
  e.target.style.opacity = "0.3";
}

import { useState, useEffect } from "react";

export const SETTINGS_DEFAULTS = {
  // Store Info
  store_name: "TSTTOOLS",
  store_tagline: "Professional Phone Repair Tools — UAE",
  store_email: "support@tsttools.ae",
  store_phone: "+971 50 123 4567",
  whatsapp: "+971501234567",
  store_address: "Dubai Mall, Downtown Dubai, Dubai, UAE",
  store_hours: "Sat-Thu: 9AM-9PM",
  // Map Embed URL
  google_maps_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.1787787560233!2d55.27407!3d25.19849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbf57ec27547fee3b!2sDubai%20Mall%2C%20Dubai!5e0!3m2!1sen!2sae!4v1680000000000!5m2!1sen!2sae",
  // Social Media Links
  facebook_url: "https://facebook.com/tsttools",
  instagram_url: "https://instagram.com/tsttools",
  twitter_url: "https://twitter.com/tsttools",
  youtube_url: "https://youtube.com/tsttools",
  // Shipping
  free_shipping_threshold: "200",
  shipping_cost: "15",
  same_day_delivery: true,
  cod_enabled: true,
  // Appearance
  primary_color: "#0ea5e9",
  hero_badge: "🇦🇪 UAE's #1 Repair Tool Store",
  banner_text: "Free Shipping on orders above AED 200",
  // SEO
  meta_title: "TSTTOOLS — Professional Phone Repair Tools UAE",
  meta_description: "Buy professional phone repair tools in UAE. Screwdrivers, soldering kits, opening tools, testing equipment delivered same day in Dubai.",
  meta_keywords: "phone repair tools UAE, soldering station Dubai, screwdriver set, iphone repair kit",
  // Notifications
  order_email_notify: true,
  low_stock_alert: true,
  low_stock_threshold: "5",
  new_message_notify: true,
  // Promotions
  promo_bar_enabled: true,
  promo_bar_text: "🔥 Free Shipping on orders above AED 200 | Same Day Delivery in Dubai",
  maintenance_mode: false,
};

export function getSettings() {
  try {
    const saved = localStorage.getItem("tsttools_settings");
    return saved ? { ...SETTINGS_DEFAULTS, ...JSON.parse(saved) } : SETTINGS_DEFAULTS;
  } catch (e) {
    return SETTINGS_DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const handleStorageChange = () => {
      setSettings(getSettings());
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-settings-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-settings-updated", handleStorageChange);
    };
  }, []);

  return settings;
}

