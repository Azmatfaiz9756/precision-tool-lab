import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await apiClient.entities.Newsletter.create({ email: email.trim() });
    toast.success("Subscribed! You'll receive our latest offers.");
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="border-t border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2">Stay Updated</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Get exclusive deals, new product alerts, and repair tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border font-mono text-sm"
              required
            />
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground shrink-0">
              Subscribe <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}