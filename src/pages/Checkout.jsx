import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice, EMIRATES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, Building, Banknote, ArrowLeft, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { handleProductImageError } from "@/lib/utils";

const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit/Debit Card", icon: CreditCard, sub: "Visa, Mastercard" },
  { value: "apple_pay", label: "Apple Pay", icon: Smartphone, sub: "Quick checkout" },
  { value: "google_pay", label: "Google Pay", icon: Smartphone, sub: "Quick checkout" },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building, sub: "UAE banks" },
  { value: "cod", label: "Cash on Delivery", icon: Banknote, sub: "+AED 10 fee" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", address_line_1: "", address_line_2: "", city: "", emirate: "", postal_code: "",
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiClient.entities.CartItem.list(),
    initialData: [],
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal >= 200 ? 0 : 25;
  const codFee = paymentMethod === "cod" ? 10 : 0;
  const total = subtotal - discount + shipping + codFee;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const coupons = await apiClient.entities.Coupon.filter({ code: couponCode.trim().toUpperCase(), is_active: true });
    if (coupons.length === 0) { toast.error("Invalid coupon code"); return; }
    const coupon = coupons[0];
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      toast.error(`Minimum order AED ${coupon.min_order_amount}`); return;
    }
    const discountAmount = coupon.discount_type === "percentage"
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;
    setDiscount(discountAmount);
    toast.success(`Coupon applied! You save ${formatPrice(discountAmount)}`);
  };

  const placeOrder = async () => {
    if (!form.full_name || !form.phone || !form.address_line_1 || !form.emirate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setPlacing(true);
    const orderNumber = `TST-${Date.now().toString(36).toUpperCase()}`;
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + (form.emirate === "Dubai" ? 1 : 3));

    await apiClient.entities.Order.create({
      order_number: orderNumber,
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      subtotal,
      discount_amount: discount,
      shipping_cost: shipping + codFee,
      total,
      coupon_code: couponCode || undefined,
      status: "confirmed",
      payment_method: paymentMethod,
      payment_status: paymentMethod === "cod" ? "pending" : "paid",
      shipping_address: form,
      estimated_delivery: estDelivery.toISOString().split("T")[0],
    });

    // Clear cart
    for (const item of cartItems) {
      await apiClient.entities.CartItem.delete(item.id);
    }
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    toast.success("Order placed successfully!");
    navigate(`/account?tab=orders`);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button asChild><Link to="/shop">Go to Shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/cart")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
      </Button>
      <h1 className="font-heading font-bold text-3xl mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono">Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono">Phone *</Label>
                <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+971 50 XXX XXXX" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-mono">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-mono">Address Line 1 *</Label>
                <Input value={form.address_line_1} onChange={(e) => updateField("address_line_1", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-mono">Address Line 2</Label>
                <Input value={form.address_line_2} onChange={(e) => updateField("address_line_2", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono">Emirate *</Label>
                <Select value={form.emirate} onValueChange={(v) => updateField("emirate", v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono">City</Label>
                <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="bg-secondary border-border" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                return (
                  <label key={pm.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === pm.value ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <RadioGroupItem value={pm.value} />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{pm.label}</p>
                      <p className="text-xs text-muted-foreground">{pm.sub}</p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-28">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                  <img src={item.product_image} alt="" className="w-full h-full object-cover" onError={handleProductImageError} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">×{item.quantity || 1}</p>
                </div>
                <p className="text-xs font-mono">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
              className="bg-secondary border-border text-xs font-mono" />
            <Button variant="outline" size="sm" onClick={applyCoupon} className="shrink-0">
              <Tag className="h-3 w-3 mr-1" /> Apply
            </Button>
          </div>

          <Separator className="bg-border mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span className="font-mono">-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-mono">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
            {codFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">COD Fee</span><span className="font-mono">{formatPrice(codFee)}</span></div>}
            <Separator className="bg-border" />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="font-mono text-primary">{formatPrice(total)}</span></div>
          </div>

          <Button size="lg" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={placeOrder} disabled={placing}>
            {placing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing Order...</> : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}