import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Setting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string | null;
}

export default function AdminSettings() {
  useAdminAuth();
  
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      setSettings(data || []);
      
      // Initialize edited settings
      const initial: Record<string, any> = {};
      (data || []).forEach(s => {
        initial[s.setting_key] = s.setting_value;
      });
      setEditedSettings(initial);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      for (const setting of settings) {
        if (editedSettings[setting.setting_key] !== setting.setting_value) {
          const { error } = await supabase
            .from("platform_settings")
            .update({
              setting_value: editedSettings[setting.setting_key],
              updated_by: user?.id,
              updated_at: new Date().toISOString()
            })
            .eq("id", setting.id);
          
          if (error) throw error;
        }
      }

      toast.success("Settings saved!");
      loadSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedSettings[setting.setting_key];
    
    switch (setting.setting_type) {
      case 'boolean':
        return (
          <Switch
            checked={value === 'true' || value === true}
            onCheckedChange={(checked) => updateSetting(setting.setting_key, checked ? 'true' : 'false')}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
            className="w-40"
          />
        );
      default:
        return (
          <Input
            value={typeof value === 'string' ? value.replace(/"/g, '') : value}
            onChange={(e) => updateSetting(setting.setting_key, `"${e.target.value}"`)}
            className="w-64"
          />
        );
    }
  };

  const formatSettingKey = (key: string) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const groupSettings = () => {
    const groups: Record<string, Setting[]> = {
      'Payment Settings': [],
      'Platform Settings': [],
      'Notification Settings': [],
      'Other': []
    };

    settings.forEach(setting => {
      if (setting.setting_key.includes('fee') || setting.setting_key.includes('rate') || setting.setting_key.includes('reward') || setting.setting_key.includes('budget')) {
        groups['Payment Settings'].push(setting);
      } else if (setting.setting_key.includes('notification') || setting.setting_key.includes('email') || setting.setting_key.includes('sms')) {
        groups['Notification Settings'].push(setting);
      } else if (setting.setting_key.includes('maintenance') || setting.setting_key.includes('file') || setting.setting_key.includes('review')) {
        groups['Platform Settings'].push(setting);
      } else {
        groups['Other'].push(setting);
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const groupedSettings = groupSettings();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Platform Settings
          </h1>
          <div className="flex gap-2">
            <Button onClick={loadSettings} variant="outline" size="sm" className="gap-1">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {Object.entries(groupedSettings).map(([group, groupSettings]) => {
          if (groupSettings.length === 0) return null;
          
          return (
            <motion.div
              key={group}
              className="glass-card p-6 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4">{group}</h2>
              <div className="space-y-4">
                {groupSettings.map((setting) => (
                  <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <Label className="font-medium">{formatSettingKey(setting.setting_key)}</Label>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
