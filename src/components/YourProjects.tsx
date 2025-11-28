import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Clock, DollarSign, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ProjectChat } from "./ProjectChat";

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
  admin_approved: boolean;
  created_at: string;
  provider?: {
    name: string | null;
    avatar_url: string | null;
    category: string | null;
  };
}

interface YourProjectsProps {
  userId: string;
}

export const YourProjects = ({ userId }: YourProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
    
    // Real-time subscription
    const channel = supabase
      .channel('client-projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `client_id=eq.${userId}`
      }, () => {
        loadProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get provider details for each project
      const projectsWithProviders = await Promise.all(
        (data || []).map(async (project) => {
          const { data: provider } = await supabase
            .from("profiles")
            .select("name, avatar_url, category")
            .eq("user_id", project.provider_id)
            .single();
          return { ...project, provider };
        })
      );

      setProjects(projectsWithProviders);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const info: Record<string, { badge: string; icon: JSX.Element; text: string }> = {
      pending: {
        badge: "bg-yellow-500/20 text-yellow-400",
        icon: <Clock className="w-4 h-4" />,
        text: "Awaiting Response"
      },
      accepted: {
        badge: "bg-green-500/20 text-green-400",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Accepted"
      },
      rejected: {
        badge: "bg-red-500/20 text-red-400",
        icon: <XCircle className="w-4 h-4" />,
        text: "Rejected"
      },
      in_progress: {
        badge: "bg-blue-500/20 text-blue-400",
        icon: <AlertCircle className="w-4 h-4" />,
        text: "In Progress"
      },
      submitted: {
        badge: "bg-purple-500/20 text-purple-400",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Submitted"
      },
      completed: {
        badge: "bg-primary/20 text-primary",
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Completed"
      }
    };
    return info[status] || info.pending;
  };

  if (selectedProject) {
    return (
      <ProjectChat
        project={selectedProject}
        currentUserId={userId}
        onBack={() => setSelectedProject(null)}
        onProjectUpdate={loadProjects}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground">
          When you hire service providers, your projects will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Your Projects ({projects.length})</h2>
      
      {projects.map((project, index) => {
        const statusInfo = getStatusInfo(project.status);
        
        return (
          <motion.div
            key={project.id}
            className="glass-card p-4 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{project.project_title}</h3>
                  <Badge className={statusInfo.badge}>
                    <span className="flex items-center gap-1">
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>
                  </Badge>
                </div>
                
                {project.provider && (
                  <p className="text-sm text-primary">
                    Provider: {project.provider.name || "Unknown"} 
                    {project.provider.category && ` (${project.provider.category})`}
                  </p>
                )}
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.project_details}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    {project.budget_type === "high" ? "High Budget" : "Low Budget"}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {project.delivery_time_value} {project.delivery_time_unit}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-primary">Payment: </span>
                  {project.advance_percentage}% advance / {project.final_percentage}% after delivery
                  {project.advance_paid && <Badge className="ml-2 bg-green-500/20 text-green-400">Advance Paid</Badge>}
                  {project.final_paid && <Badge className="ml-2 bg-green-500/20 text-green-400">Fully Paid</Badge>}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {project.status !== "rejected" && project.status !== "pending" && (
                  <Button
                    onClick={() => setSelectedProject(project)}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};