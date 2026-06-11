import React from "react";

export default function Cookie() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Cookie Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: June 2026</p>
        <p>This Cookie Policy explains how TSTTOOLS uses cookies and similar tracking technologies on our website.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">What are Cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, keep your session secure, and analyze site traffic.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Types of Cookies We Use</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Essential Cookies:</strong> Required for the website to function (e.g., shopping cart, secure login).</li>
          <li><strong>Performance & Analytics Cookies:</strong> Help us understand how visitors interact with our site so we can improve it.</li>
          <li><strong>Functionality Cookies:</strong> Remember your preferences, such as your language or region.</li>
        </ul>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Managing Cookies</h2>
        <p>You can control or delete cookies through your browser settings. However, disabling essential cookies may affect your ability to use certain features of our site.</p>

        <h2 className="text-foreground font-semibold text-lg mt-8 mb-3">Contact</h2>
        <p>If you have questions about our use of cookies, contact us at support@tsttools.ae.</p>
      </div>
    </div>
  );
}
