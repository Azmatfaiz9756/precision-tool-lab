import React from "react";
import { RotateCcw, Shield, AlertCircle, CheckCircle } from "lucide-react";

export default function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Return Policy</h1>
      
      <div className="space-y-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">30-Day Return Policy</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            We want you to be completely satisfied with your purchase. If you're not happy, 
            you can return most items within 30 days of delivery for a full refund or exchange.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Eligible for Return</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Unused items in original packaging</li>
            <li>• Defective or damaged items (within 60 days)</li>
            <li>• Wrong item received</li>
            <li>• Items must include all accessories and manuals</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-lg">Not Eligible</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Used or opened consumables (solder wire, adhesives, cleaning solutions)</li>
            <li>• Items returned after 30 days (unless defective)</li>
            <li>• Items without original packaging</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">How to Return</h2>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Contact us via WhatsApp or email with your order number</li>
            <li>We'll provide a return shipping label</li>
            <li>Pack the item securely in original packaging</li>
            <li>Drop off at the nearest courier point or schedule pickup</li>
            <li>Refund processed within 5-7 business days after inspection</li>
          </ol>
        </div>
      </div>
    </div>
  );
}