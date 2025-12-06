import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, DollarSign, Clock, User, Wallet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Project {
  id: string;
  client_id: string;
  provider_id: string;
  client_name: string;
  client_type: string;
  project_title: string;
  project_details: string;
  budget_type: string;
  delivery_time_unit: string;
  delivery_time_value: number;
  advance_percentage: number;
  final_percentage: number;
  final_budget: number | null;
  status: string;
  advance_paid: boolean;
  final_paid: boolean;
  submission_files: string[] | null;
  provider_payment_method: string | null;
  provider_payment_id: string | null;
  provider_payment_requested: boolean;
  provider_payment_status: string | null;
  admin_approved: boolean;
  created_at: string;
  client?: { name: string | null; email: string | null };
  provider?: { name: string | null; email: string | null };
}

export default function AdminProjectOrders() {
  useAdminAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadProjects();
    
    const channel = supabase
      .channel('admin-projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        loadProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user details
      const projectsWithUsers = await Promise.all(
        (data || []).map(async (project) => {
          const [{ data: client }, { data: provider }] = await Promise.all([
            supabase.from("profiles").select("name, email").eq("user_id", project.client_id).single(),
            supabase.from("profiles").select("name, email").eq("user_id", project.provider_id).single()
          ]);
          return { ...project, client, provider };
        })
      );

      setProjects(projectsWithUsers);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayment = async (projectId: string, type: 'advance' | 'final', project: Project) => {
    try {
      const updateData: any = {};
      
      if (type === 'advance') {
        updateData.admin_approved = true;
      } else {
        updateData.status = 'completed';
      }

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", projectId);

      if (error) throw error;

      // Send email notifications when admin approves final payment
      if (type === 'final') {
        // Notify client
        if (project.client?.email) {
          await supabase.functions.invoke('send-project-status-email', {
            body: {
              recipientEmail: project.client.email,
              recipientName: project.client.name || 'Client',
              projectTitle: project.project_title,
              status: 'admin_approved',
              projectId: project.id,
              amount: project.final_budget
            }
          });
        }

        // Notify provider
        if (project.provider?.email) {
          await supabase.functions.invoke('send-project-status-email', {
            body: {
              recipientEmail: project.provider.email,
              recipientName: project.provider.name || 'Provider',
              projectTitle: project.project_title,
              status: 'completed',
              projectId: project.id,
              amount: project.final_budget
            }
          });
        }
      }

      toast.success(`${type === 'advance' ? 'Advance' : 'Final'} payment approved!`);
      loadProjects();
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    }
  };

  const handleMarkProviderPaid = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          provider_payment_status: 'paid'
        })
        .eq("id", projectId);

      if (error) throw error;
      toast.success("Provider marked as paid!");
      loadProjects();
    } catch (error) {
      console.error("Error marking provider paid:", error);
      toast.error("Failed to update payment status");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      accepted: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      in_progress: "bg-blue-500/20 text-blue-400",
      submitted: "bg-purple-500/20 text-purple-400",
      completed: "bg-primary/20 text-primary"
    };
    return <Badge className={styles[status] || "bg-muted"}>{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const calculatePayments = (project: Project) => {
    if (!project.final_budget) return { advance: 0, final: 0, adminFee: 0, providerAmount: 0 };
    
    const advance = (project.final_budget * project.advance_percentage) / 100;
    const final = (project.final_budget * project.final_percentage) / 100;
    const total = project.final_budget;
    const adminFee = total * 0.05; // 5% admin fee
    const providerAmount = total - adminFee;
    
    return { advance, final, adminFee, providerAmount, total };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <p className="text-muted-foreground">No project orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => {
              const payments = calculatePayments(project);
              
              return (
                <motion.div
                  key={project.id}
                  className="glass-card p-4 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{project.project_title}</h3>
                        {getStatusBadge(project.status)}
                        {project.admin_approved && (
                          <Badge className="bg-green-500/20 text-green-400">Admin Approved</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Client: {project.client?.name || project.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span>Provider: {project.provider?.name || "Unknown"}</span>
                        </div>
                      </div>

                      {project.final_budget && (
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Total: ${payments.total?.toFixed(2)}
                          </span>
                          <span className={project.advance_paid ? "text-green-400" : "text-yellow-400"}>
                            Advance ({project.advance_percentage}%): ${payments.advance.toFixed(2)}
                            {project.advance_paid ? " ✓" : " Pending"}
                          </span>
                          <span className={project.final_paid ? "text-green-400" : "text-muted-foreground"}>
                            Final ({project.final_percentage}%): ${payments.final.toFixed(2)}
                            {project.final_paid ? " ✓" : ""}
                          </span>
                        </div>
                      )}

                {project.status === 'completed' && project.final_budget && (
                        <div className="glass-card p-2 rounded-lg text-sm">
                          <span className="text-primary">Admin Fee (5%): ${payments.adminFee?.toFixed(2)}</span>
                          {" | "}
                          <span className="text-green-400">Provider Amount: ${payments.providerAmount?.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Provider Payment Request Status */}
                      {project.provider_payment_requested && (
                        <div className="glass-card p-2 rounded-lg text-sm">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <span className="text-yellow-400 flex items-center gap-1">
                                <Wallet className="w-4 h-4" />
                                Payment Requested via {project.provider_payment_method}
                              </span>
                              <span className="text-muted-foreground ml-5">ID: {project.provider_payment_id}</span>
                            </div>
                            {project.provider_payment_status === 'paid' ? (
                              <Badge className="bg-green-500/20 text-green-400 gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => handleMarkProviderPaid(project.id)}
                                size="sm"
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                                Mark as Paid
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <Button
                        onClick={() => { setSelectedProject(project); setShowDetails(true); }}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      
                      {project.advance_paid && !project.admin_approved && (
                        <Button
                          onClick={() => handleApprovePayment(project.id, 'advance', project)}
                          size="sm"
                          className="gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Approve Advance
                        </Button>
                      )}
                      
                      {project.status === 'submitted' && project.final_paid && (
                        <Button
                          onClick={() => handleApprovePayment(project.id, 'final', project)}
                          size="sm"
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                          Complete & Pay Provider
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Project Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="glass-premium max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Project Title</Label>
                    <p className="font-semibold">{selectedProject.project_title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div>{getStatusBadge(selectedProject.status)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Project Details</Label>
                  <p className="text-sm">{selectedProject.project_details}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Client</Label>
                    <p>{selectedProject.client?.name || selectedProject.client_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedProject.client?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Provider</Label>
                    <p>{selectedProject.provider?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{selectedProject.provider?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Budget Type</Label>
                    <p>{selectedProject.budget_type === 'high' ? 'High Budget' : 'Low Budget'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Final Budget</Label>
                    <p className="text-primary font-bold">
                      ${selectedProject.final_budget?.toFixed(2) || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Delivery Time</Label>
                    <p>{selectedProject.delivery_time_value} {selectedProject.delivery_time_unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Advance Payment</Label>
                    <p>{selectedProject.advance_percentage}% - {selectedProject.advance_paid ? "Paid ✓" : "Pending"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Final Payment</Label>
                    <p>{selectedProject.final_percentage}% - {selectedProject.final_paid ? "Paid ✓" : "Pending"}</p>
                  </div>
                </div>

                {selectedProject.provider_payment_method && (
                  <div className="glass-card p-3 rounded-lg">
                    <Label className="text-muted-foreground">Provider Payment Info</Label>
                    <p>Method: {selectedProject.provider_payment_method}</p>
                    <p>ID: {selectedProject.provider_payment_id}</p>
                    <p>Status: {selectedProject.provider_payment_status || 'Pending'}</p>
                  </div>
                )}

                {selectedProject.submission_files && selectedProject.submission_files.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Submission Files</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProject.submission_files.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline text-sm"
                        >
                          File {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}