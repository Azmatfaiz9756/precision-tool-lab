import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [selectedMsg, setSelectedMsg] = useState(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => apiClient.entities.ContactMessage.list("-created_date"),
  });

  const openMessage = async (msg) => {
    setSelectedMsg(msg);
    if (!msg.is_read) {
      await apiClient.entities.ContactMessage.update(msg.id, { is_read: true });
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    }
  };

  const deleteMessage = async (id) => {
    await apiClient.entities.ContactMessage.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    setSelectedMsg(null);
    toast.success("Message deleted");
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <p className="text-sm text-muted-foreground">{messages.length} messages</p>
        {unread > 0 && <Badge className="bg-destructive text-destructive-foreground text-[11px]">{unread} unread</Badge>}
      </div>

      <div className="bg-background border border-border rounded-lg divide-y divide-border">
        {messages.length === 0 && (
          <div className="text-center py-16"><Mail className="h-10 w-10 text-muted mx-auto mb-2" /><p className="text-muted-foreground text-sm">No messages yet</p></div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors ${!msg.is_read ? "bg-primary/5" : ""}`} onClick={() => openMessage(msg)}>
            <div className="flex-shrink-0">
              {msg.is_read ? <MailOpen className="h-5 w-5 text-muted-foreground" /> : <Mail className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-sm font-medium ${!msg.is_read ? "font-bold" : ""}`}>{msg.name}</span>
                <span className="text-xs text-muted-foreground">{msg.email}</span>
              </div>
              <p className={`text-sm ${!msg.is_read ? "" : "text-muted-foreground"} line-clamp-1`}>{msg.subject || msg.message}</p>
            </div>
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {new Date(msg.created_date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="bg-background max-w-lg">
          <DialogHeader><DialogTitle>{selectedMsg?.subject || "Message"}</DialogTitle></DialogHeader>
          {selectedMsg && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="font-semibold">From:</span> {selectedMsg.name}</div>
                <div><span className="font-semibold">Email:</span> {selectedMsg.email}</div>
                {selectedMsg.phone && <div><span className="font-semibold">Phone:</span> {selectedMsg.phone}</div>}
                <div><span className="font-semibold">Date:</span> {new Date(selectedMsg.created_date).toLocaleString()}</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed">{selectedMsg.message}</div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject || "Your message"}`, "_blank")}>
                  Reply via Email
                </Button>
                {selectedMsg.phone && (
                  <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/${selectedMsg.phone.replace(/\D/g, "")}`, "_blank")}>
                    WhatsApp
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={() => deleteMessage(selectedMsg.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}