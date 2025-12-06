import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle, XCircle, Flag, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text: string | null;
  review_type: string;
  is_approved: boolean;
  created_at: string;
  reviewer?: { name: string | null; email: string | null };
  reviewee?: { name: string | null; email: string | null };
  project?: { project_title: string };
}

export default function AdminReviews() {
  useAdminAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterApproval, setFilterApproval] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, [filterApproval]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("project_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterApproval === "approved") {
        query = query.eq("is_approved", true);
      } else if (filterApproval === "pending") {
        query = query.eq("is_approved", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user and project details
      const reviewsWithDetails = await Promise.all(
        (data || []).map(async (review) => {
          const [{ data: reviewer }, { data: reviewee }, { data: project }] = await Promise.all([
            supabase.from("profiles").select("name, email").eq("user_id", review.reviewer_id).single(),
            supabase.from("profiles").select("name, email").eq("user_id", review.reviewee_id).single(),
            supabase.from("projects").select("project_title").eq("id", review.project_id).single()
          ]);
          return { ...review, reviewer, reviewee, project };
        })
      );

      setReviews(reviewsWithDetails);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (reviewId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("project_reviews")
        .update({ is_approved: approved })
        .eq("id", reviewId);

      if (error) throw error;
      toast.success(approved ? "Review approved!" : "Review rejected!");
      loadReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;

    try {
      const { error } = await supabase
        .from("project_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      toast.success("Review deleted!");
      loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6" />
            Reviews Management
          </h1>
          <Select value={filterApproval} onValueChange={setFilterApproval}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="glass-card p-4 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderStars(review.rating)}
                      <Badge className={review.is_approved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      <Badge variant="outline">
                        {review.review_type === 'client_to_provider' ? 'Client → Provider' : 'Provider → Client'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{review.review_text || "No text provided"}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        From: {review.reviewer?.name || review.reviewer?.email || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        To: {review.reviewee?.name || review.reviewee?.email || 'Unknown'}
                      </span>
                      <span>Project: {review.project?.project_title || 'Unknown'}</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button onClick={() => setSelectedReview(review)} size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {!review.is_approved && (
                      <Button onClick={() => handleApproval(review.id, true)} size="sm" className="gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                    )}
                    {review.is_approved && (
                      <Button onClick={() => handleApproval(review.id, false)} size="sm" variant="outline" className="gap-1">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    )}
                    <Button onClick={() => handleDelete(review.id)} size="sm" variant="destructive">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Review Detail Modal */}
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="glass-premium max-w-md">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {renderStars(selectedReview.rating)}
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <p className="text-sm">{selectedReview.review_text || "No review text"}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>From:</strong> {selectedReview.reviewer?.name || selectedReview.reviewer?.email}</p>
                  <p><strong>To:</strong> {selectedReview.reviewee?.name || selectedReview.reviewee?.email}</p>
                  <p><strong>Project:</strong> {selectedReview.project?.project_title}</p>
                  <p><strong>Type:</strong> {selectedReview.review_type === 'client_to_provider' ? 'Client to Provider' : 'Provider to Client'}</p>
                  <p><strong>Date:</strong> {new Date(selectedReview.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
