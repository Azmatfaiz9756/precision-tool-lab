import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { CATEGORIES, getCategoryLabel } from "@/lib/constants";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Grid3X3, List, SlidersHorizontal, X, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

// Normalize: lowercase, remove spaces/hyphens/dots/underscores
const norm = (s) => (s || "").toLowerCase().replace(/[\s\-_.]/g, "");

// Smart search: handles spacing variations & partial model numbers
const smartSearch = (product, query) => {
  const q = norm(query);
  if (!q) return true;

  const fields = [
    product.name,
    product.brand,
    product.sku,
    product.description,
    ...(product.tags || []),
  ];

  const allNorm = fields.map(norm).join(" ");
  if (allNorm.includes(q)) return true;

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const allText = fields.join(" ").toLowerCase();
    if (tokens.every((tok) => allText.includes(tok))) return true;
    if (tokens.every((tok) => allNorm.includes(norm(tok)))) return true;
  }

  if (q.length >= 5) {
    const strictFields = [product.name, product.brand].filter(Boolean);
    for (const field of strictFields) {
      const words = field.toLowerCase().split(/\s+/);
      for (const word of words) {
        const nw = norm(word);
        if (nw.length < 3) continue;
        if (Math.abs(nw.length - q.length) <= 1) {
          let diff = 0;
          const minLen = Math.min(nw.length, q.length);
          for (let i = 0; i < minLen; i++) if (nw[i] !== q[i]) diff++;
          diff += Math.abs(nw.length - q.length);
          if (diff <= 1) return true;
        }
      }
    }
  }

  return false;
};

export default function Shop() {
  const location = useLocation();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedToolTypes, setSelectedToolTypes] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [viewMode, setViewMode] = useState("grid");
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);

  // Sync state whenever URL/location changes (navbar search, category links)
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const cat = p.get("category");
    if (cat && cat !== "all") {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }
    setSearchQuery(p.get("search") || "");
    setCurrentPage(1);
  }, [location.search]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.entities.Product.list("-created_date", 5000),
    initialData: [],
  });

  const activeProducts = useMemo(() => {
    return products.filter(p => p.is_active !== false);
  }, [products]);

  // Extract unique brands dynamically
  const uniqueBrands = useMemo(() => {
    const brandsMap = {};
    for (const p of activeProducts) {
      if (p.brand) {
        brandsMap[p.brand] = (brandsMap[p.brand] || 0) + 1;
      }
    }
    return Object.entries(brandsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [activeProducts]);

  // Extract unique tool types dynamically
  const uniqueToolTypes = useMemo(() => {
    const typesMap = {};
    for (const p of activeProducts) {
      if (p.tool_type) {
        typesMap[p.tool_type] = (typesMap[p.tool_type] || 0) + 1;
      }
    }
    return Object.entries(typesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [activeProducts]);

  const toggleCategory = (key) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setCurrentPage(1);
  };

  const toggleBrand = (name) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
    setCurrentPage(1);
  };

  const toggleToolType = (name) => {
    setSelectedToolTypes((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedToolTypes([]);
    setSearchQuery("");
    setPriceRange([0, 5000]);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...activeProducts];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedToolTypes.length > 0) {
      filtered = filtered.filter((p) => selectedToolTypes.includes(p.tool_type));
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) => smartSearch(p, searchQuery.trim()));
    }

    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case "popular":
        filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategories, selectedBrands, selectedToolTypes, sortBy, searchQuery, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const displayedBrands = showAllBrands ? uniqueBrands : uniqueBrands.slice(0, 8);
  const displayedTypes = showAllTypes ? uniqueToolTypes : uniqueToolTypes.slice(0, 8);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Categories</h4>
          {(selectedCategories.length > 0) && (
            <button onClick={() => setSelectedCategories([])} className="text-xs text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => {
            const isChecked = selectedCategories.includes(cat.key);
            return (
              <label
                key={cat.key}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleCategory(cat.key)}
                />
                <span className={isChecked ? "text-foreground font-medium" : ""}>
                  {cat.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Brands</h4>
          {(selectedBrands.length > 0) && (
            <button onClick={() => setSelectedBrands([])} className="text-xs text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {displayedBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.name);
            return (
              <label
                key={brand.name}
                className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleBrand(brand.name)}
                  />
                  <span className={isChecked ? "text-foreground font-medium" : ""}>
                    {brand.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/60">({brand.count})</span>
              </label>
            );
          })}
          {uniqueBrands.length > 8 && (
            <button
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="text-xs text-primary font-medium text-left hover:underline mt-1"
            >
              {showAllBrands ? "Show Less" : `Show More (${uniqueBrands.length - 8})`}
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Tool Types</h4>
          {(selectedToolTypes.length > 0) && (
            <button onClick={() => setSelectedToolTypes([])} className="text-xs text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {displayedTypes.map((type) => {
            const isChecked = selectedToolTypes.includes(type.name);
            return (
              <label
                key={type.name}
                className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleToolType(type.name)}
                  />
                  <span className={isChecked ? "text-foreground font-medium" : ""}>
                    {type.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/60">({type.count})</span>
              </label>
            );
          })}
          {uniqueToolTypes.length > 8 && (
            <button
              onClick={() => setShowAllTypes(!showAllTypes)}
              className="text-xs text-primary font-medium text-left hover:underline mt-1"
            >
              {showAllTypes ? "Show Less" : `Show More (${uniqueToolTypes.length - 8})`}
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold mb-3">Price Range (AED)</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={5000}
          step={20}
          className="mb-2"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>AED {priceRange[0]}</span>
          <span>AED {priceRange[1]}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl">
          {selectedCategories.length === 1
            ? getCategoryLabel(selectedCategories[0])
            : "All Products"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filteredProducts.length} products found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-border/50 pr-6">
          <FilterContent />
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-secondary border-border font-body text-sm"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                setPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-28 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center gap-1 border border-border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background border-border overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filters */}
          {(selectedCategories.length > 0 ||
            selectedBrands.length > 0 ||
            selectedToolTypes.length > 0 ||
            searchQuery ||
            priceRange[0] > 0 ||
            priceRange[1] < 5000) && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {selectedCategories.map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => toggleCategory(catKey)}
                  className="inline-flex items-center gap-1 text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  Category: {getCategoryLabel(catKey)} <X className="h-3 w-3" />
                </button>
              ))}

              {selectedBrands.map((brandName) => (
                <button
                  key={brandName}
                  onClick={() => toggleBrand(brandName)}
                  className="inline-flex items-center gap-1 text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  Brand: {brandName} <X className="h-3 w-3" />
                </button>
              ))}

              {selectedToolTypes.map((typeName) => (
                <button
                  key={typeName}
                  onClick={() => toggleToolType(typeName)}
                  className="inline-flex items-center gap-1 text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  Type: {typeName} <X className="h-3 w-3" />
                </button>
              ))}

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  Search: "{searchQuery}" <X className="h-3 w-3" />
                </button>
              )}

              {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                <button
                  onClick={() => setPriceRange([0, 5000])}
                  className="inline-flex items-center gap-1 text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  Price: AED {priceRange[0]} - {priceRange[1]} <X className="h-3 w-3" />
                </button>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs font-mono text-muted-foreground hover:text-foreground px-2.5 py-1 underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg aspect-square animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-secondary/20 rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground text-sm">No products match the selected filters</p>
              <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                {paginatedProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i < 6 ? i + 1 : totalPages;
                      } else if (currentPage >= totalPages - 3) {
                        page = i === 0 ? 1 : totalPages - 6 + i;
                      } else {
                        const pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
                        page = pages[i] || null;
                      }
                      return page ? (
                        <Button
                          key={i}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0 text-xs font-mono"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ) : (
                        <span key={i} className="text-muted-foreground text-xs px-1">
                          …
                        </span>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
                Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredProducts.length)} of{" "}
                {filteredProducts.length} products
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}