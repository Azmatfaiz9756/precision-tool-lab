import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/api/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { handleProductImageError } from "@/lib/utils";

export default function ProductCard({ product, index = 0 }) {
  const queryClient = useQueryClient();

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiClient.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || "",
        price: product.price,
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    } catch (e) {
      toast.error("Please login to add to cart");
    }
  };

  const addToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiClient.entities.WishlistItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || "",
        price: product.price,
      });
      toast.success("Added to wishlist");
    } catch (e) {
      toast.error("Please login to add to wishlist");
    }
  };

  const inStock = (product.stock_quantity || 0) > 0;
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discount = hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={product.images?.[0] || ""}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
              onError={handleProductImageError}
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-lg" onClick={addToWishlist}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg" onClick={addToCart}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {hasDiscount && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] font-mono px-1.5 py-0.5">
                  -{discount}%
                </Badge>
              )}
              {product.is_bestseller && (
                <Badge className="bg-primary text-primary-foreground text-[10px] font-mono px-1.5 py-0.5">
                  BEST
                </Badge>
              )}
              {!inStock && (
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0.5">
                  OUT OF STOCK
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
              {product.brand || "TSTTOOLS"}
            </p>
            <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.round(product.average_rating || 0) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
              ))}
              <span className="text-xs text-muted-foreground font-mono ml-1">({product.review_count || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-primary">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="font-mono text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}