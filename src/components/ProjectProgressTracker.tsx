import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Send, 
  Upload, 
  CreditCard,
  Shield,
  Package,
  Wallet
} from "lucide-react";

interface Project {
  id: string;
  status: string;
  advance_paid: boolean;
  final_paid: boolean;
  admin_approved: boolean;
  submission_files: string[] | null;
  provider_payment_requested?: boolean;
  provider_payment_status?: string | null;
}

interface ProjectProgressTrackerProps {
  project: Project;
  isProvider: boolean;
  isClient: boolean;
  isAdmin?: boolean;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  completed: boolean;
  current: boolean;
  forRole: 'all' | 'client' | 'provider' | 'admin';
}

export const ProjectProgressTracker = ({ 
  project, 
  isProvider, 
  isClient,
  isAdmin = false 
}: ProjectProgressTrackerProps) => {
  
  const getSteps = (): Step[] => {
    const steps: Step[] = [
      {
        id: 'request',
        title: 'Project Request Sent',
        description: 'Client sent the project request to provider',
        icon: <Send className="w-5 h-5" />,
        completed: true, // Always completed if project exists
        current: project.status === 'pending',
        forRole: 'all'
      },
      {
        id: 'accepted',
        title: 'Provider Accepted',
        description: 'Provider accepted the project request',
        icon: <CheckCircle className="w-5 h-5" />,
        completed: project.status !== 'pending' && project.status !== 'rejected',
        current: project.status === 'accepted' && !project.advance_paid,
        forRole: 'all'
      },
      {
        id: 'advance_payment',
        title: 'Advance Payment',
        description: 'Client made advance payment',
        icon: <CreditCard className="w-5 h-5" />,
        completed: project.advance_paid,
        current: project.status === 'accepted' && !project.advance_paid,
        forRole: 'client'
      },
      {
        id: 'payment_pending',
        title: 'Payment Under Review',
        description: 'Admin reviewing the advance payment',
        icon: <Clock className="w-5 h-5" />,
        completed: project.admin_approved,
        current: project.advance_paid && !project.admin_approved,
        forRole: 'all'
      },
      {
        id: 'admin_approved',
        title: 'Admin Approved Payment',
        description: 'Admin confirmed the payment',
        icon: <Shield className="w-5 h-5" />,
        completed: project.admin_approved,
        current: project.admin_approved && project.status === 'in_progress' && !project.submission_files?.length,
        forRole: 'all'
      },
      {
        id: 'work_in_progress',
        title: 'Work In Progress',
        description: 'Provider working on the project',
        icon: <FileText className="w-5 h-5" />,
        completed: project.status === 'submitted' || project.status === 'completed',
        current: project.status === 'in_progress' && project.admin_approved,
        forRole: 'all'
      },
      {
        id: 'project_submitted',
        title: 'Project Submitted',
        description: 'Provider submitted the completed work',
        icon: <Upload className="w-5 h-5" />,
        completed: project.status === 'submitted' || project.status === 'completed',
        current: project.status === 'submitted' && !project.final_paid,
        forRole: 'all'
      },
      {
        id: 'final_payment',
        title: 'Final Payment',
        description: 'Client made the final payment',
        icon: <DollarSign className="w-5 h-5" />,
        completed: project.final_paid,
        current: project.status === 'submitted' && !project.final_paid,
        forRole: 'client'
      },
      {
        id: 'final_approval',
        title: 'Final Approval',
        description: 'Admin approved final payment & completed project',
        icon: <Shield className="w-5 h-5" />,
        completed: project.status === 'completed',
        current: project.final_paid && project.status !== 'completed',
        forRole: 'all'
      },
      {
        id: 'files_delivered',
        title: 'Files Delivered',
        description: 'Client can download project files',
        icon: <Package className="w-5 h-5" />,
        completed: project.status === 'completed',
        current: false,
        forRole: 'client'
      },
      {
        id: 'provider_payment',
        title: 'Provider Payment',
        description: 'Admin processed payment to provider (95%)',
        icon: <Wallet className="w-5 h-5" />,
        completed: project.provider_payment_status === 'paid',
        current: project.status === 'completed' && project.provider_payment_status !== 'paid',
        forRole: 'provider'
      }
    ];

    // Filter steps based on role
    return steps.filter(step => {
      if (step.forRole === 'all') return true;
      if (isAdmin) return true;
      if (step.forRole === 'client' && isClient) return true;
      if (step.forRole === 'provider' && isProvider) return true;
      return false;
    });
  };

  const steps = getSteps();
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Project Progress
        </h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{steps.length} Steps
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-muted" />

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Icon Circle */}
              <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                step.completed 
                  ? 'bg-green-500/20 text-green-500 border-2 border-green-500' 
                  : step.current 
                    ? 'bg-primary/20 text-primary border-2 border-primary animate-pulse' 
                    : 'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
              }`}>
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-medium ${
                    step.completed 
                      ? 'text-green-500' 
                      : step.current 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h4>
                  {step.completed && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                  {step.current && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      {project.status === 'completed' && (
        <motion.div 
          className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-green-500 font-medium">Project Completed Successfully!</p>
        </motion.div>
      )}

      {project.status === 'rejected' && (
        <motion.div 
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-red-500 font-medium">Project Rejected</p>
        </motion.div>
      )}
    </div>
  );
};
