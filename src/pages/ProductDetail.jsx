import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice, WHATSAPP_NUMBER, getCategoryLabel } from "@/lib/constants";
import ProductCard from "@/components/products/ProductCard";
import ImageZoomModal from "@/components/products/ImageZoomModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, Heart, MessageCircle, Minus, Plus, Check, ChevronRight, Share2, Truck, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { handleProductImageError } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)"
    });
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient.entities.Product.get(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => apiClient.entities.Review.filter({ product_id: id, is_approved: true }),
    initialData: [],
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related", product?.category],
    queryFn: () => apiClient.entities.Product.filter({ category: product.category }, "-created_date", 4),
    enabled: !!product?.category,
    initialData: [],
  });

  const addToCart = async () => {
    try {
      await apiClient.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || "",
        price: product.price,
        quantity,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    } catch (e) {
      toast.error("Please login to add to cart");
    }
  };

  const addToWishlist = async () => {
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch (e) {}
    } else {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied");
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          toast.success("Link copied");
        }
      } catch (e) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-card border border-border rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-card rounded animate-pulse w-3/4" />
            <div className="h-6 bg-card rounded animate-pulse w-1/4" />
            <div className="h-24 bg-card rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [""];
  const inStock = (product.stock_quantity || 0) > 0;
  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-mono">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-primary">{getCategoryLabel(product.category)}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div
            className="aspect-square bg-card border border-border rounded-lg overflow-hidden relative group cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setZoomOpen(true)}
          >
            <img
              key={selectedImage}
              src={images[selectedImage]}
              alt={product.name}
              style={{
                transition: zoomStyle.transform === "scale(1)" ? "transform 0.3s ease-out, transform-origin 0.3s ease-out" : "transform-origin 0.05s ease-out",
                ...zoomStyle
              }}
              className="w-full h-full object-contain p-2"
              onError={handleProductImageError}
            />
            <div className="absolute top-3 right-3 h-8 w-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn className="h-4 w-4 text-white" />
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-md border overflow-hidden transition-all flex-shrink-0 ${selectedImage === i ? "border-primary ring-1 ring-primary" : "border-border opacity-60 hover:opacity-100"}`}>
                  <img src={img} alt="" className="w-full h-full object-contain bg-secondary p-1" onError={handleProductImageError} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Zoom Modal */}
        {zoomOpen && (
          <ImageZoomModal
            images={images}
            initialIndex={selectedImage}
            onClose={() => setZoomOpen(false)}
          />
        )}

        {/* Product info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">{product.brand || "TSTTOOLS"} · {product.sku || ""}</p>
            <h1 className="font-heading font-bold text-2xl md:text-3xl">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.average_rating || 0) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-mono">({product.review_count || 0} reviews)</span>
            <Badge variant={inStock ? "default" : "secondary"} className={inStock ? "bg-primary/10 text-primary border-primary/20" : ""}>
              {inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-mono font-bold text-3xl text-primary">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="font-mono text-lg text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Features */}
          {product.features?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What's included */}
          {product.whats_included?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">What's Included</h3>
              <ul className="space-y-1">
                {product.whats_included.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator className="bg-border" />

          {/* Quantity & actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-md">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center font-mono text-sm">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={addToCart} disabled={!inStock}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={addToWishlist}>
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-4 pt-2">
            <button onClick={() => {
                const url = window.location.href;
                const text = `Check out ${product.name} - ${formatPrice(product.price)} at TSTTOOLS`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
              }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg p-3">
            <Truck className="h-4 w-4 text-primary" />
            <span>Free shipping on orders over AED 200 · Same day delivery in Dubai</span>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading font-bold text-xl mb-6">Customer Reviews ({reviews.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                  ))}
                  {review.is_verified_purchase && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">Verified</Badge>
                  )}
                </div>
                {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                <p className="text-sm text-muted-foreground">{review.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{review.customer_name || "Customer"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading font-bold text-xl mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.filter((p) => p.id !== product.id).slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}