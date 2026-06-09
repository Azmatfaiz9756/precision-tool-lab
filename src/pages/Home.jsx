import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { CATEGORIES } from "@/lib/constants";
import HeroSlider from "@/components/home/HeroSlider";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import BestsellersCarousel from "@/components/home/BestsellersCarousel";
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
  const { data: products = [] } = useQuery({
    queryKey: ["products-bestsellers"],
    queryFn: () => apiClient.entities.Product.filter({ is_bestseller: true }, "-created_date", 10),
    initialData: [],
  });

  return (
    <div>
      <HeroSlider />
      <CategoriesGrid categories={CATEGORIES} categoryImages={CATEGORY_IMAGES} />
      <BestsellersCarousel products={products} />
      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
}