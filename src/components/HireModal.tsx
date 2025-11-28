import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, DollarSign, Clock, User, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    userId: string;
    name: string;
    category?: string;
  };
}

export const HireModal = ({ isOpen, onClose, provider }: HireModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    clientType: "normal_user",
    projectTitle: "",
    projectDetails: "",
    budgetType: "low",
    deliveryTimeUnit: "days",
    deliveryTimeValue: 7,
    advancePercentage: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.projectTitle.trim()) {
      toast.error("Please enter project title");
      return;
    }
    if (!formData.projectDetails.trim()) {
      toast.error("Please enter project details");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to hire a provider");
        return;
      }

      const { error } = await supabase.from("projects").insert({
        client_id: user.id,
        provider_id: provider.userId,
        client_name: formData.fullName,
        client_type: formData.clientType,
        project_title: formData.projectTitle,
        project_details: formData.projectDetails,
        budget_type: formData.budgetType,
        delivery_time_unit: formData.deliveryTimeUnit,
        delivery_time_value: formData.deliveryTimeValue,
        advance_percentage: formData.advancePercentage,
        final_percentage: 100 - formData.advancePercentage,
        status: "pending"
      });

      if (error) throw error;

      toast.success("Project request sent successfully!");
      onClose();
      setFormData({
        fullName: "",
        clientType: "normal_user",
        projectTitle: "",
        projectDetails: "",
        budgetType: "low",
        deliveryTimeUnit: "days",
        deliveryTimeValue: 7,
        advancePercentage: 50,
      });
    } catch (error: any) {
      console.error("Error submitting project:", error);
      toast.error(error.message || "Failed to submit project request");
    } finally {
      setIsLoading(false);
    }
  };

  const timeUnits = {
    hours: Array.from({ length: 24 }, (_, i) => i + 1),
    days: Array.from({ length: 30 }, (_, i) => i + 1),
    months: Array.from({ length: 12 }, (_, i) => i + 1),
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          className="relative glass-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full glass-card hover:bg-destructive/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2">Hire {provider.name}</h2>
          <p className="text-muted-foreground mb-6">
            {provider.category && `${provider.category} •`} Fill in the details below to send a project request
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Full Name
              </Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="glass-card"
              />
            </div>

            {/* Client Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Your Type
              </Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => setFormData({ ...formData, clientType: value })}
              >
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal_user">Normal User</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Title */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Project Title (max 100 words)
              </Label>
              <Input
                value={formData.projectTitle}
                onChange={(e) => {
                  const words = e.target.value.split(/\s+/).filter(Boolean);
                  if (words.length <= 100) {
                    setFormData({ ...formData, projectTitle: e.target.value });
                  }
                }}
                placeholder="Brief project title"
                className="glass-card"
              />
              <p className="text-xs text-muted-foreground">
                {formData.projectTitle.split(/\s+/).filter(Boolean).length}/100 words
              </p>
            </div>

            {/* Project Details */}
            <div className="space-y-2">
              <Label>Project Details (max 5000 words)</Label>
              <Textarea
                value={formData.projectDetails}
                onChange={(e) => {
                  const words = e.target.value.split(/\s+/).filter(Boolean);
                  if (words.length <= 5000) {
                    setFormData({ ...formData, projectDetails: e.target.value });
                  }
                }}
                placeholder="Please type your project details..."
                className="glass-card min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                {formData.projectDetails.split(/\s+/).filter(Boolean).length}/5000 words
              </p>
            </div>

            {/* Budget Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Type
              </Label>
              <Select
                value={formData.budgetType}
                onValueChange={(value) => setFormData({ ...formData, budgetType: value })}
              >
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Budget</SelectItem>
                  <SelectItem value="high">High Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Delivery Time
              </Label>
              <div className="flex gap-3">
                <Select
                  value={formData.deliveryTimeUnit}
                  onValueChange={(value) => setFormData({ ...formData, deliveryTimeUnit: value, deliveryTimeValue: 1 })}
                >
                  <SelectTrigger className="glass-card w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.deliveryTimeValue.toString()}
                  onValueChange={(value) => setFormData({ ...formData, deliveryTimeValue: parseInt(value) })}
                >
                  <SelectTrigger className="glass-card flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeUnits[formData.deliveryTimeUnit as keyof typeof timeUnits].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {formData.deliveryTimeUnit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Split */}
            <div className="space-y-4">
              <Label>Payment Split</Label>
              <div className="glass-card p-4 rounded-xl space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Advance Payment: {formData.advancePercentage}%</span>
                  <span>After Delivery: {100 - formData.advancePercentage}%</span>
                </div>
                <Slider
                  value={[formData.advancePercentage]}
                  onValueChange={([value]) => setFormData({ ...formData, advancePercentage: value })}
                  min={10}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>50%</span>
                  <span>90%</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full glass-button py-3"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Project Request
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};