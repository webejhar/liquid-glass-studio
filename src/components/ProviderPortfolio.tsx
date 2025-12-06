import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Image, Link as LinkIcon, Tag, Trash2, Edit, X, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  project_url: string | null;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean;
  created_at: string;
}

interface ProviderPortfolioProps {
  providerId: string;
  isEditable?: boolean;
}

export const ProviderPortfolio = ({ providerId, isEditable = false }: ProviderPortfolioProps) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
    project_url: "",
    category: "",
    tags: [] as string[],
    is_featured: false
  });
  const [newTag, setNewTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPortfolio();
  }, [providerId]);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("provider_portfolios")
        .select("*")
        .eq("provider_id", providerId)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `portfolio/${providerId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('temp-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('temp-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, images: [...formData.images, publicUrl] });
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const portfolioData = {
        provider_id: providerId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        images: formData.images.length > 0 ? formData.images : null,
        project_url: formData.project_url.trim() || null,
        category: formData.category.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_featured: formData.is_featured
      };

      if (editingItem) {
        const { error } = await supabase
          .from("provider_portfolios")
          .update(portfolioData)
          .eq("id", editingItem.id);
        if (error) throw error;
        toast.success("Portfolio item updated!");
      } else {
        const { error } = await supabase
          .from("provider_portfolios")
          .insert(portfolioData);
        if (error) throw error;
        toast.success("Portfolio item added!");
      }

      setShowAddModal(false);
      resetForm();
      loadPortfolio();
    } catch (error: any) {
      console.error("Error saving portfolio:", error);
      toast.error(error.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;

    try {
      const { error } = await supabase
        .from("provider_portfolios")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Portfolio item deleted!");
      loadPortfolio();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      images: [],
      project_url: "",
      category: "",
      tags: [],
      is_featured: false
    });
    setEditingItem(null);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      images: item.images || [],
      project_url: item.project_url || "",
      category: item.category || "",
      tags: item.tags || [],
      is_featured: item.is_featured
    });
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio ({portfolioItems.length})</h3>
        {isEditable && (
          <Button onClick={() => { resetForm(); setShowAddModal(true); }} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Add Work
          </Button>
        )}
      </div>

      {portfolioItems.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No portfolio items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="glass-card rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {item.images && item.images[0] && (
                <div 
                  className="relative h-48 cursor-pointer"
                  onClick={() => setSelectedImage(item.images![0])}
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
                  )}
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{item.title}</h4>
                  {isEditable && (
                    <div className="flex gap-1">
                      <Button onClick={() => openEdit(item)} size="icon" variant="ghost" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {item.project_url && (
                  <a 
                    href={item.project_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Project
                  </a>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="glass-premium max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Portfolio" : "Add to Portfolio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Project title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your work..."
                rows={3}
              />
            </div>
            <div>
              <Label>Images</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full gap-2"
                disabled={isUploading}
              >
                <Image className="w-4 h-4" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
              {formData.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <img src={img} alt="" className="w-full h-full object-cover rounded" />
                      <button
                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Project URL</Label>
              <Input
                value={formData.project_url}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, i) => (
                  <Badge key={i} className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, idx) => idx !== i) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="w-4 h-4" />
              {editingItem ? "Update" : "Add to Portfolio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <img src={selectedImage} alt="Preview" className="w-full h-auto" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
