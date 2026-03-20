import { useEffect, useState } from "react";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Briefcase, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { formatDate } from "@/lib/utils";

const SERVICE_COLORS: Record<string, string> = {
  "WhatsApp Bot Setup":       "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Social Media Management":  "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "Website Development":      "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "SEO Optimization":         "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Telegram Bot Development": "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "E-commerce Setup":         "bg-rose-500/15 text-rose-400 border-rose-500/20",
};
const DEFAULT_COLOR = "bg-primary/10 text-primary border-primary/20";

export default function Clients() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const token = localStorage.getItem("nutterx_token");
    if (!token) return;
    fetch("/api/admin/clients", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setClients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Briefcase, label: "Total Projects", value: clients.length, color: "text-primary" },
    { icon: TrendingUp, label: "In Progress",   value: clients.filter(c => c.status === "in_progress").length, color: "text-blue-400" },
    { icon: Award,      label: "Completed",     value: clients.filter(c => c.status === "completed").length, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Activity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Client Projects</h1>
          <p className="text-muted-foreground">All active and completed work across the platform — real projects, real deadlines.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 sm:gap-5 mb-10"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 text-center"
            >
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-base">No active projects yet</p>
            <p className="text-sm mt-1 opacity-70">Projects appear here once work begins</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Started</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {clients.map((client, i) => {
                    const colorClass = SERVICE_COLORS[client.serviceName] || DEFAULT_COLOR;
                    const initials = client.user?.name
                      ? client.user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                      : "?";

                    return (
                      <motion.tr
                        key={client._id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-card hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-border flex items-center justify-center font-bold text-xs shrink-0 text-indigo-300">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate max-w-[140px]">{client.user?.name || "Client"}</div>
                              <div className="text-xs text-muted-foreground">Platform Member</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
                            {client.serviceName}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={client.status} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {client.createdAt ? formatDate(client.createdAt) : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {client.subscriptionEndsAt ? (
                            <CountdownTimer endsAt={client.subscriptionEndsAt} compact />
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5 opacity-40" /> Not set
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-3 pr-1">{clients.length} project{clients.length !== 1 ? "s" : ""} total</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
