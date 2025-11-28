import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "Digital Marketing",
  "Web Design",
  "UI/UX Design",
  "Graphics Design",
  "Logo Design",
  "Video Editing",
  "Animation",
  "Content Writing",
  "Copywriting",
  "SEO Expert",
  "Social Media Marketing",
  "Data Entry",
  "Virtual Assistant",
  "Photography",
  "Voice Over",
  "Translation",
  "eCommerce",
  "Others"
];

interface ProviderSkillsTagsProps {
  userId: string;
  initialBio?: string;
  initialSkills?: string[];
  initialTags?: string[];
  initialCategories?: string[];
  onUpdate?: () => void;
  readOnly?: boolean;
}

export const ProviderSkillsTags = ({
  userId,
  initialBio = "",
  initialSkills = [],
  initialTags = [],
  initialCategories = [],
  onUpdate,
  readOnly = false
}: ProviderSkillsTagsProps) => {
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [categories, setCategories] = useState<string[]>(initialCategories.length > 0 ? initialCategories : []);
  const [newSkill, setNewSkill] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setBio(initialBio);
    setSkills(initialSkills);
    setTags(initialTags);
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialBio, initialSkills, initialTags, initialCategories]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    } else if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddCategory = () => {
    if (selectedCategory && !categories.includes(selectedCategory) && categories.length < 20) {
      setCategories([...categories, selectedCategory]);
      setSelectedCategory("");
    } else if (categories.length >= 20) {
      toast.error("Maximum 20 categories allowed");
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter(c => c !== catToRemove));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio,
          skills,
          tags,
          category: categories.join(", "),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      onUpdate?.();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-6">
        {bio && (
          <div className="glass-card p-4 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              About
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} className="bg-primary/20 text-primary px-3 py-1.5 text-sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Service Categories (max 20)</Label>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="glass-card flex-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_CATEGORIES.filter(cat => !categories.includes(cat)).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            onClick={handleAddCategory} 
            variant="outline" 
            size="icon"
            disabled={!selectedCategory || categories.length >= 20}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, index) => (
            <Badge key={index} className="bg-cyan-500/20 text-cyan-400 px-3 py-1.5 flex items-center gap-1">
              {cat}
              <button 
                onClick={() => handleRemoveCategory(cat)} 
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{categories.length}/20 categories</p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell clients about yourself, your experience, and what makes you unique..."
          className="glass-card min-h-[120px] resize-none"
        />
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Skills</Label>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., React, Figma)"
            className="glass-card"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
          />
          <Button type="button" onClick={handleAddSkill} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1.5 flex items-center gap-1">
              {skill}
              <button 
                onClick={() => handleRemoveSkill(skill)} 
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Tags (max 5)</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Type and press Enter"
            className="glass-card"
            onKeyPress={handleAddTag}
          />
          <Button 
            type="button" 
            onClick={() => handleAddTag()} 
            variant="outline"
            className="shrink-0"
          >
            Enter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} className="bg-primary/20 text-primary px-3 py-1.5 flex items-center gap-1">
              #{tag}
              <button 
                onClick={() => handleRemoveTag(tag)} 
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{tags.length}/5 tags</p>
      </div>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
};
