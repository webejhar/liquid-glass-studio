import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Image, X, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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
}

const categories = [
  "Business",
  "Agency", 
  "LMS",
  "Portfolio",
  "E-commerce",
  "Landing",
  "Branding",
  "Web Development",
  "UI/UX Design",
  "Graphics Design",
  "Other"
];

export default function AdminPortfolio() {
  useAdminAuth();
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    project_url: "",
    images: [] as string[],
    tags: [] as string[],
    is_featured: false
  });
  const [newTag, setNewTag] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("provider_portfolios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error: any) {
      console.error("Error loading portfolios:", error);
      toast.error("Failed to load portfolios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.title,
      description: portfolio.description || "",
      category: portfolio.category || "",
      project_url: portfolio.project_url || "",
      images: portfolio.images || [],
      tags: portfolio.tags || [],
      is_featured: portfolio.is_featured || false
    });
    setShowModal(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `portfolio/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('temp-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('temp-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
      toast.success(`${uploadedUrls.length} image(s) uploaded!`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormData({ ...formData, images: formData.images.filter(i => i !== url) });
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      // Get admin user ID for provider_id (admin creates portfolios)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const portfolioData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        project_url: formData.project_url || null,
        images: formData.images.length > 0 ? formData.images : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_featured: formData.is_featured,
        provider_id: editingPortfolio?.provider_id || user.id
      };

      if (editingPortfolio) {
        const { error } = await supabase
          .from("provider_portfolios")
          .update(portfolioData)
          .eq("id", editingPortfolio.id);

        if (error) throw error;
        toast.success("Portfolio updated!");
      } else {
        const { error } = await supabase
          .from("provider_portfolios")
          .insert(portfolioData);

        if (error) throw error;
        toast.success("Portfolio created!");
      }

      setShowModal(false);
      resetForm();
      loadPortfolios();
    } catch (error: any) {
      console.error("Error saving portfolio:", error);
      toast.error(error.message || "Failed to save portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (portfolioId: string) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;

    try {
      const { error } = await supabase
        .from("provider_portfolios")
        .delete()
        .eq("id", portfolioId);

      if (error) throw error;
      toast.success("Portfolio deleted!");
      loadPortfolios();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast.error("Failed to delete portfolio");
    }
  };

  const resetForm = () => {
    setEditingPortfolio(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      project_url: "",
      images: [],
      tags: [],
      is_featured: false
    });
    setNewTag("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Portfolio Management</h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Portfolio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <p className="text-muted-foreground">No portfolios yet</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Add Portfolio" to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <motion.div
                key={portfolio.id}
                className="glass-card rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {portfolio.images && portfolio.images[0] ? (
                  <img
                    src={portfolio.images[0]}
                    alt={portfolio.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold">{portfolio.title}</h3>
                    {portfolio.is_featured && (
                      <Badge className="bg-primary/20 text-primary">Featured</Badge>
                    )}
                  </div>
                  {portfolio.category && (
                    <Badge variant="outline" className="mb-2">{portfolio.category}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {portfolio.description}
                  </p>
                  {portfolio.tags && portfolio.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {portfolio.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {portfolio.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{portfolio.tags.length - 3}</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {portfolio.project_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(portfolio.project_url!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button onClick={() => handleEdit(portfolio)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(portfolio.id)} size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Portfolio Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="glass-premium max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPortfolio ? "Edit Portfolio" : "Add Portfolio"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter portfolio title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Project URL</Label>
                <Input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label>Featured Portfolio</Label>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Images (Multiple allowed)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => handleRemoveImage(url)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isLoading} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {editingPortfolio ? "Update" : "Create"}
                </Button>
                <Button onClick={() => setShowModal(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
