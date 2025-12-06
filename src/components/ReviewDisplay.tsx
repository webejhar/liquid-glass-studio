import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Flag, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  review_type: string;
  created_at: string;
  reviewer?: {
    name: string | null;
    avatar_url: string | null;
    account_type: string | null;
  };
  project?: {
    project_title: string;
  };
}

interface ReviewDisplayProps {
  userId: string;
  showTitle?: boolean;
}

export const ReviewDisplay = ({ userId, showTitle = true }: ReviewDisplayProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
    getCurrentUser();
  }, [userId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("project_reviews")
        .select("*")
        .eq("reviewee_id", userId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get reviewer details and project info
      const reviewsWithDetails = await Promise.all(
        (data || []).map(async (review) => {
          const [{ data: reviewer }, { data: project }] = await Promise.all([
            supabase
              .from("profiles")
              .select("name, avatar_url, account_type")
              .eq("user_id", review.reviewer_id)
              .single(),
            supabase
              .from("projects")
              .select("project_title")
              .eq("id", review.project_id)
              .single()
          ]);
          return { ...review, reviewer, project };
        })
      );

      setReviews(reviewsWithDetails);
      
      // Calculate average
      if (reviewsWithDetails.length > 0) {
        const avg = reviewsWithDetails.reduce((sum, r) => sum + r.rating, 0) / reviewsWithDetails.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error("Please login to report");
      return;
    }

    try {
      await supabase.from("report_content").insert({
        reporter_id: currentUserId,
        content_type: 'review',
        content_id: reviewId,
        reason: 'Inappropriate content'
      });
      toast.success("Review reported. We'll review it shortly.");
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error("Failed to report review");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="font-medium">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 glass-card rounded-xl">
          <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="glass-card p-4 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(review.reviewer?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{review.reviewer?.name || "Anonymous"}</span>
                      {review.reviewer?.account_type && (
                        <Badge variant="outline" className="text-xs">
                          {review.reviewer.account_type === 'service_provider' ? 'Provider' : 
                           review.reviewer.account_type === 'client' ? 'Client' : 'User'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.project && (
                      <p className="text-xs text-primary mt-1">
                        Project: {review.project.project_title}
                      </p>
                    )}
                    {review.review_text && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {review.review_text}
                      </p>
                    )}
                  </div>
                </div>

                {currentUserId && currentUserId !== review.reviewer_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleReport(review.id)}>
                        <Flag className="w-4 h-4 mr-2" />
                        Report Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
