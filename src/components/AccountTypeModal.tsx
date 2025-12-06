import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface AccountTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'general' | 'service_provider' | 'client') => void;
}

export const AccountTypeModal = ({ open, onClose, onSelectType }: AccountTypeModalProps) => {
  const accountTypes = [
    {
      type: 'general' as const,
      title: 'General User',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'service_provider' as const,
      title: 'Service Provider',
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      type: 'client' as const,
      title: 'Client',
      icon: Building2,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Account Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0">
          {accountTypes.map((accountType, index) => {
            const Icon = accountType.icon;
            return (
              <motion.div
                key={accountType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-6 flex flex-col items-center gap-4 hover:scale-105 transition-all duration-300 border-2 hover:border-primary group"
                  onClick={() => onSelectType(accountType.type)}
                >
                  <div className={`p-4 rounded-full bg-gradient-to-br ${accountType.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{accountType.title}</h3>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
