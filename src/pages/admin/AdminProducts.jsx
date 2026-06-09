import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice, CATEGORIES, getCategoryLabel } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Star, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { handleProductImageError } from "@/lib/utils";

const EMPTY_PRODUCT = {
  name: "", slug: "", description: "", long_description: "", price: "", original_price: "",
  category: "", brand: "", sku: "", images: [], features: [], whats_included: [],
  stock_quantity: 0, is_bestseller: false, is_featured: false, is_active: true, average_rating: 0, review_count: 0, tags: []
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const [editProduct, setEditProduct] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiClient.entities.Product.list("-created_date"),
  });

  const brands = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.brand) set.add(p.brand); });
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchBrand = brandFilter === "all" || p.brand === brandFilter;
      return matchSearch && matchCategory && matchBrand;
    });
  }, [products, search, categoryFilter, brandFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * perPage, page * perPage);
  }, [filtered, page]);

  const openNew = () => { setEditProduct({ ...EMPTY_PRODUCT }); setShowDialog(true); };
  const openEdit = (p) => { setEditProduct({ ...p }); setShowDialog(true); };

  const save = async () => {
    if (!editProduct.name || !editProduct.price || !editProduct.category) {
      toast.error("Name, price and category are required"); return;
    }
    setSaving(true);
    const data = {
      ...editProduct,
      price: Number(editProduct.price),
      original_price: editProduct.original_price ? Number(editProduct.original_price) : undefined,
      stock_quantity: Number(editProduct.stock_quantity) || 0,
      images: typeof editProduct.images === "string" ? editProduct.images.split("\n").map(s => s.trim()).filter(Boolean) : editProduct.images,
      features: typeof editProduct.features === "string" ? editProduct.features.split("\n").map(s => s.trim()).filter(Boolean) : editProduct.features,
      whats_included: typeof editProduct.whats_included === "string" ? editProduct.whats_included.split("\n").map(s => s.trim()).filter(Boolean) : editProduct.whats_included,
      tags: typeof editProduct.tags === "string" ? editProduct.tags.split(",").map(s => s.trim()).filter(Boolean) : editProduct.tags,
    };
    if (editProduct.id) {
      await apiClient.entities.Product.update(editProduct.id, data);
      toast.success("Product updated");
    } else {
      await apiClient.entities.Product.create(data);
      toast.success("Product created");
    }
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    setShowDialog(false);
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await apiClient.entities.Product.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    toast.success("Product deleted");
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-mono">{label}</Label>
      {children}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 bg-background" />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48 bg-background">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
        <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48 bg-background">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground font-mono">{filtered.length} products found</span>

        <Button onClick={openNew} className="bg-primary text-primary-foreground ml-auto">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Rating</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : paginated.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-9 h-9 rounded object-cover bg-muted" onError={handleProductImageError} />
                    ) : (
                      <div className="w-9 h-9 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                    <div>
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sku || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="secondary" className="text-[11px]">{getCategoryLabel(p.category)}</Badge>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-primary">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-mono ${(p.stock_quantity || 0) < 5 ? "text-destructive font-bold" : ""}`}>{p.stock_quantity || 0}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={p.is_active !== false}
                      onCheckedChange={async (checked) => {
                        try {
                          await apiClient.entities.Product.update(p.id, { is_active: checked });
                          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
                          queryClient.invalidateQueries({ queryKey: ["products"] });
                          toast.success(`Product ${checked ? "enabled" : "disabled"}`);
                        } catch (err) {
                          toast.error("Failed to update status");
                        }
                      }}
                    />
                    <span className="text-xs font-mono hidden md:inline">{p.is_active !== false ? "Active" : "Inactive"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-primary fill-primary" />
                    <span className="text-xs font-mono">{p.average_rating || 0}</span>
                    <span className="text-xs text-muted-foreground">({p.review_count || 0})</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteProduct(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-10">No products found</p>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 flex-wrap gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length} products
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-xs font-mono px-2">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>{editProduct?.id ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <Field label="Name *"><Input value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} /></Field>
              <Field label="SKU"><Input value={editProduct.sku || ""} onChange={e => setEditProduct({...editProduct, sku: e.target.value})} /></Field>
              <Field label="Brand"><Input value={editProduct.brand || ""} onChange={e => setEditProduct({...editProduct, brand: e.target.value})} /></Field>
              <Field label="Category *">
                <Select value={editProduct.category} onValueChange={v => setEditProduct({...editProduct, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Price (AED) *"><Input type="number" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})} /></Field>
              <Field label="Original Price (AED)"><Input type="number" value={editProduct.original_price || ""} onChange={e => setEditProduct({...editProduct, original_price: e.target.value})} /></Field>
              <Field label="Stock Quantity"><Input type="number" value={editProduct.stock_quantity} onChange={e => setEditProduct({...editProduct, stock_quantity: e.target.value})} /></Field>
              <Field label="Average Rating"><Input type="number" step="0.1" max="5" value={editProduct.average_rating || ""} onChange={e => setEditProduct({...editProduct, average_rating: e.target.value})} /></Field>
              <div className="sm:col-span-2">
                <Field label="Short Description"><Textarea rows={2} value={editProduct.description || ""} onChange={e => setEditProduct({...editProduct, description: e.target.value})} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Image URLs (one per line)"><Textarea rows={3} value={Array.isArray(editProduct.images) ? editProduct.images.join("\n") : editProduct.images || ""} onChange={e => setEditProduct({...editProduct, images: e.target.value})} placeholder="https://..." /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Features (one per line)"><Textarea rows={3} value={Array.isArray(editProduct.features) ? editProduct.features.join("\n") : editProduct.features || ""} onChange={e => setEditProduct({...editProduct, features: e.target.value})} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="What's Included (one per line)"><Textarea rows={3} value={Array.isArray(editProduct.whats_included) ? editProduct.whats_included.join("\n") : editProduct.whats_included || ""} onChange={e => setEditProduct({...editProduct, whats_included: e.target.value})} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Tags (comma separated)"><Input value={Array.isArray(editProduct.tags) ? editProduct.tags.join(", ") : editProduct.tags || ""} onChange={e => setEditProduct({...editProduct, tags: e.target.value})} /></Field>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!editProduct.is_bestseller} onCheckedChange={v => setEditProduct({...editProduct, is_bestseller: v})} />
                <Label className="text-sm">Bestseller</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!editProduct.is_featured} onCheckedChange={v => setEditProduct({...editProduct, is_featured: v})} />
                <Label className="text-sm">Featured</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editProduct.is_active !== false} onCheckedChange={v => setEditProduct({...editProduct, is_active: v})} />
                <Label className="text-sm">Active / Enabled</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}