import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function CvDownloadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "cv_file_url")
        .maybeSingle();
      if (data?.setting_value) {
        const val = typeof data.setting_value === "string" ? data.setting_value.replace(/^"|"$/g, "") : String(data.setting_value);
        if (val && val !== "null" && val !== "") setCvUrl(val);
      }
    };
    if (open) load();
  }, [open]);

  if (viewing && cvUrl) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setViewing(false); } onOpenChange(v); }}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <Button variant="ghost" size="sm" onClick={() => setViewing(false)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <span className="text-sm text-muted-foreground">CV Preview</span>
          </div>
          <iframe src={cvUrl} className="w-full flex-1 h-full" title="CV Preview" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Download CV
          </DialogTitle>
          <DialogDescription>
            Would you like to download the CV or view it first?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setViewing(true)}
            disabled={!cvUrl}
            className="gap-2"
          >
            <Eye className="w-4 h-4" /> View CV
          </Button>
          <Button
            onClick={() => {
              if (cvUrl) {
                const a = document.createElement("a");
                a.href = cvUrl;
                a.download = "CV-Rahatul-Islam.pdf";
                a.target = "_blank";
                a.click();
              }
              onOpenChange(false);
            }}
            disabled={!cvUrl}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
        </DialogFooter>
        {!cvUrl && (
          <p className="text-xs text-muted-foreground text-center">CV not uploaded yet.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
