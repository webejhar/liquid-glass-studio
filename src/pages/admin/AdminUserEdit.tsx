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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";

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
    if (!user) return;

    setSaving(true);
    try {
      console.log("Updating user approval status:", {
        userId: user.user_id,
        currentStatus: user.approval_status,
        accountType: user.account_type
      });

      // Update user profile with approval status
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
        console.error("Error updating approval status:", updateError);
        throw updateError;
      }

      console.log("User approval status updated successfully");

      // Verify the update
      const { data: verifyData } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", userId)
        .single();

      console.log("Verified approval status in database:", verifyData?.approval_status);

      // Send email notification if approval status was changed to approved or rejected
      if (user.approval_status === 'approved' || user.approval_status === 'rejected') {
        try {
          await supabase.functions.invoke('send-approval-notification', {
            body: {
              userEmail: user.email,
              userName: user.name,
              accountType: user.account_type === 'service_provider' ? 'Service Provider' : 
                          user.account_type === 'client' ? 'Client' : 'General User',
              status: user.approval_status,
            },
          });
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
          // Don't block the success flow if email fails
        }
      }

      const statusMessage = user.approval_status === 'approved' 
        ? "User approved successfully. They can now log in immediately."
        : user.approval_status === 'rejected'
        ? "User rejected successfully."
        : "User information has been saved.";

      toast({
        title: "User updated successfully",
        description: statusMessage,
      });

      navigate("/admin/users");
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error updating user",
        description: error.message,
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
      </div>
    </AdminLayout>
  );
};

export default AdminUserEdit;
