import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: June 2026</p>
        <p>TSTTOOLS is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Name, email, phone number, and delivery address</li>
          <li>Payment information (processed securely via third-party providers)</li>
          <li>Order history and preferences</li>
          <li>Website usage data and analytics</li>
        </ul>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Process and deliver your orders</li>
          <li>Send order updates and tracking information</li>
          <li>Provide customer support</li>
          <li>Send promotional offers (only with your consent)</li>
          <li>Improve our services and website experience</li>
        </ul>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Data Security</h2>
        <p>We use industry-standard encryption (SSL/TLS) to protect your data. Payment information is processed through PCI-compliant third-party providers and is never stored on our servers.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. Contact us at support@tsttools.ae to exercise these rights.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Cookies</h2>
        <p>We use essential cookies to enable site functionality and analytics cookies to improve your experience. You can manage cookie preferences in your browser settings.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Contact</h2>
        <p>For privacy-related inquiries, contact us at support@tsttools.ae.</p>
      </div>
    </div>
  );
}