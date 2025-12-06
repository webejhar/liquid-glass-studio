import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectReviewProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  reviewType: 'client_to_provider' | 'provider_to_client';
  onSuccess: () => void;
}

export const ProjectReview = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  reviewerId,
  revieweeId,
  revieweeName,
  reviewType,
  onSuccess
}: ProjectReviewProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("project_reviews").insert({
        project_id: projectId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        review_text: reviewText.trim() || null,
        review_type: reviewType
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("You have already reviewed this project");
        } else {
          throw error;
        }
        return;
      }

      // Notify the reviewee
      await supabase.rpc('create_user_notification', {
        p_user_id: revieweeId,
        p_title: 'New Review Received',
        p_message: `You received a ${rating}-star review for "${projectTitle}"`,
        p_type: 'review',
        p_reference_id: projectId
      });

      toast.success("Review submitted successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select rating";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium max-w-md">
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
          <DialogDescription>
            Share your experience working on "{projectTitle}"
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-sm font-medium">
              {getRatingText(hoverRating || rating)}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Your Review (Optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience working with this person..."
              rows={4}
              maxLength={1000}
              className="glass-card resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full gap-2"
            disabled={isSubmitting || rating === 0}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
