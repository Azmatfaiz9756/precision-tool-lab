import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Do you deliver across all UAE emirates?", a: "Yes, we deliver to all seven emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah. Same-day delivery is available in Dubai for orders placed before 2 PM." },
  { q: "Are all products authentic?", a: "Absolutely. We source all products directly from manufacturers and authorized distributors. Every item is 100% genuine with original packaging." },
  { q: "What payment methods do you accept?", a: "We accept Credit/Debit Cards (Visa, Mastercard), Apple Pay, Google Pay, Bank Transfer, and Cash on Delivery (COD) with a small AED 10 fee." },
  { q: "What is your return policy?", a: "We offer a 30-day return policy for unused items in original packaging. Defective items can be returned within 60 days. Please visit our Return Policy page for full details." },
  { q: "How long does delivery take?", a: "Dubai: Same day or next day. Abu Dhabi & Sharjah: 1-2 business days. Other emirates: 2-3 business days. Free shipping on orders over AED 200." },
  { q: "Can I track my order?", a: "Yes! Once your order is shipped, you'll receive a tracking number via email. You can also check your order status in the My Account section." },
  { q: "Do you offer bulk/wholesale pricing?", a: "Yes, we offer special pricing for bulk orders and repair shops. Contact us via WhatsApp or email for wholesale inquiries." },
  { q: "What if a product is out of stock?", a: "You can click 'Notify When Available' on any out-of-stock product to receive an alert when it's back in stock. Most items are restocked within 1-2 weeks." },
];

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-4xl mb-3">FAQ</h1>
        <p className="text-muted-foreground">Frequently asked questions about TSTTOOLS</p>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="bg-card border border-border rounded-lg px-5">
            <AccordionTrigger className="text-sm font-medium text-left py-4 hover:no-underline hover:text-primary">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}