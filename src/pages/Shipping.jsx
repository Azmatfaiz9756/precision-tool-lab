import React from "react";
import { Truck, Clock, MapPin, Package } from "lucide-react";

export default function Shipping() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Shipping & Delivery</h1>
      
      <div className="space-y-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Delivery Times</h2>
          </div>
          <div className="space-y-3">
            {[
              { area: "Dubai", time: "Same Day / Next Day", note: "Order before 2 PM for same day" },
              { area: "Abu Dhabi & Sharjah", time: "1-2 Business Days", note: "" },
              { area: "Ajman, UAQ, RAK, Fujairah", time: "2-3 Business Days", note: "" },
            ].map(({ area, time, note }) => (
              <div key={area} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{area}</p>
                  {note && <p className="text-xs text-muted-foreground">{note}</p>}
                </div>
                <span className="text-sm font-mono text-primary">{time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Shipping Costs</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">FREE</strong> shipping on all orders over AED 200</li>
            <li>• Standard shipping: AED 25 for orders under AED 200</li>
            <li>• Cash on Delivery: Additional AED 10 fee</li>
            <li>• All prices include VAT</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Order Processing</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Orders placed before 2 PM are processed the same day</li>
            <li>• Orders placed after 2 PM are processed the next business day</li>
            <li>• You will receive a tracking number via email once shipped</li>
            <li>• Business hours: Saturday - Thursday, 9 AM - 9 PM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}