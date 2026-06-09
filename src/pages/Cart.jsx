import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleProductImageError } from "@/lib/utils";

export default function Cart() {
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiClient.entities.CartItem.list(),
    initialData: [],
  });

  const updateQuantity = async (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) {
      await apiClient.entities.CartItem.delete(item.id);
    } else {
      await apiClient.entities.CartItem.update(item.id, { quantity: newQty });
    }
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const removeItem = async (item) => {
    await apiClient.entities.CartItem.delete(item.id);
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal >= 200 ? 0 : 25;
  const total = subtotal + shipping;

  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-muted mx-auto mb-4" />
        <h1 className="font-heading font-bold text-2xl mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added any tools yet</p>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-bold text-3xl mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-card border border-border rounded-lg p-4 flex gap-4"
              >
                <Link to={`/product/${item.product_id}`} className="w-20 h-20 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                  <img src={item.product_image || ""} alt={item.product_name} className="w-full h-full object-cover" onError={handleProductImageError} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product_id}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
                    {item.product_name}
                  </Link>
                  <p className="font-mono text-primary text-sm mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-md">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-mono text-xs">{item.quantity || 1}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-28">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-mono">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <Separator className="bg-border" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="font-mono text-primary">{formatPrice(total)}</span>
            </div>
          </div>
          {subtotal < 200 && (
            <p className="text-xs text-muted-foreground mt-3">
              Add AED {(200 - subtotal).toFixed(2)} more for free shipping
            </p>
          )}
          <Button asChild size="lg" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link to="/checkout">Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="ghost" className="w-full mt-2">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}