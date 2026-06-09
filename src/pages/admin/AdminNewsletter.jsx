import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Mail, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

export default function AdminNewsletter() {
  const queryClient = useQueryClient();

  const { data: subscribers = [] } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: () => apiClient.entities.Newsletter.list("-created_date"),
  });

  const deleteSubscriber = async (id) => {
    await apiClient.entities.Newsletter.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
    toast.success("Subscriber removed");
  };

  const exportCSV = () => {
    const csv = "Email,Date\n" + subscribers.map(s => `${s.email},${new Date(s.created_date).toLocaleDateString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{subscribers.length} subscribers</p>
        {subscribers.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
        )}
      </div>

      <div className="bg-background border border-border rounded-lg divide-y divide-border">
        {subscribers.length === 0 && (
          <div className="text-center py-16"><Mail className="h-10 w-10 text-muted mx-auto mb-2" /><p className="text-muted-foreground text-sm">No subscribers yet</p></div>
        )}
        {subscribers.map(sub => (
          <div key={sub.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{sub.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{new Date(sub.created_date).toLocaleDateString()}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSubscriber(sub.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}