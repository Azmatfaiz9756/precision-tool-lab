import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { handleProductImageError } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => apiClient.entities.Order.list("-created_date", 200),
  });

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address?.phone?.includes(search);
    return matchStatus && matchSearch;
  });

  const updateStatus = async (orderId, status) => {
    await apiClient.entities.Order.update(orderId, { status });
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status }));
    toast.success("Order status updated");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-background" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} orders</span>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.map((order) => (
              <tr key={order.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-mono font-medium text-xs">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-sm">{order.shipping_address?.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{order.shipping_address?.phone || ""}</p>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-primary">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <Select value={order.status} onValueChange={v => updateStatus(order.id, v)}>
                    <SelectTrigger className={`h-7 text-xs border-0 px-2 py-0 w-36 ${STATUS_COLORS[order.status] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                  {new Date(order.created_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-10">No orders found</p>
        )}
      </div>

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle className="font-mono">{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[selectedOrder.status] || ""}`}>{selectedOrder.status?.replace(/_/g, " ")}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{selectedOrder.payment_method?.replace(/_/g, " ")}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{selectedOrder.payment_status}</span>
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground mb-2">SHIPPING ADDRESS</p>
                {selectedOrder.shipping_address && Object.entries(selectedOrder.shipping_address).map(([k, v]) => v && (
                  <p key={k} className="text-sm text-muted-foreground">{v}</p>
                ))}
              </div>
              <div>
                <p className="font-semibold text-xs text-muted-foreground mb-2">ITEMS</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.product_image || ""} alt="" className="w-9 h-9 rounded object-cover bg-muted" onError={handleProductImageError} />
                      <div className="flex-1">
                        <p className="text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                      </div>
                      <p className="font-mono text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-mono">{formatPrice(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount_amount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span className="font-mono">-{formatPrice(selectedOrder.discount_amount)}</span></div>}
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="font-mono">{formatPrice(selectedOrder.shipping_cost)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span className="font-mono text-primary">{formatPrice(selectedOrder.total)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}