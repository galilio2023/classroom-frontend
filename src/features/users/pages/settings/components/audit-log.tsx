import React from "react";
import { useTable } from "@refinedev/core";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export const SettingsAuditLog = () => {
  const { t, i18n } = useTranslation();
  const isArr = i18n.language === "ar";

  const { result, tableQuery } = useTable<any>({
    resource: "audit-logs",
    pagination: { pageSize: 20 },
  });

  const logs = result?.data || [];
  const isLoading = tableQuery.isLoading;

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Admin
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Setting
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Change
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-end">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10 h-24 bg-muted/5" />
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-40 text-center text-muted-foreground italic uppercase text-xs tracking-widest"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 text-start">
                        <Avatar className="h-10 w-10 rounded-xl border border-background shadow-sm">
                          <AvatarImage src={log.admin?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                            {log.admin?.name?.substring(0, 2).toUpperCase() || "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground/90">
                            {log.admin?.name || "System"}
                          </span>
                          <span className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">
                            {log.ipAddress || "Internal"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-3.5 w-3.5 text-primary opacity-40" />
                        <code className="text-xs font-black bg-primary/5 text-primary px-2 py-1 rounded-md">
                          {log.settingKey}
                        </code>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs text-start">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-muted-foreground font-bold uppercase tracking-tight w-10 shrink-0">
                            Old:
                          </span>
                          <span className="font-mono text-muted-foreground/60 truncate">
                            {JSON.stringify(log.oldValue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-green-600 font-bold uppercase tracking-tight w-10 shrink-0">
                            New:
                          </span>
                          <span className="font-mono text-foreground font-bold truncate">
                            {JSON.stringify(log.newValue)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-foreground/80">
                          {format(new Date(log.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                          {format(new Date(log.createdAt), "h:mm:ss a")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
