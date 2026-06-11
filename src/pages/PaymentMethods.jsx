import React from "react";

export default function PaymentMethods() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Payment Methods</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>At TSTTOOLS, we offer a variety of secure and convenient payment options for our customers in the UAE and beyond.</p>

        <div className="bg-secondary/30 p-6 rounded-lg border border-border mt-8">
          <h2 className="text-foreground font-semibold text-lg mb-3">Credit and Debit Cards</h2>
          <p>We accept all major credit and debit cards, including Visa, Mastercard, and JCB. Your payment is processed securely through our trusted payment gateways, which use advanced encryption to protect your financial data.</p>
        </div>

        <div className="bg-secondary/30 p-6 rounded-lg border border-border mt-4">
          <h2 className="text-foreground font-semibold text-lg mb-3">Digital Wallets (Apple Pay & Google Pay)</h2>
          <p>For a faster checkout experience, you can pay using Apple Pay or Google Pay directly from your supported devices. This method provides an extra layer of security using biometric authentication.</p>
        </div>

        <div className="bg-secondary/30 p-6 rounded-lg border border-border mt-4">
          <h2 className="text-foreground font-semibold text-lg mb-3">Cash on Delivery (COD)</h2>
          <p>We offer Cash on Delivery for orders within the UAE. Please note that a standard COD fee of AED 10 applies to all Cash on Delivery orders. Please have the exact amount ready to speed up delivery.</p>
        </div>

        <div className="bg-secondary/30 p-6 rounded-lg border border-border mt-4">
          <h2 className="text-foreground font-semibold text-lg mb-3">Bank Transfer</h2>
          <p>For large or wholesale orders, we accept direct bank transfers to our UAE bank account. Your order will be dispatched once the funds have cleared in our account. Please contact support for our banking details.</p>
        </div>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Payment Security</h2>
        <p>Your security is our top priority. We do not store your full credit card details on our servers. All transactions are fully encrypted and PCI-DSS compliant.</p>
      </div>
    </div>
  );
}
