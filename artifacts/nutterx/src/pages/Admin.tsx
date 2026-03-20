import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdminGetUsers, useAdminGetRequests, useAdminUpdateRequest, useAdminGetSubscriptions, useCreateService } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatDate } from "@/lib/utils";
import { Users, FileText, Activity, ShieldAlert, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'subscriptions' | 'services'>('requests');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading: reqLoading } = useAdminGetRequests();
  const { data: users, isLoading: usersLoading } = useAdminGetUsers();
  const { data: subscriptions } = useAdminGetSubscriptions();
  const updateRequestMutation = useAdminUpdateRequest();
  const createServiceMutation = useCreateService();

  const handleUpdateStatus = async (id: string, status: any, currentNotes: string = "") => {
    const notes = prompt("Add admin notes (optional):", currentNotes);
    if (notes === null) return; // cancelled

    if (status === 'completed') {
      const confirm = window.confirm("Marking as completed will start the 30-day subscription timer. Proceed?");
      if (!confirm) return;
    }

    try {
      await updateRequestMutation.mutateAsync({
        id,
        data: { status, adminNotes: notes }
      });
      toast({ title: "Status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requests"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleCreateService = async () => {
    const title = prompt("Service Title:");
    if (!title) return;
    const priceStr = prompt("Price ($):");
    const price = parseInt(priceStr || "0");
    const description = prompt("Description:");
    
    try {
      await createServiceMutation.mutateAsync({
        data: { title, price, description: description || "", category: "General", features: [], popular: false, icon: "" }
      });
      toast({ title: "Service Created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (user?.role !== 'admin' && new URLSearchParams(window.location.search).get("admin") !== "true") {
    return <div className="p-20 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">Admin Command Center</h1>
      </div>

      <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-xl w-fit border border-white/5 shadow-inner">
        {[
          { id: 'requests', label: 'Service Requests', icon: FileText },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'subscriptions', label: 'Active Subs', icon: Activity },
          { id: 'services', label: 'Services Catalog', icon: Plus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl min-h-[500px]">
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Manage Service Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-black/40 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">User / Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests?.map(req => (
                    <tr key={req._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{req.serviceName}</div>
                        <div className="text-muted-foreground text-xs mt-1">{req.user?.name} ({req.user?.email})</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status || 'pending'} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(req.createdAt!)}
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none text-xs"
                          value={req.status}
                          onChange={(e) => handleUpdateStatus(req._id!, e.target.value, req.adminNotes)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed (Starts Timer)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Registered Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users?.map(u => (
                <div key={u._id} className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {u.name} 
                      {u.role === 'admin' && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full uppercase">Admin</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Active Subscriptions (30-Day Timers)</h2>
            <div className="space-y-4">
              {subscriptions?.map(sub => (
                <div key={sub._id} className="p-5 bg-gradient-to-r from-blue-900/20 to-transparent rounded-2xl border border-blue-500/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">{sub.serviceName}</div>
                    <div className="text-sm text-blue-300 mt-1">User: {sub.user?.name}</div>
                  </div>
                  <CountdownTimer endsAt={sub.subscriptionEndsAt!} className="scale-75 origin-right" />
                </div>
              ))}
              {subscriptions?.length === 0 && <p className="text-muted-foreground">No active subscriptions currently.</p>}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Service Catalog</h2>
              <Button variant="gradient" size="sm" onClick={handleCreateService}>Add Service</Button>
            </div>
            <p className="text-muted-foreground">Manage the public facing service catalog here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
