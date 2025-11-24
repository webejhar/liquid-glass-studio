import { motion } from "framer-motion";
import { useState } from "react";
import { Download, Edit2, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GeneratedImage {
  url: string;
  prompt: string;
}

export default function ImageGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    const newImages: GeneratedImage[] = [];

    try {
      // Generate 4 images
      for (let i = 0; i < 4; i++) {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt },
        });

        if (error) {
          console.error(`Error generating image ${i + 1}:`, error);
          if (error.message.includes("429")) {
            toast.error("Rate limit exceeded. Please try again in a moment.");
            break;
          } else if (error.message.includes("402")) {
            toast.error("AI usage limit reached. Please contact support.");
            break;
          } else {
            toast.error(`Failed to generate image ${i + 1}`);
          }
          continue;
        }

        if (data?.imageUrl) {
          newImages.push({ url: data.imageUrl, prompt });
        }
      }

      if (newImages.length > 0) {
        setImages(newImages);
        toast.success(`Generated ${newImages.length} image${newImages.length > 1 ? 's' : ''} successfully!`);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while generating images");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || editingIndex === null) {
      toast.error("Please enter edit instructions");
      return;
    }

    setIsEditing(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { 
          prompt: editPrompt,
          imageUrl: images[editingIndex].url 
        },
      });

      if (error) {
        console.error("Error editing image:", error);
        if (error.message.includes("429")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message.includes("402")) {
          toast.error("AI usage limit reached. Please contact support.");
        } else {
          toast.error("Failed to edit image");
        }
        return;
      }

      if (data?.imageUrl) {
        const updatedImages = [...images];
        updatedImages[editingIndex] = { 
          url: data.imageUrl, 
          prompt: `${images[editingIndex].prompt} (edited: ${editPrompt})` 
        };
        setImages(updatedImages);
        toast.success("Image edited successfully!");
        setEditingIndex(null);
        setEditPrompt("");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while editing the image");
    } finally {
      setIsEditing(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <div className="min-h-screen pt-8 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 transition-all hover:scale-105 font-medium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI Image <span className="text-primary">Generator</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create stunning images from text in any language
        </motion.p>

        <motion.div
          className="glass-card p-8 rounded-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="prompt" className="block mb-3 text-lg font-medium">
            Enter Your Prompt
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create... (supports all languages)"
            className="mb-6 min-h-[120px] text-base"
          />
          <Button
            onClick={generateImages}
            disabled={!prompt.trim() || isGenerating}
            className="w-full glass-button py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating 4 Images...
              </>
            ) : (
              "Generate Images"
            )}
          </Button>
        </motion.div>

        {images.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                className="glass-card p-4 rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative group">
                  <img
                    src={image.url}
                    alt={`Generated ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => {
                        setEditingIndex(index);
                        setEditPrompt("");
                      }}
                      className="glass-button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => downloadImage(image.url, index)}
                      className="glass-button"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {image.prompt}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Dialog open={editingIndex !== null} onOpenChange={() => setEditingIndex(null)}>
          <DialogContent className="glass-premium">
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-prompt">What would you like to change?</Label>
                <Textarea
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="E.g., Make it sunset, add more colors, change background..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleEdit}
                  disabled={!editPrompt.trim() || isEditing}
                  className="flex-1"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Editing...
                    </>
                  ) : (
                    "Apply Changes"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingIndex(null)}
                  disabled={isEditing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
