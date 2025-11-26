import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, ExternalLink, Check, X } from "lucide-react";

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
}

const AdminPendingApproval = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("service_provider");

  useEffect(() => {
    fetchPendingUsers();
    
    // Subscribe to changes in profiles table
    const channel = supabase
      .channel('pending-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchPendingUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.account_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in('account_type', ['service_provider', 'client'])
        .eq('approval_status', 'pending')
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching pending users",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveReject = async (userId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      // Get user details first
      const { data: userProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      // Update approval status
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status })
        .eq("user_id", userId);

      if (error) throw error;

      // Send email notification
      if (userProfile) {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: userProfile.email,
            userName: userProfile.name,
            accountType: userProfile.account_type === 'service_provider' ? 'Service Provider' : 'Client',
            status: status,
          },
        });
      }

      toast({
        title: status === 'approved' ? "Account Approved" : "Account Rejected",
        description: `User account has been ${status}. Email notification sent.`,
      });

      fetchPendingUsers();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const serviceProviders = filteredUsers.filter(u => u.account_type === 'service_provider');
  const clients = filteredUsers.filter(u => u.account_type === 'client');

  const renderUserTable = (usersList: Profile[]) => (
    <div className="rounded-lg border border-border/50 overflow-x-auto">
      <div className="min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Account ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No pending approvals
                </TableCell>
              </TableRow>
            ) : (
              usersList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.account_number || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {user.approval_status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsDialog(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleApproveReject(user.user_id, 'approved')}
                        disabled={loading}
                        title="Approve"
                        className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleApproveReject(user.user_id, 'rejected')}
                        disabled={loading}
                        title="Reject"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Pending Approval</h1>
          <p className="text-muted-foreground">Review and approve pending user accounts</p>
        </div>

        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or account ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="service_provider">
                Service Providers ({serviceProviders.length})
              </TabsTrigger>
              <TabsTrigger value="client">
                Clients ({clients.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="service_provider">
              {renderUserTable(serviceProviders)}
            </TabsContent>

            <TabsContent value="client">
              {renderUserTable(clients)}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account ID</p>
                  <Badge variant="outline">{selectedUser.account_number || "N/A"}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <Badge>{selectedUser.account_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {selectedUser.account_type === 'service_provider' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedUser.category || "N/A"}</p>
                  </div>
                  {selectedUser.cv_url && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">CV Document</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedUser.cv_url!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View CV
                      </Button>
                    </div>
                  )}
                </>
              )}

              {selectedUser.account_type === 'client' && selectedUser.nid_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">NID Document</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedUser.nid_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View NID
                  </Button>
                </div>
              )}

              {(selectedUser.account_type === 'service_provider' || selectedUser.account_type === 'client') && selectedUser.social_media_links && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Social Media Links</p>
                  <div className="space-y-2">
                    {Array.isArray(selectedUser.social_media_links) && selectedUser.social_media_links.map((link: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline">{link.platform}</Badge>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                          {link.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Approval Status</p>
                <Badge variant="secondary">
                  {selectedUser.approval_status || "N/A"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPendingApproval;
