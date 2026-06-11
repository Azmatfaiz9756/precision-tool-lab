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
import { Input } from "@/components/ui/input";
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
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", content: "", customer_name: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

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
    queryFn: () => apiClient.entities.Review.filter({ product_id: id }),
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
    const title = product.name;
    const text = `Check out ${product.name} at TSTTOOLS!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        // User might have canceled the share, just fall through
      }
    }
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied! Share it with your friends.");
    } catch (e) {
      toast.error("Failed to copy link");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.content || !reviewForm.title || !reviewForm.customer_name) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await apiClient.entities.Review.create({
        product_id: id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        body: reviewForm.content,
        user_name: reviewForm.customer_name,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      toast.success("Review submitted successfully!");
      setReviewForm({ rating: 5, title: "", content: "", customer_name: "" });
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
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

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border text-sm font-medium overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab("description")} className={`pb-2 whitespace-nowrap transition-colors ${activeTab === "description" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>Description</button>
            <button onClick={() => setActiveTab("features")} className={`pb-2 whitespace-nowrap transition-colors ${activeTab === "features" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>Features</button>
            <button onClick={() => setActiveTab("specs")} className={`pb-2 whitespace-nowrap transition-colors ${activeTab === "specs" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>Specifications</button>
            <button onClick={() => setActiveTab("variations")} className={`pb-2 whitespace-nowrap transition-colors ${activeTab === "variations" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>Variations</button>
          </div>

          <div className="min-h-[120px] pt-2">
            {activeTab === "description" && (
              <p className="text-muted-foreground leading-relaxed text-sm">{product.description || "No description available."}</p>
            )}
            
            {activeTab === "features" && (
              <div className="space-y-4">
                {product.features?.length > 0 ? (
                  <ul className="space-y-1.5">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground text-sm">No specific features listed.</p>}
                
                {product.whats_included?.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">What's Included:</h4>
                    <ul className="space-y-1">
                      {product.whats_included.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "specs" && (
              <div className="text-sm">
                {product.specifications ? (
                  <table className="w-full text-left text-muted-foreground">
                    <tbody>
                      {Object.entries(product.specifications).map(([k, v]) => (
                        <tr key={k} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 font-medium text-foreground w-1/3">{k}</td>
                          <td className="py-2">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-muted-foreground text-sm">Specifications not provided.</p>}
              </div>
            )}

            {activeTab === "variations" && (
              <div className="text-sm text-muted-foreground">
                 <p>Standard version selected. Please contact us via WhatsApp to check availability for other variants.</p>
              </div>
            )}
          </div>

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
      <section className="mt-16">
        <h2 className="font-heading font-bold text-xl mb-6">Customer Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
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
                <p className="text-sm text-muted-foreground">{review.body}</p>
                <p className="text-xs text-muted-foreground mt-2">{review.user_name || "Customer"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">No reviews yet. Be the first to review this product!</p>
        )}

        <div className="bg-secondary/30 rounded-lg p-6 max-w-2xl border border-border">
          <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button type="button" key={i} onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`h-6 w-6 ${i < reviewForm.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <Input value={reviewForm.customer_name} onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Review Title</label>
                <Input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Great product!" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Review</label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                value={reviewForm.content} onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })} placeholder="Tell us what you think..." required 
              />
            </div>
            <Button type="submit" disabled={isSubmittingReview}>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading font-bold text-xl mb-6">Recommended / Alternative Products</h2>
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