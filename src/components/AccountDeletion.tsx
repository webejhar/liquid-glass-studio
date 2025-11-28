import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AccountDeletionProps {
  userId: string;
  userEmail: string;
}

export const AccountDeletion = ({ userId, userEmail }: AccountDeletionProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRequest = () => {
    if (!deleteReason.trim()) {
      toast.error("Please provide a reason for deleting your account");
      return;
    }
    setShowDeleteDialog(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete user's data from various tables
      const deletePromises = [
        supabase.from('cart_items').delete().eq('user_id', userId),
        supabase.from('favorites').delete().eq('user_id', userId),
        supabase.from('chat_messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from('friend_requests').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from('login_sessions').delete().eq('user_id', userId),
        supabase.from('user_notifications').delete().eq('user_id', userId),
        supabase.from('project_messages').delete().eq('sender_id', userId),
        supabase.from('projects').delete().or(`client_id.eq.${userId},provider_id.eq.${userId}`),
        supabase.from('user_roles').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('user_id', userId),
      ];

      await Promise.all(deletePromises);

      // Log the deletion reason for admin records
      await supabase.rpc('create_admin_notification', {
        p_title: 'User Account Deleted',
        p_message: `User ${userEmail} deleted their account. Reason: ${deleteReason}`,
        p_type: 'account_deletion'
      });

      // Sign out the user
      await supabase.auth.signOut();

      toast.success("Your account has been deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account. Please contact support.");
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6 rounded-xl border border-destructive/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-destructive/20">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
              All your data, projects, messages, and files will be permanently removed.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Reason Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-premium">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Why do you want to delete your account?
            </DialogTitle>
            <DialogDescription>
              Please tell us why you're leaving. This helps us improve our service.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRequest}
                className="flex-1"
                disabled={!deleteReason.trim()}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="glass-premium">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              No, Keep My Account
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Deleting...
                </span>
              ) : (
                "Yes, Delete My Account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
