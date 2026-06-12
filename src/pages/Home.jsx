import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronDown } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { CATEGORIES } from "@/lib/constants";
import { useSettings } from "@/lib/utils";
import HeroSlider from "@/components/home/HeroSlider";
import NewArrivalsMarquee from "@/components/home/NewArrivalsMarquee";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import BestsellersCarousel from "@/components/home/BestsellersCarousel";
import PartnerBrands from "@/components/home/PartnerBrands";
import ReviewsSection from "@/components/home/ReviewsSection";
import NewsletterSection from "@/components/home/NewsletterSection";

const CATEGORY_IMAGES = {
  consumables: "https://www.diyfixtool.com/cdn/shop/files/RL250.png",
  essential_tools: "https://www.diyfixtool.com/cdn/shop/files/SD17.jpg",
  microscopes: "https://www.diyfixtool.com/cdn/shop/files/6558SE_3.jpg",
  soldering_equipment: "https://www.diyfixtool.com/cdn/shop/files/hotairgun_6.jpg",
  programming_tools: "https://www.diyfixtool.com/cdn/shop/files/preview_images/hqdefault_f5b2c24d-d260-4c43-a99d-a1cc74c77673.jpg",
  workshop_organization: "https://www.diyfixtool.com/cdn/shop/files/3e0a3a3b-af9d-41c8-825d-de804b094e1c.jpg",
  static_control_safety: "https://www.diyfixtool.com/cdn/shop/files/H1a4b9a0284144941887da83fbb0520dey.jpg",
  screen_repair_tools: "https://www.diyfixtool.com/cdn/shop/files/MobiToolSTD-15Ultra_1.jpg",
  apple_device_repair: "https://www.diyfixtool.com/cdn/shop/files/D01_1.jpg",
  diagnostic_testing: "https://www.diyfixtool.com/cdn/shop/files/DT-101T.png",
  other_tools: "https://www.diyfixtool.com/cdn/shop/files/MobiToolSTD-15Ultra_2.jpg",
};

export default function Home() {
  const settings = useSettings();
  const [selectedCity, setSelectedCity] = useState("Dubai");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const { data: bestsellers = [] } = useQuery({
    queryKey: ["products-bestsellers"],
    queryFn: () => apiClient.entities.Product.filter({ is_bestseller: true }, "-created_date", 10),
    initialData: [],
  });

  const { data: newArrivals = [] } = useQuery({
    queryKey: ["products-new-arrivals"],
    queryFn: () => apiClient.entities.Product.list("-created_date", 10),
    initialData: [],
  });

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[#08090c] pt-1">
        <HeroSlider />
        
        {/* Mobile City Selector (Centered below Banner, above Marquee) */}
        <div className="sm:hidden flex justify-center mt-4 mb-2 relative z-50">
          <div className="relative">
            <button 
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center justify-between hover:opacity-90 transition-opacity bg-[#00a854] text-white px-3 py-1.5 rounded-full border border-white/20 shadow-inner w-[160px]"
            >
              <MapPin className="h-4 w-4 text-white shrink-0" />
              <span className="text-sm font-bold px-2">{selectedCity}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </button>
            {showCityDropdown && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setShowCityDropdown(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-card border border-border shadow-xl rounded-lg py-1 w-48 z-[110] text-sm animate-in fade-in zoom-in-95 duration-150">
                  {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map(city => (
                    <button 
                      key={city}
                      className={`w-full text-left px-4 py-2 hover:bg-[#00a854]/10 transition-colors ${selectedCity === city ? 'text-[#00a854] font-bold' : 'text-foreground'}`}
                      onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* New Arrivals Section (Marquee) */}
        <NewArrivalsMarquee 
          products={newArrivals} 
          title={settings.new_arrivals_title} 
          subtitle={settings.new_arrivals_subtitle} 
        />
      </div>

      {/* Shop By Category */}
      <CategoriesGrid categories={CATEGORIES} categoryImages={CATEGORY_IMAGES} />
      
      {/* Best Selling Section */}
      <BestsellersCarousel 
        products={bestsellers} 
        title="Best Selling" 
        subtitle="Most popular tools among UAE technicians" 
      />
      
      <PartnerBrands />
      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
}