import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatPrice } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { code: "", discount_type: "percentage", discount_value: "", min_order_amount: 0, max_uses: 0, is_active: true, expires_at: "" };

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [editCoupon, setEditCoupon] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => apiClient.entities.Coupon.list("-created_date"),
  });

  const openNew = () => { setEditCoupon({ ...EMPTY }); setShowDialog(true); };
  const openEdit = (c) => { setEditCoupon({ ...c }); setShowDialog(true); };

  const save = async () => {
    if (!editCoupon.code || !editCoupon.discount_value) { toast.error("Code and discount are required"); return; }
    setSaving(true);
    const data = { ...editCoupon, discount_value: Number(editCoupon.discount_value), min_order_amount: Number(editCoupon.min_order_amount) || 0, max_uses: Number(editCoupon.max_uses) || 0, code: editCoupon.code.toUpperCase() };
    if (editCoupon.id) {
      await apiClient.entities.Coupon.update(editCoupon.id, data);
      toast.success("Coupon updated");
    } else {
      await apiClient.entities.Coupon.create(data);
      toast.success("Coupon created");
    }
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    setShowDialog(false);
    setSaving(false);
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await apiClient.entities.Coupon.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    toast.success("Coupon deleted");
  };

  const toggleActive = async (coupon) => {
    await apiClient.entities.Coupon.update(coupon.id, { is_active: !coupon.is_active });
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
        <Button onClick={openNew} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Coupon
        </Button>
      </div>

      <div className="grid gap-3">
        {coupons.length === 0 && <div className="text-center py-16 bg-background border border-border rounded-lg"><Tag className="h-10 w-10 text-muted mx-auto mb-2" /><p className="text-muted-foreground text-sm">No coupons yet</p></div>}
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-background border border-border rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-primary text-sm">{coupon.code}</span>
                <Badge variant={coupon.is_active ? "default" : "secondary"} className={coupon.is_active ? "bg-green-100 text-green-700 border-green-200" : ""}>
                  {coupon.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `AED ${coupon.discount_value} off`}
                {coupon.min_order_amount > 0 && ` · Min. order ${formatPrice(coupon.min_order_amount)}`}
                {coupon.expires_at && ` · Expires ${new Date(coupon.expires_at).toLocaleDateString()}`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Used {coupon.used_count || 0} times{coupon.max_uses > 0 ? ` / ${coupon.max_uses}` : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!coupon.is_active} onCheckedChange={() => toggleActive(coupon)} />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(coupon)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteCoupon(coupon.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-background">
          <DialogHeader><DialogTitle>{editCoupon?.id ? "Edit Coupon" : "Add Coupon"}</DialogTitle></DialogHeader>
          {editCoupon && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-mono">Coupon Code *</Label>
                <Input value={editCoupon.code} onChange={e => setEditCoupon({...editCoupon, code: e.target.value.toUpperCase()})} placeholder="WELCOME10" className="font-mono uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Discount Type</Label>
                <Select value={editCoupon.discount_type} onValueChange={v => setEditCoupon({...editCoupon, discount_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed (AED)</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Discount Value *</Label>
                <Input type="number" value={editCoupon.discount_value} onChange={e => setEditCoupon({...editCoupon, discount_value: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Min. Order (AED)</Label>
                <Input type="number" value={editCoupon.min_order_amount || ""} onChange={e => setEditCoupon({...editCoupon, min_order_amount: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono">Max Uses (0 = unlimited)</Label>
                <Input type="number" value={editCoupon.max_uses || ""} onChange={e => setEditCoupon({...editCoupon, max_uses: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-mono">Expires At</Label>
                <Input type="date" value={editCoupon.expires_at || ""} onChange={e => setEditCoupon({...editCoupon, expires_at: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!editCoupon.is_active} onCheckedChange={v => setEditCoupon({...editCoupon, is_active: v})} />
                <Label className="text-sm">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}