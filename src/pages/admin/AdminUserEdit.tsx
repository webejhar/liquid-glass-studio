import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Trash2, AlertTriangle } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  account_type: 'general' | 'service_provider' | 'client';
  account_number: string | null;
  category: string | null;
  cv_url: string | null;
  nid_url: string | null;
  social_media_links: any;
  approval_status: string | null;
  created_at: string | null;
  bio: string | null;
  address: string | null;
  profession: string | null;
}

const AdminUserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error: any) {
      toast({
        title: "Error fetching user",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !userId) return;

    setSaving(true);
    try {
      // Step 1: Update the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: user.name,
          phone: user.phone,
          bio: user.bio,
          address: user.address,
          profession: user.profession,
          approval_status: user.approval_status,
        })
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      // Step 2: Verify the update worked
      const { data: verifiedData, error: verifyError } = await supabase
        .from("profiles")
        .select("approval_status, name, email, account_type")
        .eq("user_id", userId)
        .single();

      if (verifyError || !verifiedData) {
        throw new Error("Failed to verify database update");
      }

      if (verifiedData.approval_status !== user.approval_status) {
        throw new Error("Approval status did not update correctly in database");
      }

      // Step 3: Send email notification for approval/rejection
      if (user.approval_status === 'approved' || user.approval_status === 'rejected') {
        try {
          const accountTypeLabel = 
            user.account_type === 'service_provider' ? 'Service Provider' : 
            user.account_type === 'client' ? 'Client' : 'General User';

          await supabase.functions.invoke('send-approval-notification', {
            body: {
              userEmail: verifiedData.email,
              userName: verifiedData.name,
              accountType: accountTypeLabel,
              status: user.approval_status,
            },
          });
        } catch (emailError) {
          console.error("Email notification failed (non-critical):", emailError);
        }
      }

      // Step 4: Show success message
      const successMessage = 
        user.approval_status === 'approved' 
          ? "User has been approved successfully. They can now log in to their account."
          : user.approval_status === 'rejected'
          ? "User has been rejected."
          : "User information has been updated.";

      toast({
        title: "Success",
        description: successMessage,
      });

      // Step 5: Navigate back to users list
      navigate("/admin/users");
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Edit User</h1>
            <p className="text-muted-foreground">Update user information and approval status</p>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={user.name || ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Read Only)</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account ID (Read Only)</Label>
                <Input
                  id="account_number"
                  value={user.account_number || ""}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type (Read Only)</Label>
                <Badge variant="outline" className="w-fit">
                  {user.account_type === 'general' ? 'General' : 
                   user.account_type === 'service_provider' ? 'Service Provider' : 
                   'Client'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_status">Approval Status</Label>
                <Select
                  value={user.approval_status || "pending"}
                  onValueChange={(value) => setUser({ ...user, approval_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user.account_type === 'service_provider' && (
                <div className="space-y-2">
                  <Label>Category (Read Only)</Label>
                  <Input value={user.category || "N/A"} disabled />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={user.profession || ""}
                  onChange={(e) => setUser({ ...user, profession: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={user.address || ""}
                onChange={(e) => setUser({ ...user, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={user.bio || ""}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                rows={4}
              />
            </div>

            {user.account_type === 'service_provider' && user.cv_url && (
              <div className="space-y-2">
                <Label>CV Document</Label>
                <Button
                  variant="outline"
                  onClick={() => window.open(user.cv_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View CV
                </Button>
              </div>
            )}

            {user.account_type === 'client' && user.nid_url && (
              <div className="space-y-2">
                <Label>NID Documents</Label>
                <div className="flex gap-2">
                  {user.nid_url.split('|').map((url, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View NID {index === 0 ? 'Front' : 'Back'}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(user.account_type === 'service_provider' || user.account_type === 'client') && 
             user.social_media_links && Array.isArray(user.social_media_links) && (
              <div className="space-y-2">
                <Label>Social Media Links</Label>
                <div className="space-y-2">
                  {user.social_media_links.map((link: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{link.platform}</Badge>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="border-t border-destructive/30 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete this user account and all associated data including orders, projects, messages, and files.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User Account
              </Button>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="glass-premium">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Delete User Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the user account
                and all associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="glass-card p-4 rounded-lg my-4">
              <p className="font-semibold">{user?.name || "Unknown User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-2">
                {user?.account_type === 'general' ? 'General' : 
                 user?.account_type === 'service_provider' ? 'Service Provider' : 
                 'Client'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              The following data will be deleted:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mb-4">
              <li>Profile and account information</li>
              <li>All orders (products, domains)</li>
              <li>All projects and project messages</li>
              <li>Chat messages and friend requests</li>
              <li>Favorites and cart items</li>
              <li>Login sessions and notifications</li>
            </ul>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );

  async function handleDeleteUser() {
    if (!userId || !user) return;

    setIsDeleting(true);
    try {
      // Delete all user data in order
      const deleteOperations = [
        supabase.from("project_messages").delete().eq("sender_id", userId),
        supabase.from("chat_messages").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from("friend_requests").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from("user_notifications").delete().eq("user_id", userId),
        supabase.from("login_sessions").delete().eq("user_id", userId),
        supabase.from("cart_items").delete().eq("user_id", userId),
        supabase.from("favorites").delete().eq("user_id", userId),
        supabase.from("product_orders").delete().eq("user_id", userId),
        supabase.from("domain_orders").delete().eq("user_id", userId),
        supabase.from("projects").delete().or(`client_id.eq.${userId},provider_id.eq.${userId}`),
        supabase.from("user_purchases").delete().eq("user_id", userId),
        supabase.from("user_roles").delete().eq("user_id", userId),
        supabase.from("profiles").delete().eq("user_id", userId),
      ];

      for (const operation of deleteOperations) {
        await operation;
      }

      toast({
        title: "User Deleted",
        description: `${user.name || "User"} has been permanently deleted.`,
      });

      navigate("/admin/users");
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }
};

export default AdminUserEdit;
