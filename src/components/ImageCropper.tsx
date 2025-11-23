import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
}

export const ImageCropper = ({ isOpen, onClose, imageFile, onCropComplete }: ImageCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (imageFile) {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        setImage(img);
        // Calculate initial scale to fit the image
        const minScale = Math.max(1080 / img.width, 1080 / img.height);
        setScale(minScale);
        // Center the image
        setPosition({
          x: (1080 - img.width * minScale) / 2,
          y: (1080 - img.height * minScale) / 2
        });
      };
      
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
  }, [image, scale, position]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 1080, 1080);
    
    // Draw image
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale
    );

    // Draw crop overlay
    ctx.strokeStyle = 'rgba(51, 187, 238, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 1080, 1080);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Failed to crop image");
        return;
      }

      const croppedFile = new File([blob], imageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      onCropComplete(croppedFile);
      onClose();
    }, 'image/jpeg', 0.95);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-glow">Crop Profile Picture</DialogTitle>
          <p className="text-muted-foreground">
            Adjust the image to fit the 1080x1080 square. Drag to reposition, use slider to zoom.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1080}
                className="cursor-move max-w-full h-auto"
                style={{ width: '400px', height: '400px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="liquid" onClick={handleCrop}>
              Crop & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
