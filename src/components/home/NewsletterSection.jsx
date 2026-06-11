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
    <section className="bg-secondary/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20">
          
          {/* Stay Connected (Newsletter) */}
          <div className="space-y-4">
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-foreground">Stay Connected</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Sign up for our newsletter to get the latest product drops, special offers, and professional repair guides.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border shadow-sm max-w-[300px]"
                required
              />
              <Button type="submit" disabled={loading} className="bg-[#00a854] hover:bg-[#009247] text-white font-semibold">
                Sign Up
              </Button>
            </form>
          </div>

          {/* Get Social */}
          <div className="space-y-4">
            <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-foreground">Get Social</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Follow us on social media for exclusive behind-the-scenes content and daily updates.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:text-primary hover:border-primary transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:text-[#25D366] hover:border-[#25D366] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.008.01c-6.612 0-11.95 5.338-11.95 11.95 0 2.115.548 4.183 1.589 5.986l-1.69 6.177 6.326-1.658c1.748.955 3.722 1.458 5.725 1.458 6.61 0 11.948-5.338 11.948-11.95S18.618.01 12.008.01zm6.59 16.51c-.248.694-1.428 1.326-1.999 1.41-.512.077-1.159.109-1.871-.118-.432-.136-.985-.319-1.694-.625-2.981-1.287-4.927-4.289-5.076-4.487-.148-.199-1.213-1.612-1.213-3.074 0-1.463.768-2.182 1.04-2.479.272-.298.594-.372.792-.372.199 0 .397.002.57.01.18.01.426-.07.667.51.248.593.84 2.054.915 2.203.075.149.124.322.025.52-.1.199-.149.323-.298.497-.149.173-.312.387-.446.52-.148.148-.303.309-.13.606.173.298.77.127 1.653 2.059 1.135 1.013 2.094 1.326 2.39 1.475.296.148.47.124.643-.075.174-.198.743-.863.94-1.16.197-.298.395-.248.667-.149.272.099 1.726.813 2.022.962.296.149.496.223.57.347.075.124.075.716-.173 1.411z"/></svg>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}