import { motion } from "framer-motion";
import { useState } from "react";
import { Download, Loader2, ArrowLeft, Upload, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ImageEnhancer() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'HD' | '2K' | '4K'>('HD');
  const [faceClean, setFaceClean] = useState(false);
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setEnhancedImage(null);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const enhanceImage = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsEnhancing(true);
    try {
      toast.info(`Enhancing to ${selectedResolution}...`);

      const { data, error } = await supabase.functions.invoke('enhance-image', {
        body: {
          imageUrl: uploadedImage,
          resolution: selectedResolution,
          faceClean
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        if (error.message.includes("429")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message.includes("402")) {
          toast.error("AI usage limit reached. Please contact support.");
        } else {
          toast.error("Failed to enhance image");
        }
        return;
      }

      if (data?.imageUrl) {
        setEnhancedImage(data.imageUrl);
        toast.success(`Image enhanced to ${selectedResolution}!`);
        setShowEnhanceDialog(false);
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error(error.message || 'Failed to enhance image');
    } finally {
      setIsEnhancing(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      toast.info("Preparing download...");
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `enhanced-image-${selectedResolution}.png`;
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

  const resetUpload = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setSelectedResolution('HD');
    setFaceClean(false);
  };

  return (
    <div className="min-h-screen pt-8 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
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
          Image <span className="text-primary">Enhancer</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enhance your images to HD, 2K, or 4K resolution with optional face cleaning
        </motion.p>

        {/* Upload Section */}
        {!uploadedImage ? (
          <motion.div
            className="glass-card p-12 rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Upload className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Upload Your Image</h2>
            <p className="text-muted-foreground mb-6">
              Upload an image to enhance its quality and resolution
            </p>
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 font-medium">
                <Upload className="w-5 h-5" />
                Choose Image
              </div>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Label>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Image Preview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Original Image
                </h3>
                <div className="relative group">
                  <img
                    src={uploadedImage}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              {/* Enhanced Image */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Enhanced Image
                </h3>
                {enhancedImage ? (
                  <div className="relative group">
                    <img
                      src={enhancedImage}
                      alt="Enhanced"
                      className="w-full rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => downloadImage(enhancedImage)}
                        className="glass-button"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                      {selectedResolution}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-secondary/50 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Enhanced image will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhancement Controls */}
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center">Enhancement Settings</h3>
              
              <div className="space-y-6">
                {/* Resolution Selection */}
                <div>
                  <Label className="block mb-3 text-lg font-medium">Select Resolution</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['HD', '2K', '4K'] as const).map((res) => (
                      <Button
                        key={res}
                        variant={selectedResolution === res ? 'default' : 'outline'}
                        onClick={() => setSelectedResolution(res)}
                        className="glass-button py-6 text-lg"
                      >
                        {res}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3 p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">
                      {selectedResolution === 'HD' && '✨ HD: 1920x1080 - Crystal clear quality with sharp details'}
                      {selectedResolution === '2K' && '✨ 2K: 2560x1440 - Exceptional sharpness with vibrant details'}
                      {selectedResolution === '4K' && '✨ 4K: 3840x2160 - Ultra-high definition with lossless quality'}
                    </p>
                  </div>
                </div>

                {/* Face Clean Toggle */}
                <div className="flex items-center justify-between p-6 rounded-lg bg-secondary/50">
                  <div className="flex-1">
                    <Label className="text-lg font-medium block mb-2">Face Clean</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove blemishes and imperfections from faces while preserving facial structure and features
                    </p>
                  </div>
                  <Button
                    variant={faceClean ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setFaceClean(!faceClean)}
                    className="ml-6 min-w-[100px]"
                  >
                    {faceClean ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={enhanceImage}
                    disabled={isEnhancing}
                    className="flex-1 glass-button py-6 text-lg"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enhancing to {selectedResolution}...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Enhance to {selectedResolution}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    className="glass-button py-6 px-8 text-lg"
                    disabled={isEnhancing}
                  >
                    Upload New
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6 rounded-xl text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Lossless Quality</h4>
                <p className="text-sm text-muted-foreground">
                  Maintains original image integrity with no compression artifacts
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Face Preservation</h4>
                <p className="text-sm text-muted-foreground">
                  Keeps facial structure and features completely unchanged
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Auto-Delete</h4>
                <p className="text-sm text-muted-foreground">
                  All images automatically deleted from server after 30 minutes
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
