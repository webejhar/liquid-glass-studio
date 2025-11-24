import { motion } from "framer-motion";
import { useState } from "react";
import { Download, Edit2, Loader2, ArrowLeft, Upload, Scissors, Shirt, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  
  // Photo Edit feature
  const [showPhotoEdit, setShowPhotoEdit] = useState(false);
  const [photoEditFile, setPhotoEditFile] = useState<File | null>(null);
  const [photoEditPrompt, setPhotoEditPrompt] = useState("");
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);
  
  // Face Swap feature
  const [showFaceSwap, setShowFaceSwap] = useState(false);
  const [originalFaceFile, setOriginalFaceFile] = useState<File | null>(null);
  const [targetFaceFile, setTargetFaceFile] = useState<File | null>(null);
  const [isFaceSwapping, setIsFaceSwapping] = useState(false);
  
  // Change Dress feature
  const [showChangeDress, setShowChangeDress] = useState(false);
  const [dressPhotoFile, setDressPhotoFile] = useState<File | null>(null);
  const [dressPrompt, setDressPrompt] = useState("");
  const [isChangingDress, setIsChangingDress] = useState(false);

  // Enhancement feature
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<'HD' | '2K' | '4K'>('HD');
  const [faceClean, setFaceClean] = useState(false);
  const [showEnhanceDialog, setShowEnhanceDialog] = useState<number | null>(null);

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

  const handlePhotoEdit = async () => {
    if (!photoEditFile || !photoEditPrompt.trim()) {
      toast.error("Please upload a photo and provide editing instructions");
      return;
    }

    setIsPhotoEditing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { 
            prompt: photoEditPrompt,
            imageUrl 
          },
        });

        if (error) {
          console.error("Error editing photo:", error);
          if (error.message.includes("429")) {
            toast.error("Rate limit exceeded. Please try again in a moment.");
          } else if (error.message.includes("402")) {
            toast.error("AI usage limit reached. Please contact support.");
          } else {
            toast.error("Failed to edit photo");
          }
          setIsPhotoEditing(false);
          return;
        }

        if (data?.imageUrl) {
          setImages([...images, { url: data.imageUrl, prompt: `Photo edited: ${photoEditPrompt}` }]);
          toast.success("Photo edited successfully!");
          setShowPhotoEdit(false);
          setPhotoEditFile(null);
          setPhotoEditPrompt("");
        }
        setIsPhotoEditing(false);
      };
      reader.readAsDataURL(photoEditFile);
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while editing the photo");
      setIsPhotoEditing(false);
    }
  };

  const handleFaceSwap = async () => {
    if (!originalFaceFile || !targetFaceFile) {
      toast.error("Please upload both original and target face photos");
      return;
    }

    setIsFaceSwapping(true);

    try {
      const originalReader = new FileReader();
      originalReader.onload = async (e) => {
        const originalUrl = e.target?.result as string;
        
        const targetReader = new FileReader();
        targetReader.onload = async (te) => {
          const targetUrl = te.target?.result as string;
          
          const { data, error } = await supabase.functions.invoke("generate-image", {
            body: { 
              prompt: `Swap the face in this image with the target face, maintaining 100% accuracy and preserving the body and background exactly as in the original image`,
              imageUrl: originalUrl
            },
          });

          if (error) {
            console.error("Error swapping face:", error);
            if (error.message.includes("429")) {
              toast.error("Rate limit exceeded. Please try again in a moment.");
            } else if (error.message.includes("402")) {
              toast.error("AI usage limit reached. Please contact support.");
            } else {
              toast.error("Failed to swap face");
            }
            setIsFaceSwapping(false);
            return;
          }

          if (data?.imageUrl) {
            setImages([...images, { url: data.imageUrl, prompt: "Face swap completed" }]);
            toast.success("Face swapped successfully!");
            setShowFaceSwap(false);
            setOriginalFaceFile(null);
            setTargetFaceFile(null);
          }
          setIsFaceSwapping(false);
        };
        targetReader.readAsDataURL(targetFaceFile);
      };
      originalReader.readAsDataURL(originalFaceFile);
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while swapping faces");
      setIsFaceSwapping(false);
    }
  };

  const handleChangeDress = async () => {
    if (!dressPhotoFile || !dressPrompt.trim()) {
      toast.error("Please upload a photo and describe the dress");
      return;
    }

    setIsChangingDress(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { 
            prompt: `Change only the dress/clothing in this image to: ${dressPrompt}. Keep the face, body, pose, and background exactly the same. Only modify the clothing.`,
            imageUrl 
          },
        });

        if (error) {
          console.error("Error changing dress:", error);
          if (error.message.includes("429")) {
            toast.error("Rate limit exceeded. Please try again in a moment.");
          } else if (error.message.includes("402")) {
            toast.error("AI usage limit reached. Please contact support.");
          } else {
            toast.error("Failed to change dress");
          }
          setIsChangingDress(false);
          return;
        }

        if (data?.imageUrl) {
          setImages([...images, { url: data.imageUrl, prompt: `Dress changed: ${dressPrompt}` }]);
          toast.success("Dress changed successfully!");
          setShowChangeDress(false);
          setDressPhotoFile(null);
          setDressPrompt("");
        }
        setIsChangingDress(false);
      };
      reader.readAsDataURL(dressPhotoFile);
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while changing the dress");
      setIsChangingDress(false);
    }
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      toast.info("Preparing download...");
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  const enhanceImage = async (imageUrl: string, index: number) => {
    try {
      setEnhancingIndex(index);
      toast.info(`Enhancing to ${selectedResolution}...`);

      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: {
          imageUrl,
          resolution: selectedResolution,
          faceClean
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const updatedImages = [...images];
        updatedImages[index] = { ...updatedImages[index], url: data.imageUrl };
        setImages(updatedImages);
        toast.success(`Image enhanced to ${selectedResolution}!`);
        setShowEnhanceDialog(null);
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error(error.message || 'Failed to enhance image');
    } finally {
      setEnhancingIndex(null);
    }
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

        {/* Feature Buttons */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={() => setShowPhotoEdit(true)}
            variant="outline"
            className="glass-button py-6 flex items-center gap-3"
          >
            <Edit2 className="w-5 h-5" />
            <span>Photo Edit</span>
          </Button>
          <Button
            onClick={() => setShowFaceSwap(true)}
            variant="outline"
            className="glass-button py-6 flex items-center gap-3"
          >
            <Scissors className="w-5 h-5" />
            <span>Face Swap</span>
          </Button>
          <Button
            onClick={() => setShowChangeDress(true)}
            variant="outline"
            className="glass-button py-6 flex items-center gap-3"
          >
            <Shirt className="w-5 h-5" />
            <span>Change Dress</span>
          </Button>
          <Button
            onClick={() => navigate('/image-enhancer')}
            variant="outline"
            className="glass-button py-6 flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            <span>Image Enhancer</span>
          </Button>
        </motion.div>

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
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
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
                      onClick={() => setShowEnhanceDialog(index)}
                      className="glass-button"
                      disabled={enhancingIndex === index}
                    >
                      <Sparkles className="w-4 h-4" />
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
                  {enhancingIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Enhancing...</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {image.prompt}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Edit Dialog */}
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

        {/* Photo Edit Dialog */}
        <Dialog open={showPhotoEdit} onOpenChange={setShowPhotoEdit}>
          <DialogContent className="glass-premium">
            <DialogHeader>
              <DialogTitle>Photo Edit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="photo-upload">Upload Photo</Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoEditFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="photo-edit-prompt">Edit Instructions (any language)</Label>
                <Textarea
                  id="photo-edit-prompt"
                  value={photoEditPrompt}
                  onChange={(e) => setPhotoEditPrompt(e.target.value)}
                  placeholder="Describe how you want to edit this photo..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handlePhotoEdit}
                  disabled={!photoEditFile || !photoEditPrompt.trim() || isPhotoEditing}
                  className="flex-1"
                >
                  {isPhotoEditing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Editing...
                    </>
                  ) : (
                    "Edit Photo"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPhotoEdit(false)}
                  disabled={isPhotoEditing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Face Swap Dialog */}
        <Dialog open={showFaceSwap} onOpenChange={setShowFaceSwap}>
          <DialogContent className="glass-premium">
            <DialogHeader>
              <DialogTitle>Face Swap</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="original-face">Upload Original Photo</Label>
                <Input
                  id="original-face"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setOriginalFaceFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="target-face">Upload Target Face</Label>
                <Input
                  id="target-face"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTargetFaceFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleFaceSwap}
                  disabled={!originalFaceFile || !targetFaceFile || isFaceSwapping}
                  className="flex-1"
                >
                  {isFaceSwapping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Swapping...
                    </>
                  ) : (
                    "Swap Face"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFaceSwap(false)}
                  disabled={isFaceSwapping}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Dress Dialog */}
        <Dialog open={showChangeDress} onOpenChange={setShowChangeDress}>
          <DialogContent className="glass-premium">
            <DialogHeader>
              <DialogTitle>Change Dress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dress-photo">Upload Photo</Label>
                <Input
                  id="dress-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDressPhotoFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="dress-prompt">Describe the New Dress (any language)</Label>
                <Textarea
                  id="dress-prompt"
                  value={dressPrompt}
                  onChange={(e) => setDressPrompt(e.target.value)}
                  placeholder="E.g., red evening gown, casual blue jeans with white shirt..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleChangeDress}
                  disabled={!dressPhotoFile || !dressPrompt.trim() || isChangingDress}
                  className="flex-1"
                >
                  {isChangingDress ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Dress"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChangeDress(false)}
                  disabled={isChangingDress}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhancement Dialog */}
        <Dialog open={showEnhanceDialog !== null} onOpenChange={(open) => !open && setShowEnhanceDialog(null)}>
          <DialogContent className="glass-premium max-w-md">
            <DialogHeader>
              <DialogTitle>Enhance Image Quality</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="block mb-3">Select Resolution</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HD', '2K', '4K'] as const).map((res) => (
                    <Button
                      key={res}
                      variant={selectedResolution === res ? 'default' : 'outline'}
                      onClick={() => setSelectedResolution(res)}
                      className="glass-button"
                    >
                      {res}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedResolution === 'HD' && 'HD: 1920x1080 crystal clear quality'}
                  {selectedResolution === '2K' && '2K: 2560x1440 exceptional sharpness'}
                  {selectedResolution === '4K' && '4K: 3840x2160 ultra-high definition'}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <Label className="font-medium">Face Clean</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remove blemishes while preserving facial structure
                  </p>
                </div>
                <Button
                  variant={faceClean ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFaceClean(!faceClean)}
                  className="ml-3"
                >
                  {faceClean ? 'ON' : 'OFF'}
                </Button>
              </div>
              <Button
                onClick={() => showEnhanceDialog !== null && enhanceImage(images[showEnhanceDialog].url, showEnhanceDialog)}
                disabled={enhancingIndex !== null}
                className="w-full glass-button"
              >
                {enhancingIndex !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing to {selectedResolution}...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance to {selectedResolution}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}