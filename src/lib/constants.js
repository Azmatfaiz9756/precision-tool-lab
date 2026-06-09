export const CATEGORIES = [
  { key: "consumables", label: "Consumables", icon: "Sparkles" },
  { key: "essential_tools", label: "Essential Tools", icon: "Wrench" },
  { key: "microscopes", label: "Microscopes", icon: "Eye" },
  { key: "soldering_equipment", label: "Soldering Equipment", icon: "Flame" },
  { key: "programming_tools", label: "Programming Tools", icon: "Cpu" },
  { key: "workshop_organization", label: "Workshop Organization", icon: "Grid" },
  { key: "static_control_safety", label: "Static Control & Safety", icon: "Shield" },
  { key: "screen_repair_tools", label: "Screen Repair Tools", icon: "Smartphone" },
  { key: "apple_device_repair", label: "Apple Device Repair Tools", icon: "Apple" },
  { key: "diagnostic_testing", label: "Diagnostic & Testing", icon: "Gauge" },
  { key: "other_tools", label: "Other Tools", icon: "PackageOpen" },
];

export const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export const WHATSAPP_NUMBER = "+971501234567";

export const formatPrice = (price) => {
  if (!price && price !== 0) return "AED 0";
  return `AED ${Number(price).toFixed(2)}`;
};

export const getCategoryLabel = (key) => {
  const cat = CATEGORIES.find((c) => c.key === key);
  return cat ? cat.label : key;
};