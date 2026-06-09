import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice } from "@/lib/constants";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Heart, MapPin, LogOut, ShoppingCart, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { handleProductImageError } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const STATUS_COLORS = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  out_for_delivery: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  returned: "bg-muted text-muted-foreground border-border",
};

export default function Account() {
  const { logout } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get("tab") || "orders";
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiClient.entities.Order.list("-created_date", 50),
    initialData: [],
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiClient.entities.WishlistItem.list(),
    initialData: [],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiClient.entities.Address.list(),
    initialData: [],
  });

  const removeWishlistItem = async (id) => {
    await apiClient.entities.WishlistItem.delete(id);
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    toast.success("Removed from wishlist");
  };

  const addWishlistToCart = async (item) => {
    await apiClient.entities.CartItem.create({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price,
      quantity: 1,
    });
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    toast.success("Added to cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-3xl">My Account</h1>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-secondary border border-border mb-6">
          <TabsTrigger value="orders" className="gap-1.5"><Package className="h-3.5 w-3.5" /> Orders</TabsTrigger>
          <TabsTrigger value="wishlist" className="gap-1.5"><Heart className="h-3.5 w-3.5" /> Wishlist</TabsTrigger>
          <TabsTrigger value="addresses" className="gap-1.5"><MapPin className="h-3.5 w-3.5" /> Addresses</TabsTrigger>
        </TabsList>

        {/* Orders */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Package className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button asChild variant="outline" className="mt-4"><Link to="/shop">Start Shopping</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-mono text-sm font-bold">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[order.status] || ""}>{order.status?.replace(/_/g, " ")}</Badge>
                      <span className="font-mono font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0">
                        <img src={item.product_image || ""} alt="" className="w-full h-full object-cover" onError={handleProductImageError} />
                      </div>
                    ))}
                    {(order.items?.length || 0) > 4 && (
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  {order.estimated_delivery && (
                    <p className="text-xs text-muted-foreground mt-2">Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wishlist */}
        <TabsContent value="wishlist">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Heart className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <Button asChild variant="outline" className="mt-4"><Link to="/shop">Browse Products</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-3">
                  <Link to={`/product/${item.product_id}`} className="w-16 h-16 rounded bg-secondary overflow-hidden flex-shrink-0">
                    <img src={item.product_image || ""} alt="" className="w-full h-full object-cover" onError={handleProductImageError} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="text-sm font-semibold line-clamp-1 hover:text-primary">{item.product_name}</Link>
                    <p className="text-sm font-mono text-primary mt-0.5">{formatPrice(item.price)}</p>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addWishlistToCart(item)}>
                        <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-destructive" onClick={() => removeWishlistItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses">
          {addresses.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <MapPin className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground">No saved addresses</p>
              <p className="text-xs text-muted-foreground mt-1">Addresses are saved during checkout</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm">{addr.label || "Address"}</p>
                    {addr.is_default && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.full_name}</p>
                  <p className="text-sm text-muted-foreground">{addr.address_line_1}</p>
                  {addr.address_line_2 && <p className="text-sm text-muted-foreground">{addr.address_line_2}</p>}
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.emirate}</p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}