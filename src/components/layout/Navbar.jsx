import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, LayoutGrid, BarChart2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES, formatPrice } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/utils";
import { toast } from "sonner";

export default function Navbar() {
  const settings = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Dubai");

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiClient.entities.CartItem.list(),
    initialData: [],
  });

  const { data: newArrivals = [] } = useQuery({
    queryKey: ["navbar-new-arrivals"],
    queryFn: () => apiClient.entities.Product.list("-created_date", 3),
    initialData: [],
  });

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const getMarqueeItems = () => {
    const textLines = (settings.promo_bar_text || "").split(/\n|\|/).map(s => s.trim()).filter(Boolean);
    const productLines = newArrivals.map(p => `✨ New Arrival: ${p.name} - ${formatPrice(p.price)}`);
    const combined = [...textLines, ...productLines];
    if (combined.length === 0) return ["Welcome to TSTTOOLS!"];
    return combined;
  };
  const marqueeItems = getMarqueeItems();
  const displayMarquee = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

  const PHRASES = [
    "Search tools, kits, equipment...",
    "Makita power drills...",
    "Stanley hand tools...",
    "Dewalt professional kits...",
    "Bosch angle grinders...",
    "Heavy duty machinery..."
  ];

  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex];
    let typingSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && placeholderText === currentPhrase) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && placeholderText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      return;
    }

    const timeout = setTimeout(() => {
      setPlaceholderText((prev) => 
        isDeleting ? prev.slice(0, -1) : currentPhrase.slice(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, phraseIndex]);

  const [taglineText, setTaglineText] = useState("");
  const [isTaglineDeleting, setIsTaglineDeleting] = useState(false);

  useEffect(() => {
    const fullText = settings.store_tagline || "Your precision tool partner";
    let typingSpeed = isTaglineDeleting ? 40 : 100;

    if (!isTaglineDeleting && taglineText === fullText) {
      const timeout = setTimeout(() => setIsTaglineDeleting(true), 3000);
      return () => clearTimeout(timeout);
    }

    if (isTaglineDeleting && taglineText === "") {
      setIsTaglineDeleting(false);
      const timeout = setTimeout(() => {}, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setTaglineText((prev) => 
        isTaglineDeleting ? prev.slice(0, -1) : fullText.slice(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [taglineText, isTaglineDeleting, settings.store_tagline]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      {settings.promo_bar_enabled && (
        <div className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-blue-500/10 to-primary/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-[11px] text-muted-foreground font-mono">
            {/* Scrolling Marquee */}
            <div className="flex-1 overflow-hidden relative flex items-center">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-6 py-1.5 px-4 hover:[animation-play-state:paused]">
                {displayMarquee.map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-foreground font-semibold uppercase tracking-wider text-[12px] sm:text-[11px]">
                    {item.includes("🔥") ? <span className="text-orange-500">{item}</span> : 
                     item.includes("🚚") ? <span className="text-blue-500">{item}</span> :
                     item.includes("⚡") || item.includes("✨") ? <span className="text-primary">{item}</span> :
                     <span className="text-foreground/90">{item}</span>}
                    {i < displayMarquee.length - 1 && <span className="text-primary/40 mx-1">•</span>}
                  </span>
                ))}
              </div>
            </div>
            {/* Right Tools */}
            <div className="flex items-center gap-2 sm:gap-3 bg-background/90 backdrop-blur px-3 py-1.5 shrink-0 z-10 border-l border-border/50 shadow-sm relative shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)]">
              <div className="relative">
                <button 
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center hover:opacity-90 transition-opacity bg-[#00a854] text-white px-2 sm:px-2.5 py-1 rounded-full border border-white/20 shadow-inner w-[45px] sm:w-[95px] overflow-hidden justify-between"
                  title="Select your delivery city"
                >
                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white shrink-0" />
                  <span className="hidden sm:block text-[11px] font-medium truncate px-1 text-left flex-1">{selectedCity}</span>
                  <span className="block sm:hidden text-[9px] font-bold tracking-wider">{selectedCity.substring(0,3).toUpperCase()}</span>
                  <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-80 hidden sm:block" />
                </button>
                {showCityDropdown && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowCityDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1.5 bg-card border border-border shadow-xl rounded-lg py-1 w-32 z-[110] text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                      {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map(city => (
                        <button 
                          key={city}
                          className={`w-full text-left px-3 py-2 hover:bg-[#00a854]/10 transition-colors ${selectedCity === city ? 'text-[#00a854] font-bold' : 'text-foreground'}`}
                          onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <span className="hidden sm:block font-semibold">AED Prices · UAE Market</span>
            </div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left side: Hamburger, Logo, Categories button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile/Desktop Hamburger menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5.5 w-5.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background border-border w-80">
                <nav className="flex flex-col gap-1 mt-8">
                  <Link to="/" className="px-4 py-3 text-sm font-medium hover:text-[#00a854] transition-colors">Home</Link>
                  <Link to="/shop" className="px-4 py-3 text-sm font-medium hover:text-[#00a854] transition-colors">Shop All</Link>
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.key} to={`/shop?category=${cat.key}`} className="px-4 py-3 text-sm text-muted-foreground hover:text-[#00a854] transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-2" />
                  <Link to="/about" className="px-4 py-3 text-sm text-muted-foreground hover:text-[#00a854] transition-colors">About Us</Link>
                  <Link to="/contact" className="px-4 py-3 text-sm text-muted-foreground hover:text-[#00a854] transition-colors">Contact</Link>
                  <Link to="/faq" className="px-4 py-3 text-sm text-muted-foreground hover:text-[#00a854] transition-colors">FAQ</Link>
                  {user?.role === "admin" && (
                    <Link to="/admin" className="px-4 py-3 text-sm font-bold text-[#00a854] hover:text-[#009247] transition-colors">Admin Dashboard</Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Unique Design Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00a854] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 4h14v3h-5.5v13h-3V7H5V4z" />
                  <path d="M14.5 13.5l3.5 3.5-1.5 1.5-3.5-3.5z" />
                </svg>
              </div>
              <div className="flex flex-col leading-none relative z-10 w-[90px] sm:w-[120px]">
                <span className="font-heading font-black text-lg sm:text-xl tracking-tight uppercase">
                  <span className="text-foreground">TST</span>
                  <span className="text-[#00a854]">TOOLS</span>
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 absolute top-full left-0 mt-0.5 whitespace-nowrap pointer-events-none">
                  <span className="text-[11px] sm:text-[13px] text-transparent bg-clip-text bg-gradient-to-r from-[#00a854] to-blue-500 font-[Caveat] italic font-bold tracking-wide">
                    {taglineText}
                    <span className="inline-block w-1 h-3 ml-0.5 bg-blue-500/50 animate-pulse" />
                  </span>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 animate-pulse shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
              </div>
            </Link>

            {/* Categories green button */}
            <div className="relative hidden lg:block" onMouseEnter={() => setShowCategories(true)} onMouseLeave={() => setShowCategories(false)}>
              <Button asChild className="bg-[#00a854] hover:bg-[#009247] text-white font-medium text-xs rounded h-9 px-3.5 flex items-center gap-1.5 cursor-pointer">
                <Link to="/shop">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Categories
                  <ChevronDown className="h-3 w-3 opacity-80" />
                </Link>
              </Button>
              {showCategories && (
                <div className="absolute top-full left-0 bg-card border border-border rounded-lg shadow-2xl p-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.key} to={`/shop?category=${cat.key}`} onClick={() => setShowCategories(false)}
                      className="block px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center search bar (desktop style) */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <form onSubmit={handleSearch} className="flex items-center w-full border border-border rounded bg-secondary/30 focus-within:ring-1 focus-within:ring-[#00a854] focus-within:border-[#00a854] transition-all overflow-hidden">
              <Input
                placeholder={placeholderText || "Search tools..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-9 px-3 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />
              <Button type="submit" variant="ghost" size="icon" className="h-9 w-9 rounded-none border-l border-border hover:bg-secondary text-muted-foreground/60 hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right action icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile search toggle */}
            <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9 text-muted-foreground/60 hover:text-foreground" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* WhatsApp */}
            <a href={`https://wa.me/${settings.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground/60 hover:text-[#25D366] transition-colors"
              title="Chat on WhatsApp">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.407 1.451 5.432.003 9.851-4.413 9.854-9.85.002-2.634-1.02-5.11-2.885-6.978C17.158 1.91 14.685.877 12.012.877c-5.438 0-9.86 4.417-9.864 9.855-.001 1.942.502 3.84 1.458 5.471l-.989 3.611 3.7-.971zm10.742-6.529c-.296-.149-1.75-.863-2.022-.962-.272-.099-.47-.149-.667.149-.197.297-.766.962-.94 1.16-.173.199-.347.223-.643.075-.296-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.667-1.61-.915-2.203-.241-.58-.488-.5-.667-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.75-.717 1.999-1.411.248-.695.248-1.29.173-1.411-.074-.12-.272-.198-.57-.347z"/>
              </svg>
            </a>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" onClick={() => navigate("/account?tab=wishlist")} className={`h-9 w-9 transition-colors flex ${location.search.includes('tab=wishlist') ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground/60 hover:text-red-500'}`} title="Wishlist">
              <Heart className={`h-4.5 w-4.5 transition-colors ${location.search.includes('tab=wishlist') ? 'fill-red-500 text-red-500' : 'hover:fill-red-500 hover:text-red-500'}`} />
            </Button>

            {/* Account */}
            <Button variant="ghost" size="icon" onClick={() => navigate("/account")} className="h-9 w-9 text-muted-foreground/60 hover:text-foreground" title="Account">
              <User className="h-4.5 w-4.5" />
            </Button>

            {/* Cart (Shopping Bag) */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground/60 hover:text-foreground" onClick={() => navigate("/cart")} title="Shopping Cart">
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#00a854] text-white text-[9px] font-mono font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Admin link if logged in */}
            {user?.role === "admin" && (
              <Button asChild size="sm" variant="outline" className="h-8 border-[#00a854]/30 text-[#00a854] hover:bg-[#00a854]/10 hover:text-[#00a854] font-mono text-[10px] px-2.5 ml-1 hidden lg:flex">
                <Link to="/admin">Admin</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="border-t border-border bg-background">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                autoFocus
                placeholder={placeholderText || "Search tools..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary border-border font-body"
              />
              <Button type="submit" className="bg-[#00a854] text-white hover:bg-[#009247]">Search</Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}