import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Image, X, Save, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface FaqItem { question: string; answer: string; }

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  project_url: string | null;
  images: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  provider_id: string;
  created_at: string;
  faq: FaqItem[] | null;
  bullets: string[] | null;
  client_name: string | null;
  completion_date: string | null;
  technologies_used: string[] | null;
  live_url: string | null;
  github_url: string | null;
  testimonial: string | null;
  budget_range: string | null;
  duration: string | null;
}

const categories = [
  "Business", "Agency", "LMS", "Portfolio", "E-commerce",
  "Landing", "Branding", "Web Development", "UI/UX Design", "Graphics Design", "Other"
];

export default function AdminPortfolio() {
  useAdminAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "", project_url: "",
    images: [] as string[], tags: [] as string[], is_featured: false,
    faq: [] as FaqItem[], bullets: [] as string[],
    client_name: "", completion_date: "", technologies_used: [] as string[],
    live_url: "", github_url: "", testimonial: "", budget_range: "", duration: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newBullet, setNewBullet] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { loadPortfolios(); }, []);

  const allCategories = [...categories, ...customCategories];

  const loadPortfolios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("provider_portfolios").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPortfolios((data || []) as any);
    } catch (error: any) {
      toast.error("Failed to load portfolios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (p: Portfolio) => {
    setEditingPortfolio(p);
    setFormData({
      title: p.title, description: p.description || "", category: p.category || "",
      project_url: p.project_url || "", images: p.images || [], tags: p.tags || [],
      is_featured: p.is_featured || false,
      faq: (p.faq as FaqItem[]) || [], bullets: p.bullets || [],
      client_name: p.client_name || "", completion_date: p.completion_date || "",
      technologies_used: p.technologies_used || [],
      live_url: p.live_url || "", github_url: p.github_url || "",
      testimonial: p.testimonial || "", budget_range: p.budget_range || "", duration: p.duration || "",
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `portfolio/${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage.from('temp-images').upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('temp-images').getPublicUrl(path);
        urls.push(publicUrl);
      }
      setFormData({ ...formData, images: [...formData.images, ...urls] });
      toast.success(`${urls.length} image(s) uploaded!`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) { toast.error("Title is required"); return; }
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const d: any = {
        title: formData.title, description: formData.description || null,
        category: formData.category || null, project_url: formData.project_url || null,
        images: formData.images.length > 0 ? formData.images : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_featured: formData.is_featured, provider_id: editingPortfolio?.provider_id || user.id,
        faq: formData.faq.length > 0 ? formData.faq : [], bullets: formData.bullets.length > 0 ? formData.bullets : [],
        client_name: formData.client_name || null, completion_date: formData.completion_date || null,
        technologies_used: formData.technologies_used.length > 0 ? formData.technologies_used : [],
        live_url: formData.live_url || null, github_url: formData.github_url || null,
        testimonial: formData.testimonial || null, budget_range: formData.budget_range || null,
        duration: formData.duration || null,
      };
      if (editingPortfolio) {
        const { error } = await supabase.from("provider_portfolios").update(d).eq("id", editingPortfolio.id);
        if (error) throw error;
        toast.success("Portfolio updated!");
      } else {
        const { error } = await supabase.from("provider_portfolios").insert(d);
        if (error) throw error;
        toast.success("Portfolio created!");
      }
      setShowModal(false);
      resetForm();
      loadPortfolios();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio?")) return;
    try {
      const { error } = await supabase.from("provider_portfolios").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted!");
      loadPortfolios();
    } catch { toast.error("Failed to delete"); }
  };

  const resetForm = () => {
    setEditingPortfolio(null);
    setFormData({
      title: "", description: "", category: "", project_url: "",
      images: [], tags: [], is_featured: false, faq: [], bullets: [],
      client_name: "", completion_date: "", technologies_used: [],
      live_url: "", github_url: "", testimonial: "", budget_range: "", duration: "",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Portfolio Management</h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Portfolio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <p className="text-muted-foreground">No portfolios yet. Click "Add Portfolio" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((p) => (
              <motion.div key={p.id} className="glass-card rounded-xl overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {p.images && p.images[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center"><Image className="w-12 h-12 text-muted-foreground" /></div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.is_featured && <Badge className="bg-primary/20 text-primary">Featured</Badge>}
                  </div>
                  {p.category && <Badge variant="outline" className="mb-2">{p.category}</Badge>}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex gap-2">
                    {p.project_url && <Button size="sm" variant="outline" onClick={() => window.open(p.project_url!, '_blank')}><ExternalLink className="w-4 h-4" /></Button>}
                    <Button onClick={() => handleEdit(p)} size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
                    <Button onClick={() => handleDelete(p.id)} size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="glass-premium max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPortfolio ? "Edit Portfolio" : "Add Portfolio"}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="faq">FAQ & More</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Portfolio title" /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                <div>
                  <Label>Category</Label>
                  <div className="flex gap-2">
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New" className="w-24" />
                      <Button variant="outline" size="sm" onClick={() => { if (newCategory.trim()) { setCustomCategories([...customCategories, newCategory.trim()]); setFormData({ ...formData, category: newCategory.trim() }); setNewCategory(""); } }}>+</Button>
                    </div>
                  </div>
                </div>
                <div><Label>Project URL</Label><Input value={formData.project_url} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} placeholder="https://" /></div>
                <div><Label>Live URL</Label><Input value={formData.live_url} onChange={(e) => setFormData({ ...formData, live_url: e.target.value })} placeholder="https://" /></div>
                <div><Label>GitHub URL</Label><Input value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} placeholder="https://github.com/..." /></div>
                <div className="flex items-center gap-2"><Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })} /><Label>Featured</Label></div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div><Label>Client Name</Label><Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} /></div>
                <div><Label>Duration</Label><Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 3 months" /></div>
                <div><Label>Budget Range</Label><Input value={formData.budget_range} onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })} placeholder="e.g. $500 - $1000" /></div>
                <div><Label>Completion Date</Label><Input value={formData.completion_date} onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })} placeholder="e.g. March 2024" /></div>
                <div><Label>Testimonial</Label><Textarea value={formData.testimonial} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} rows={3} /></div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2"><Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), newTag.trim() && setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] }), setNewTag(""))} /><Button variant="outline" onClick={() => { if (newTag.trim()) { setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] }); setNewTag(""); } }}>Add</Button></div>
                  <div className="flex flex-wrap gap-1 mt-2">{formData.tags.map((t, i) => <Badge key={i} className="flex items-center gap-1">{t}<button onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button></Badge>)}</div>
                </div>
                <div>
                  <Label>Technologies</Label>
                  <div className="flex gap-2"><Input value={newTech} onChange={(e) => setNewTech(e.target.value)} placeholder="Add technology" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), newTech.trim() && setFormData({ ...formData, technologies_used: [...formData.technologies_used, newTech.trim()] }), setNewTech(""))} /><Button variant="outline" onClick={() => { if (newTech.trim()) { setFormData({ ...formData, technologies_used: [...formData.technologies_used, newTech.trim()] }); setNewTech(""); } }}>Add</Button></div>
                  <div className="flex flex-wrap gap-1 mt-2">{formData.technologies_used.map((t, i) => <Badge key={i} variant="secondary" className="flex items-center gap-1">{t}<button onClick={() => setFormData({ ...formData, technologies_used: formData.technologies_used.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button></Badge>)}</div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                <div>
                  <Label>Images (Multiple)</Label>
                  <Input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} />
                  {uploadingImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button onClick={() => setFormData({ ...formData, images: formData.images.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4 mt-4">
                <div>
                  <Label>Key Features / Bullets</Label>
                  <div className="flex gap-2"><Input value={newBullet} onChange={(e) => setNewBullet(e.target.value)} placeholder="Add feature" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), newBullet.trim() && setFormData({ ...formData, bullets: [...formData.bullets, newBullet.trim()] }), setNewBullet(""))} /><Button variant="outline" onClick={() => { if (newBullet.trim()) { setFormData({ ...formData, bullets: [...formData.bullets, newBullet.trim()] }); setNewBullet(""); } }}>Add</Button></div>
                  <ul className="mt-2 space-y-1">{formData.bullets.map((b, i) => <li key={i} className="flex items-center justify-between text-sm glass-card p-2 rounded-lg"><span>• {b}</span><button onClick={() => setFormData({ ...formData, bullets: formData.bullets.filter((_, j) => j !== i) })}><X className="w-3 h-3 text-destructive" /></button></li>)}</ul>
                </div>
                <div>
                  <Label className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> FAQ</Label>
                  <div className="space-y-2">
                    <Input value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question" />
                    <Textarea value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer" rows={2} />
                    <Button variant="outline" className="w-full" onClick={() => { if (newFaqQ.trim() && newFaqA.trim()) { setFormData({ ...formData, faq: [...formData.faq, { question: newFaqQ.trim(), answer: newFaqA.trim() }] }); setNewFaqQ(""); setNewFaqA(""); } }}>Add FAQ</Button>
                  </div>
                  <div className="mt-2 space-y-2">{formData.faq.map((f, i) => <div key={i} className="glass-card p-3 rounded-lg"><div className="flex justify-between"><strong className="text-sm">Q: {f.question}</strong><button onClick={() => setFormData({ ...formData, faq: formData.faq.filter((_, j) => j !== i) })}><X className="w-3 h-3 text-destructive" /></button></div><p className="text-sm text-muted-foreground mt-1">A: {f.answer}</p></div>)}</div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1 gap-2"><Save className="w-4 h-4" />{editingPortfolio ? "Update" : "Create"}</Button>
              <Button onClick={() => setShowModal(false)} variant="outline">Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
