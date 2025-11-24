import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onVerificationComplete: () => void;
}

type QualityLevel = "bad" | "good" | "very-good" | null;

interface ImageData {
  file: File | null;
  preview: string | null;
  quality: QualityLevel;
}

export const VerificationModal = ({ isOpen, onClose, profileId, onVerificationComplete }: VerificationModalProps) => {
  const [nidFront, setNidFront] = useState<ImageData>({ file: null, preview: null, quality: null });
  const [nidBack, setNidBack] = useState<ImageData>({ file: null, preview: null, quality: null });
  const [facePhoto, setFacePhoto] = useState<ImageData>({ file: null, preview: null, quality: null });
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"nid-front" | "nid-back" | "face" | "review">("nid-front");

  const analyzeImageQuality = async (file: File): Promise<QualityLevel> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          resolve("bad");
          return;
        }

        // Calculate sharpness using Laplacian variance
        const data = imageData.data;
        let sum = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          sum += gray;
          count++;
        }

        const mean = sum / count;
        let variance = 0;

        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          variance += Math.pow(gray - mean, 2);
        }

        variance = variance / count;

        // Quality thresholds
        if (variance < 100) resolve("bad");
        else if (variance < 500) resolve("good");
        else resolve("very-good");
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "nid-front" | "nid-back" | "face") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const preview = URL.createObjectURL(file);
    const quality = await analyzeImageQuality(file);

    const imageData = { file, preview, quality };

    if (type === "nid-front") {
      setNidFront(imageData);
      setCurrentStep("nid-back");
    } else if (type === "nid-back") {
      setNidBack(imageData);
      setCurrentStep("face");
    } else {
      setFacePhoto(imageData);
      setCurrentStep("review");
    }
  };

  const getQualityText = (quality: QualityLevel) => {
    switch (quality) {
      case "bad": return { text: "Bad - Please retake", color: "text-red-500" };
      case "good": return { text: "Good - Acceptable", color: "text-yellow-500" };
      case "very-good": return { text: "Very Good - Excellent!", color: "text-green-500" };
      default: return { text: "", color: "" };
    }
  };

  const handleSubmit = async () => {
    if (!nidFront.file || !nidBack.file || !facePhoto.file) {
      toast.error("Please upload all required documents");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload NID Front
      const nidFrontExt = nidFront.file.name.split('.').pop();
      const nidFrontPath = `${user.id}/nid-front-${Date.now()}.${nidFrontExt}`;
      const { error: nidFrontError } = await supabase.storage
        .from('nid-documents')
        .upload(nidFrontPath, nidFront.file);

      if (nidFrontError) throw nidFrontError;

      const { data: { publicUrl: nidFrontUrl } } = supabase.storage
        .from('nid-documents')
        .getPublicUrl(nidFrontPath);

      // Upload NID Back
      const nidBackExt = nidBack.file.name.split('.').pop();
      const nidBackPath = `${user.id}/nid-back-${Date.now()}.${nidBackExt}`;
      const { error: nidBackError } = await supabase.storage
        .from('nid-documents')
        .upload(nidBackPath, nidBack.file);

      if (nidBackError) throw nidBackError;

      const { data: { publicUrl: nidBackUrl } } = supabase.storage
        .from('nid-documents')
        .getPublicUrl(nidBackPath);

      // Upload Face Photo
      const faceExt = facePhoto.file.name.split('.').pop();
      const facePath = `${user.id}/face-${Date.now()}.${faceExt}`;
      const { error: faceError } = await supabase.storage
        .from('nid-documents')
        .upload(facePath, facePhoto.file);

      if (faceError) throw faceError;

      const { data: { publicUrl: faceUrl } } = supabase.storage
        .from('nid-documents')
        .getPublicUrl(facePath);

      // Update profile with all URLs
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nid_url: `${nidFrontUrl}|${nidBackUrl}`, // Store both URLs separated by |
          face_verification_url: faceUrl,
          verification_status: 'pending'
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast.success("Verification documents uploaded successfully! Pending admin review.");
      onVerificationComplete();
      handleClose();
    } catch (error: any) {
      console.error("Verification upload error:", error);
      toast.error(error.message || "Failed to upload verification documents");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setNidFront({ file: null, preview: null, quality: null });
    setNidBack({ file: null, preview: null, quality: null });
    setFacePhoto({ file: null, preview: null, quality: null });
    setCurrentStep("nid-front");
    onClose();
  };

  const renderUploadBox = (
    id: string,
    label: string,
    imageData: ImageData,
    type: "nid-front" | "nid-back" | "face",
    isActive: boolean
  ) => {
    const qualityInfo = getQualityText(imageData.quality);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor={id}>{label}</Label>
        <div className={`glass-card p-4 rounded-xl border-2 border-dashed transition-all ${
          isActive ? "border-primary/60 hover:border-primary" : "border-border/30"
        }`}>
          <input
            id={id}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, type)}
            className="hidden"
            disabled={!isActive || uploading}
          />
          <label
            htmlFor={id}
            className={`flex flex-col items-center gap-2 ${isActive ? "cursor-pointer" : "cursor-not-allowed"}`}
          >
            {imageData.preview ? (
              <div className="w-full space-y-2">
                <img
                  src={imageData.preview}
                  alt={label}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{imageData.file?.name}</span>
                  </div>
                  {imageData.quality && (
                    <span className={`text-sm font-semibold ${qualityInfo.color}`}>
                      {qualityInfo.text}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center">
                  Click to upload {label.toLowerCase()}
                </span>
              </>
            )}
          </label>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${currentStep === "nid-front" ? "text-primary" : nidFront.file ? "text-green-500" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "nid-front" ? "border-primary bg-primary/10" : nidFront.file ? "border-green-500 bg-green-500/10" : "border-border"}`}>
                {nidFront.file ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm font-medium">NID Front</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-border" />
            <div className={`flex items-center gap-2 ${currentStep === "nid-back" ? "text-primary" : nidBack.file ? "text-green-500" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "nid-back" ? "border-primary bg-primary/10" : nidBack.file ? "border-green-500 bg-green-500/10" : "border-border"}`}>
                {nidBack.file ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className="text-sm font-medium">NID Back</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-border" />
            <div className={`flex items-center gap-2 ${currentStep === "face" ? "text-primary" : facePhoto.file ? "text-green-500" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === "face" ? "border-primary bg-primary/10" : facePhoto.file ? "border-green-500 bg-green-500/10" : "border-border"}`}>
                {facePhoto.file ? <Check className="w-4 h-4" /> : "3"}
              </div>
              <span className="text-sm font-medium">Face Photo</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === "nid-front" && (
              <motion.div
                key="nid-front"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {renderUploadBox("nid-front", "National ID / Passport (Front Side)", nidFront, "nid-front", true)}
                <div className="flex items-start gap-2 mt-4 p-3 glass-card rounded-lg border border-primary/20">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Tips for best quality:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure good lighting</li>
                      <li>Keep document flat and in focus</li>
                      <li>Capture the entire document</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === "nid-back" && (
              <motion.div
                key="nid-back"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {renderUploadBox("nid-front-review", "National ID / Passport (Front Side)", nidFront, "nid-front", false)}
                {renderUploadBox("nid-back", "National ID / Passport (Back Side)", nidBack, "nid-back", true)}
              </motion.div>
            )}

            {currentStep === "face" && (
              <motion.div
                key="face"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {renderUploadBox("nid-front-review2", "National ID / Passport (Front Side)", nidFront, "nid-front", false)}
                {renderUploadBox("nid-back-review", "National ID / Passport (Back Side)", nidBack, "nid-back", false)}
                {renderUploadBox("face", "Face Verification Photo", facePhoto, "face", true)}
                <div className="flex items-start gap-2 mt-4 p-3 glass-card rounded-lg border border-primary/20">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Face photo requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Clear frontal view of your face</li>
                      <li>No sunglasses or face coverings</li>
                      <li>Neutral expression</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Review Your Documents</h3>
                {renderUploadBox("nid-front-final", "National ID / Passport (Front Side)", nidFront, "nid-front", false)}
                {renderUploadBox("nid-back-final", "National ID / Passport (Back Side)", nidBack, "nid-back", false)}
                {renderUploadBox("face-final", "Face Verification Photo", facePhoto, "face", false)}
                
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  variant="liquid"
                  className="w-full mt-6"
                >
                  {uploading ? "Uploading..." : "Submit for Verification"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep !== "review" && (
            <div className="flex gap-2 pt-4">
              {currentStep !== "nid-front" && (
                <Button
                  onClick={() => {
                    if (currentStep === "face") setCurrentStep("nid-back");
                    else if (currentStep === "nid-back") setCurrentStep("nid-front");
                  }}
                  variant="outline"
                  disabled={uploading}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={() => {
                  if (currentStep === "nid-front") setCurrentStep("nid-back");
                  else if (currentStep === "nid-back") setCurrentStep("face");
                  else if (currentStep === "face") setCurrentStep("review");
                }}
                disabled={
                  !nidFront.file && !nidBack.file && !facePhoto.file || uploading
                }
                className="ml-auto"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
