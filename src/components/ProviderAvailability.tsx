import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign, Calendar, CheckCircle, XCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProviderAvailabilityProps {
  providerId: string;
  isEditable?: boolean;
}

interface Availability {
  is_available: boolean;
  status: string;
  available_hours_per_week: number;
  hourly_rate: number | null;
  minimum_project_size: string | null;
  preferred_project_duration: string | null;
}

export const ProviderAvailability = ({ providerId, isEditable = false }: ProviderAvailabilityProps) => {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Availability>({
    is_available: true,
    status: 'available',
    available_hours_per_week: 40,
    hourly_rate: null,
    minimum_project_size: null,
    preferred_project_duration: null
  });

  useEffect(() => {
    loadAvailability();
  }, [providerId]);

  const loadAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from("provider_availability")
        .select("*")
        .eq("provider_id", providerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setAvailability(data);
        setFormData({
          is_available: data.is_available,
          status: data.status,
          available_hours_per_week: data.available_hours_per_week,
          hourly_rate: data.hourly_rate,
          minimum_project_size: data.minimum_project_size,
          preferred_project_duration: data.preferred_project_duration
        });
      }
    } catch (error) {
      console.error("Error loading availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (availability) {
        const { error } = await supabase
          .from("provider_availability")
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq("provider_id", providerId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("provider_availability")
          .insert({
            provider_id: providerId,
            ...formData
          });
        
        if (error) throw error;
      }

      toast.success("Availability updated!");
      loadAvailability();
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast.error(error.message || "Failed to save availability");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { badge: string; icon: JSX.Element }> = {
      available: { badge: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
      busy: { badge: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" /> },
      away: { badge: "bg-orange-500/20 text-orange-400", icon: <Clock className="w-3 h-3" /> },
      not_accepting: { badge: "bg-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" /> }
    };
    return styles[status] || styles.available;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isEditable && availability) {
    const statusInfo = getStatusBadge(availability.status);
    return (
      <div className="glass-card p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Availability</h4>
          <Badge className={statusInfo.badge}>
            <span className="flex items-center gap-1">
              {statusInfo.icon}
              {availability.status.replace('_', ' ')}
            </span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {availability.available_hours_per_week && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{availability.available_hours_per_week}h/week</span>
            </div>
          )}
          {availability.hourly_rate && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>${availability.hourly_rate}/hr</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-xl space-y-4"
    >
      <h4 className="font-semibold">Availability Settings</h4>

      <div className="flex items-center justify-between">
        <Label>Available for new projects</Label>
        <Switch
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy (Limited)</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="not_accepting">Not Accepting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Hours per Week</Label>
          <Input
            type="number"
            value={formData.available_hours_per_week}
            onChange={(e) => setFormData({ ...formData, available_hours_per_week: parseInt(e.target.value) || 0 })}
            min={0}
            max={168}
          />
        </div>

        <div>
          <Label>Hourly Rate (USD)</Label>
          <Input
            type="number"
            value={formData.hourly_rate || ""}
            onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || null })}
            placeholder="e.g., 25"
          />
        </div>

        <div>
          <Label>Minimum Project Size</Label>
          <Select
            value={formData.minimum_project_size || ""}
            onValueChange={(value) => setFormData({ ...formData, minimum_project_size: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small ($0-$100)</SelectItem>
              <SelectItem value="medium">Medium ($100-$500)</SelectItem>
              <SelectItem value="large">Large ($500-$2000)</SelectItem>
              <SelectItem value="enterprise">Enterprise ($2000+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Preferred Duration</Label>
          <Select
            value={formData.preferred_project_duration || ""}
            onValueChange={(value) => setFormData({ ...formData, preferred_project_duration: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Few Hours</SelectItem>
              <SelectItem value="days">1-7 Days</SelectItem>
              <SelectItem value="weeks">1-4 Weeks</SelectItem>
              <SelectItem value="months">1+ Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="w-4 h-4" />
        {isSaving ? "Saving..." : "Save Availability"}
      </Button>
    </motion.div>
  );
};
