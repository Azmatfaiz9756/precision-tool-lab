import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, User } from "lucide-react";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiClient.entities.User.list(),
  });

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-5">{users.length} registered users</p>
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.role === "admin" ? <Crown className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="font-medium">{user.full_name || "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className={user.role === "admin" ? "bg-primary/10 text-primary" : ""}>
                    {user.role || "user"}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                  {user.created_date ? new Date(user.created_date).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && users.length === 0 && (
          <div className="text-center py-10"><Users className="h-10 w-10 text-muted mx-auto mb-2" /><p className="text-muted-foreground text-sm">No users yet</p></div>
        )}
      </div>
    </div>
  );
}