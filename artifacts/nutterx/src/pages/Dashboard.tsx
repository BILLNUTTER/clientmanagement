import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyRequests, useGetServices, useCreateRequest } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatDate } from "@/lib/utils";
import { Plus, LayoutDashboard, Search, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useGetMyRequests();
  const { data: services } = useGetServices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createRequest = useCreateRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch } = useForm();
  const selectedServiceId = watch('serviceId');

  const onSubmit = async (data: any) => {
    try {
      const selectedService = services?.find(s => s._id === data.serviceId);
      if (!selectedService && !data.customServiceName) {
        toast({ variant: "destructive", title: "Select a service or enter custom name" });
        return;
      }
      
      await createRequest.mutateAsync({
        data: {
          serviceId: data.serviceId !== 'custom' ? data.serviceId : undefined,
          serviceName: data.serviceId !== 'custom' ? selectedService?.title : data.customServiceName,
          description: data.description,
          requirements: data.requirements || ""
        }
      });
      
      toast({ title: "Request Submitted!" });
      setIsModalOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error submitting request", description: err.message });
    }
  };

  const activeSubscriptions = requests?.filter(r => r.status === 'completed' && r.subscriptionEndsAt && new Date(r.subscriptionEndsAt) > new Date()) || [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Manage your services and track progress.</p>
        </div>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Request Service
        </Button>
      </div>

      {activeSubscriptions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" /> Active Subscriptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSubscriptions.map(sub => (
              <motion.div key={sub._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
                <h3 className="font-bold text-lg mb-4">{sub.serviceName}</h3>
                <CountdownTimer endsAt={sub.subscriptionEndsAt!} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" /> My Requests
          </h2>
        </div>
        
        <div className="p-0">
          {isLoading ? (
            <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : requests?.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-lg">No service requests yet.</p>
              <Button variant="link" onClick={() => setIsModalOpen(true)} className="mt-2">Create your first request</Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests?.map(req => (
                <div key={req._id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{req.serviceName}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1 max-w-xl">{req.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Requested on {formatDate(req.createdAt!)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {req.adminNotes && (
                      <span className="text-xs italic text-blue-400 max-w-[200px] hidden md:block truncate">
                        " {req.adminNotes} "
                      </span>
                    )}
                    <StatusBadge status={req.status || 'pending'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-3xl w-full max-w-xl relative shadow-2xl shadow-black/50 border border-white/10 bg-[#0c1222]"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-white">✕</button>
            <h2 className="text-2xl font-bold mb-6">Request a Service</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Select Service</label>
                <select 
                  className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-white focus:outline-none focus:border-primary/50"
                  {...register('serviceId', { required: true })}
                >
                  <option value="">-- Choose a package --</option>
                  {services?.map(s => (
                    <option key={s._id} value={s._id}>{s.title} (${s.price})</option>
                  ))}
                  <option value="custom">Other / Custom Request</option>
                </select>
              </div>

              {selectedServiceId === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">Service Name</label>
                  <input 
                    type="text"
                    className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-white"
                    placeholder="E.g., Custom React App"
                    {...register('customServiceName', { required: selectedServiceId === 'custom' })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Project Description</label>
                <textarea 
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-white min-h-[120px] focus:outline-none focus:border-primary/50"
                  placeholder="Describe what you need in detail..."
                  {...register('description', { required: true })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" disabled={createRequest.isPending}>
                  {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
