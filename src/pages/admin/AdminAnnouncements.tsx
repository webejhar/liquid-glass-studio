import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function AdminAnnouncements() {
  useAdminAuth();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_audience: "all",
    is_active: true,
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const announcementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        target_audience: formData.target_audience,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        created_by: user?.id
      };

      if (editingItem) {
        const { error } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", editingItem.id);
        if (error) throw error;
        toast.success("Announcement updated!");
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert(announcementData);
        if (error) throw error;
        toast.success("Announcement created!");
      }

      setShowModal(false);
      resetForm();
      loadAnnouncements();
    } catch (error: any) {
      console.error("Error saving announcement:", error);
      toast.error(error.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Announcement deleted!");
      loadAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      loadAnnouncements();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      target_audience: "all",
      is_active: true,
      start_date: "",
      end_date: ""
    });
    setEditingItem(null);
  };

  const openEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      target_audience: item.target_audience,
      is_active: item.is_active,
      start_date: item.start_date?.split('T')[0] || "",
      end_date: item.end_date?.split('T')[0] || ""
    });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6" />
            Announcements
          </h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No announcements yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {announcements.map((item, index) => (
              <motion.div
                key={item.id}
                className="glass-card p-4 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge className={item.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{item.target_audience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                      {item.start_date && ` | Start: ${new Date(item.start_date).toLocaleDateString()}`}
                      {item.end_date && ` | End: ${new Date(item.end_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={() => toggleActive(item.id, item.is_active)}
                    />
                    <Button onClick={() => openEdit(item)} size="icon" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="glass-premium max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="general">General Users</SelectItem>
                    <SelectItem value="service_provider">Service Providers</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button onClick={handleSave} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {editingItem ? "Update" : "Create"} Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
