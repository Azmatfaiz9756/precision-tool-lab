import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice } from "@/lib/constants";
import { Package, ShoppingBag, Users, Tag, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: () => apiClient.entities.Order.list("-created_date", 100) });
  const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => apiClient.entities.Product.list() });
  const { data: messages = [] } = useQuery({ queryKey: ["admin-messages"], queryFn: () => apiClient.entities.ContactMessage.list() });
  const { data: newsletter = [] } = useQuery({ queryKey: ["admin-newsletter"], queryFn: () => apiClient.entities.Newsletter.list() });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => ["pending", "confirmed", "processing"].includes(o.status));
  const unreadMessages = messages.filter(m => !m.is_read);
  const recentOrders = orders.slice(0, 5);

  const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-green-600", link: "/admin/orders" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600", link: "/admin/orders" },
    { label: "Products", value: products.length, icon: Package, color: "text-purple-600", link: "/admin/products" },
    { label: "Pending Orders", value: pendingOrders.length, icon: Clock, color: "text-orange-600", link: "/admin/orders" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: StatIcon, color, link }) => (
          <Link key={label} to={link} className="bg-background border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <StatIcon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="font-bold text-xl font-mono">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-background border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No orders yet</p>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-mono font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"}`}>
                    {order.status?.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-sm font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="bg-background border border-border rounded-lg p-5">
            <h3 className="font-semibold text-sm mb-3">Quick Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Newsletter subs</span><span className="font-mono">{newsletter.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Unread messages</span><span className={`font-mono ${unreadMessages.length > 0 ? "text-destructive" : ""}`}>{unreadMessages.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Low stock (&lt;5)</span><span className="font-mono text-orange-600">{products.filter(p => (p.stock_quantity || 0) < 5).length}</span></div>
            </div>
          </div>
          {unreadMessages.length > 0 && (
            <Link to="/admin/messages" className="block bg-destructive/5 border border-destructive/20 rounded-lg p-4 hover:bg-destructive/10 transition-colors">
              <p className="text-sm font-medium text-destructive">{unreadMessages.length} unread message{unreadMessages.length > 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click to view</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}