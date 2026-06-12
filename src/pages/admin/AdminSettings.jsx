import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Store, Truck, Phone, Palette, Globe, Shield, Bell, Plus, Trash2 } from "lucide-react";
import { SETTINGS_DEFAULTS } from "@/lib/utils";
import { apiClient } from "@/api/apiClient";

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-background border border-border rounded-lg p-5 space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-mono">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

export default function AdminSettings() {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.settings.get().then(data => {
      setSettings(prev => ({ ...prev, ...data }));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const saveAll = async () => {
    setSaving(true);
    try {
      await apiClient.settings.update(settings);
      window.dispatchEvent(new Event("local-settings-updated"));
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-muted-foreground">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl">Website Settings</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Manage all website configuration from here</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="bg-primary text-primary-foreground gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="store" className="text-xs gap-1"><Store className="h-3 w-3" />Store Info</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xs gap-1"><Truck className="h-3 w-3" />Shipping</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1"><Palette className="h-3 w-3" />Appearance</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs gap-1"><Globe className="h-3 w-3" />SEO</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="h-3 w-3" />Notifications</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs gap-1"><Shield className="h-3 w-3" />Advanced</TabsTrigger>
        </TabsList>

        {/* Store Info */}
        <TabsContent value="store" className="space-y-4 mt-4">
          <SectionCard title="Store Details" icon={Store}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Store Name">
                <Input value={settings.store_name} onChange={e => set("store_name", e.target.value)} />
              </Field>
              <Field label="Store Tagline">
                <Input value={settings.store_tagline} onChange={e => set("store_tagline", e.target.value)} />
              </Field>
              <Field label="Support Email">
                <Input type="email" value={settings.store_email} onChange={e => set("store_email", e.target.value)} />
              </Field>
              <Field label="Phone Number">
                <Input value={settings.store_phone} onChange={e => set("store_phone", e.target.value)} />
              </Field>
              <Field label="WhatsApp Number" hint="Include country code, no +">
                <Input value={settings.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="971501234567" />
              </Field>
              <Field label="Store Address">
                <Input value={settings.store_address} onChange={e => set("store_address", e.target.value)} />
              </Field>
              <Field label="Business Hours">
                <Input value={settings.store_hours} onChange={e => set("store_hours", e.target.value)} placeholder="Sat-Thu: 9AM-9PM" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Google Maps Embed URL" hint="Iframe src URL from Google Maps Share menu">
                  <Input value={settings.google_maps_url} onChange={e => set("google_maps_url", e.target.value)} />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Social Media Links" icon={Globe}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Facebook Page URL">
                <Input value={settings.facebook_url} onChange={e => set("facebook_url", e.target.value)} />
              </Field>
              <Field label="Instagram Profile URL">
                <Input value={settings.instagram_url} onChange={e => set("instagram_url", e.target.value)} />
              </Field>
              <Field label="Twitter/X Profile URL">
                <Input value={settings.twitter_url} onChange={e => set("twitter_url", e.target.value)} />
              </Field>
              <Field label="YouTube Channel URL">
                <Input value={settings.youtube_url} onChange={e => set("youtube_url", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Contact Settings" icon={Phone}>
            {/* Removed promo bar from here */}
            <div className="text-xs text-muted-foreground">Store contact settings are managed above.</div>
          </SectionCard>
        </TabsContent>

        {/* Shipping */}
        <TabsContent value="shipping" className="space-y-4 mt-4">
          <SectionCard title="Shipping Settings" icon={Truck}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Free Shipping Threshold (AED)" hint="Orders above this get free shipping">
                <Input type="number" value={settings.free_shipping_threshold} onChange={e => set("free_shipping_threshold", e.target.value)} />
              </Field>
              <Field label="Standard Shipping Cost (AED)">
                <Input type="number" value={settings.shipping_cost} onChange={e => set("shipping_cost", e.target.value)} />
              </Field>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Switch checked={settings.same_day_delivery} onCheckedChange={v => set("same_day_delivery", v)} />
                <Label className="text-sm">Enable Same Day Delivery (Dubai)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={settings.cod_enabled} onCheckedChange={v => set("cod_enabled", v)} />
                <Label className="text-sm">Enable Cash on Delivery (COD)</Label>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <SectionCard title="Brand & Visuals" icon={Palette}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Primary Brand Color">
                <div className="flex gap-2">
                  <input type="color" value={settings.primary_color} onChange={e => set("primary_color", e.target.value)}
                    className="h-9 w-14 rounded border border-border cursor-pointer bg-background" />
                  <Input value={settings.primary_color} onChange={e => set("primary_color", e.target.value)} className="font-mono" />
                </div>
              </Field>
              <Field label="Hero Badge Text">
                <Input value={settings.hero_badge} onChange={e => set("hero_badge", e.target.value)} />
              </Field>
            </div>
            <Field label="Banner/Announcement Text">
              <Input value={settings.banner_text} onChange={e => set("banner_text", e.target.value)} />
            </Field>
          </SectionCard>

          <SectionCard title="Top Header Marquee (Promo Bar)" icon={Globe}>
            <Field label="Header Marquee Text" hint="Enter one offer per line. Use emojis (🔥, ⚡, 🚚) for icons.">
              <Textarea rows={4} value={settings.promo_bar_text || ""} onChange={e => set("promo_bar_text", e.target.value)} placeholder="🔥 Free Shipping on orders above AED 200&#10;⚡ New Arrival: Mijing iRepair MS1&#10;🚚 Same Day Delivery in Dubai" />
            </Field>
            <div className="flex items-center gap-3 mt-2">
              <Switch checked={settings.promo_bar_enabled !== false} onCheckedChange={v => set("promo_bar_enabled", v)} />
              <Label className="text-sm">Show promotional header marquee</Label>
            </div>
          </SectionCard>

          <SectionCard title="Homepage Sections" icon={Palette}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="New Arrivals Title">
                <Input value={settings.new_arrivals_title} onChange={e => set("new_arrivals_title", e.target.value)} />
              </Field>
              <Field label="New Arrivals Typing Subtitles" hint="Enter one subtitle per line. These will animate with a typewriter effect.">
                <Textarea rows={4} value={settings.new_arrivals_subtitle} onChange={e => set("new_arrivals_subtitle", e.target.value)} placeholder="✨ The latest tools and equipment ✨&#10;🔥 Premium quality for professionals 🔥" />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Hero Banner Slider" icon={Palette}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Homepage Slider Images</Label>
                  <p className="text-xs text-muted-foreground">Manage the big promotional banner images.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const newSlides = [...(settings.hero_slides || [])];
                  newSlides.push({ category: "New Category", label: "NEW ITEM", tagline: "Description", link: "/shop", accent: "#00a854", images: [""] });
                  set("hero_slides", newSlides);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Slide
                </Button>
              </div>

              <div className="space-y-4">
                {(settings.hero_slides || []).map((slide, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg bg-secondary/20 relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        const newSlides = [...settings.hero_slides];
                        newSlides.splice(i, 1);
                        set("hero_slides", newSlides);
                      }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-2 gap-3 pr-8">
                      <Field label="Title / Label">
                        <Input value={slide.label} onChange={e => {
                          const newSlides = [...settings.hero_slides];
                          newSlides[i].label = e.target.value;
                          set("hero_slides", newSlides);
                        }} />
                      </Field>
                      <Field label="Category / Top Text">
                        <Input value={slide.category} onChange={e => {
                          const newSlides = [...settings.hero_slides];
                          newSlides[i].category = e.target.value;
                          set("hero_slides", newSlides);
                        }} />
                      </Field>
                      <div className="col-span-2">
                        <Field label="Description Tagline">
                          <Input value={slide.tagline} onChange={e => {
                            const newSlides = [...settings.hero_slides];
                            newSlides[i].tagline = e.target.value;
                            set("hero_slides", newSlides);
                          }} />
                        </Field>
                      </div>
                      <Field label="Button Link">
                        <Input value={slide.link} onChange={e => {
                          const newSlides = [...settings.hero_slides];
                          newSlides[i].link = e.target.value;
                          set("hero_slides", newSlides);
                        }} />
                      </Field>
                      <Field label="Background Color (Accent)">
                        <div className="flex gap-2">
                          <input type="color" value={slide.accent} onChange={e => {
                            const newSlides = [...settings.hero_slides];
                            newSlides[i].accent = e.target.value;
                            set("hero_slides", newSlides);
                          }} className="h-9 w-12 rounded border border-border cursor-pointer bg-background" />
                          <Input value={slide.accent} onChange={e => {
                            const newSlides = [...settings.hero_slides];
                            newSlides[i].accent = e.target.value;
                            set("hero_slides", newSlides);
                          }} className="font-mono text-xs flex-1" />
                        </div>
                      </Field>
                      <div className="col-span-2">
                        <Field label="Image URLs (Up to 3)" hint="Enter image URLs separated by commas, or just one if you prefer a single image.">
                          <Input value={(slide.images || []).join(", ")} onChange={e => {
                            const newSlides = [...settings.hero_slides];
                            newSlides[i].images = e.target.value.split(",").map(url => url.trim()).filter(Boolean);
                            set("hero_slides", newSlides);
                          }} placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg" />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <SectionCard title="Search Engine Optimization" icon={Globe}>
            <Field label="Meta Title" hint="Shown in browser tab and search results (50-60 chars recommended)">
              <Input value={settings.meta_title} onChange={e => set("meta_title", e.target.value)} />
              <p className="text-[11px] text-muted-foreground text-right">{settings.meta_title.length}/60</p>
            </Field>
            <Field label="Meta Description" hint="Shown in search results (150-160 chars recommended)">
              <Textarea rows={3} value={settings.meta_description} onChange={e => set("meta_description", e.target.value)} />
              <p className="text-[11px] text-muted-foreground text-right">{settings.meta_description.length}/160</p>
            </Field>
            <Field label="Keywords (comma separated)">
              <Textarea rows={2} value={settings.meta_keywords} onChange={e => set("meta_keywords", e.target.value)} />
            </Field>
          </SectionCard>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <SectionCard title="Alert Settings" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">New Order Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified on every new order</p>
                </div>
                <Switch checked={settings.order_email_notify} onCheckedChange={v => set("order_email_notify", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">New Message Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified on contact form submissions</p>
                </div>
                <Switch checked={settings.new_message_notify} onCheckedChange={v => set("new_message_notify", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Low Stock Alerts</Label>
                  <p className="text-xs text-muted-foreground">Alert when product stock drops below threshold</p>
                </div>
                <Switch checked={settings.low_stock_alert} onCheckedChange={v => set("low_stock_alert", v)} />
              </div>
              {settings.low_stock_alert && (
                <Field label="Low Stock Threshold (units)">
                  <Input type="number" className="w-32" value={settings.low_stock_threshold} onChange={e => set("low_stock_threshold", e.target.value)} />
                </Field>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <SectionCard title="Advanced Settings" icon={Shield}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-destructive">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Show maintenance page to all visitors</p>
                </div>
                <Switch checked={settings.maintenance_mode} onCheckedChange={v => set("maintenance_mode", v)} />
              </div>

              <div className="pt-2 border-t border-border">
                <Field label="Gemini AI API Key" hint="Used for the intelligent store chatbot. Starts with AIzaSy or similar.">
                  <Input type="password" value={settings.gemini_api_key || ""} onChange={e => set("gemini_api_key", e.target.value)} placeholder="Enter Gemini API Key..." />
                </Field>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-3">Danger Zone</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Reset all settings to defaults?")) {
                        setSettings(DEFAULTS);
                        localStorage.removeItem("tsttools_settings");
                        toast.success("Settings reset to defaults");
                      }
                    }}>
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}