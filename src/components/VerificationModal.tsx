import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onVerificationComplete: () => void;
}

export const VerificationModal = ({ isOpen, onClose, profileId, onVerificationComplete }: VerificationModalProps) => {
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'nid' | 'face') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      if (type === 'nid') setNidFile(file);
      else setFaceFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!nidFile || !faceFile) {
      toast.error("Please upload both NID and face verification images");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload NID
      const nidExt = nidFile.name.split('.').pop();
      const nidPath = `${user.id}/nid-${Date.now()}.${nidExt}`;
      const { error: nidError } = await supabase.storage
        .from('nid-documents')
        .upload(nidPath, nidFile);

      if (nidError) throw nidError;

      const { data: { publicUrl: nidUrl } } = supabase.storage
        .from('nid-documents')
        .getPublicUrl(nidPath);

      // Upload Face Photo
      const faceExt = faceFile.name.split('.').pop();
      const facePath = `${user.id}/face-${Date.now()}.${faceExt}`;
      const { error: faceError } = await supabase.storage
        .from('nid-documents')
        .upload(facePath, faceFile);

      if (faceError) throw faceError;

      const { data: { publicUrl: faceUrl } } = supabase.storage
        .from('nid-documents')
        .getPublicUrl(facePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nid_url: nidUrl,
          face_verification_url: faceUrl,
          verification_status: 'pending'
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      toast.success("Verification documents uploaded successfully! Pending admin review.");
      onVerificationComplete();
      onClose();
      setNidFile(null);
      setFaceFile(null);
    } catch (error: any) {
      console.error("Verification upload error:", error);
      toast.error(error.message || "Failed to upload verification documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nid">National ID / Passport</Label>
            <div className="glass-card p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition">
              <input
                id="nid"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'nid')}
                className="hidden"
              />
              <label
                htmlFor="nid"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                {nidFile ? (
                  <>
                    <Check className="w-8 h-8 text-green-500" />
                    <span className="text-sm text-center">{nidFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload NID</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="face">Face Verification Photo</Label>
            <div className="glass-card p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition">
              <input
                id="face"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'face')}
                className="hidden"
              />
              <label
                htmlFor="face"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                {faceFile ? (
                  <>
                    <Check className="w-8 h-8 text-green-500" />
                    <span className="text-sm text-center">{faceFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload your photo</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!nidFile || !faceFile || uploading}
            variant="liquid"
            className="w-full"
          >
            {uploading ? "Uploading..." : "Submit Verification"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
