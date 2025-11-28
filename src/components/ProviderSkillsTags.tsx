import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProviderSkillsTagsProps {
  userId: string;
  initialBio?: string;
  initialSkills?: string[];
  initialTags?: string[];
  onUpdate?: () => void;
  readOnly?: boolean;
}

export const ProviderSkillsTags = ({
  userId,
  initialBio = "",
  initialSkills = [],
  initialTags = [],
  onUpdate,
  readOnly = false
}: ProviderSkillsTagsProps) => {
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newSkill, setNewSkill] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio,
          skills,
          tags,
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
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{bio}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} className="bg-primary/20 text-primary px-3 py-1">
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
      {/* Bio */}
      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell clients about yourself..."
          className="glass-card min-h-[100px]"
        />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            className="glass-card"
            onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
          />
          <Button type="button" onClick={handleAddSkill} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
              {skill}
              <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags (max 5)</Label>
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
            className="md:hidden"
          >
            Enter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge key={index} className="bg-primary/20 text-primary px-3 py-1 flex items-center gap-1">
              #{tag}
              <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{tags.length}/5 tags</p>
      </div>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};