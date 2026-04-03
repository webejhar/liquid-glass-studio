import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Star, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  quote: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminTestimonials() {
  useAdminAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    rating: 5,
    quote: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTestimonials(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `testimonial-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("temp-images").upload(fileName, file);
    if (error) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("temp-images").getPublicUrl(fileName);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    if (!form.name || !form.quote) {
      toast.error("Name and quote are required");
      return;
    }
    const payload = {
      name: form.name,
      role: form.role || null,
      rating: form.rating,
      quote: form.quote,
      image_url: form.image_url || null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editingId);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Testimonial updated");
    } else {
      const { error } = await supabase.from("testimonials").insert(payload);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Testimonial created");
    }
    setModalOpen(false);
    resetForm();
    loadTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Deleted");
    loadTestimonials();
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role || "",
      rating: t.rating,
      quote: t.quote,
      image_url: t.image_url || "",
      is_active: t.is_active,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", role: "", rating: 5, quote: "", image_url: "", is_active: true });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Client Testimonials</h1>
        <Button onClick={() => { resetForm(); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : testimonials.length === 0 ? (
        <p className="text-muted-foreground">No testimonials yet.</p>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              className="glass-card p-4 rounded-xl flex items-start gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t.image_url ? (
                <img src={t.image_url} alt={t.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-lg font-bold">
                  {t.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{t.name}</p>
                  {!t.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Inactive</span>}
                </div>
                {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic line-clamp-2">"{t.quote}"</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(t)}><Edit className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} Testimonial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role / Company</label>
              <Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="CEO, Company Inc" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setForm(p => ({ ...p, rating: r }))}>
                    <Star className={`w-6 h-6 ${r <= form.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Quote *</label>
              <Textarea value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Photo</label>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-full object-cover mb-2" />
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
              <label className="text-sm">Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
