import React, { useState } from "react";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/utils";

export default function Contact() {
  const settings = useSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill required fields"); return; }
    setSending(true);
    await apiClient.entities.ContactMessage.create(form);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading font-bold text-4xl mb-3">Contact Us</h1>
        <p className="text-muted-foreground">Have a question? We're here to help.</p>
      </div>

      {/* Map */}
      <div className="max-w-5xl mx-auto mb-10 rounded-xl overflow-hidden border border-border h-64">
        <iframe
          title="TSTTOOLS Location"
          src={settings.google_maps_url}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="font-semibold text-xl mb-4">Get in Touch</h2>
          {[
            { icon: Phone, label: "Phone", value: settings.store_phone, href: `tel:${settings.store_phone.replace(/\s+/g, "")}` },
            { icon: Mail, label: "Email", value: settings.store_email, href: `mailto:${settings.store_email}` },
            { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${settings.whatsapp.replace(/\+/g, "")}` },
            { icon: MapPin, label: "Location", value: settings.store_address },
            { icon: Clock, label: "Hours", value: settings.store_hours },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors">{value}</a>
                ) : (
                  <p className="text-sm text-muted-foreground">{value}</p>
                )}
              </div>
            </div>
          ))}

          <a href={`https://wa.me/${settings.whatsapp.replace(/\+/g, "")}?text=Hi, I have a question about TSTTOOLS products`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600/10 text-green-400 border border-green-600/20 rounded-lg px-4 py-3 hover:bg-green-600/20 transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium text-sm">Quick Chat on WhatsApp</span>
          </a>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-xl mb-2">Send a Message</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border-border" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono">Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-secondary border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono">Message *</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="bg-secondary border-border" />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold" disabled={sending}>
            {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
          </Button>
        </form>
      </div>
    </div>
  );
}