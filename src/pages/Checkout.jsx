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

          <Button size="lg" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md" onClick={placeOrder} disabled={placing}>
            {placing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing Order...</> : "Place Order"}
          </Button>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex flex-col items-center justify-center gap-1.5 text-center">
              <div className="flex items-center gap-1.5 text-[#00a854] font-semibold text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                Secure & Trusted Checkout
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex flex-wrap justify-center gap-x-2 gap-y-1">
                <span>Mastercard</span> • <span>PayPal</span> • <span>Visa</span> • <span>Apple Pay</span> • <span>Google Pay</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                <svg className="w-6 h-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <div className="text-[9px] font-medium leading-tight">100% QUALITY<br/>BEST CHOICE</div>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                <svg className="w-6 h-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div className="text-[9px] font-medium leading-tight">GUARANTEED<br/>SATISFACTION</div>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                <svg className="w-6 h-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                <div className="text-[9px] font-medium leading-tight">100% MONEYBACK<br/>GUARANTEE</div>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                <svg className="w-6 h-6 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <div className="text-[9px] font-medium leading-tight">FREE RETURN<br/>GUARANTEE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}