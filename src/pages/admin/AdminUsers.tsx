import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const AdminUsers = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const generalUsers = filteredUsers.filter(u => u.account_type === 'general');
  const serviceProviders = filteredUsers.filter(u => u.account_type === 'service_provider');
  const clients = filteredUsers.filter(u => u.account_type === 'client');
  const pendingUsers = filteredUsers.filter(u => 
    (u.account_type === 'service_provider' || u.account_type === 'client') && 
    u.approval_status === 'pending'
  );

  const renderUserTable = (usersList: Profile[], categoryTitle: string) => (
    <Card className="backdrop-blur-xl bg-background/60 border-border/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{categoryTitle}</span>
          <Badge variant="outline">{usersList.length} users</Badge>
        </CardTitle>
      </CardHeader>
      <div className="px-6 pb-6">
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
                {usersList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.account_number || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.approval_status === "approved"
                            ? "default"
                            : user.approval_status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {user.approval_status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/users/${user.user_id}`)}
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">All Users</h1>
          <p className="text-muted-foreground">Total registered users: {filteredUsers.length}</p>
        </div>

        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6 mb-6">
          <div className="flex items-center gap-4">
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
        </Card>

        {pendingUsers.length > 0 && (
          <Card className="backdrop-blur-xl bg-background/60 border-border/50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Pending Approval</span>
                <Badge variant="destructive">{pendingUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="rounded-lg border border-border/50 overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Account ID</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.account_type === 'service_provider' ? 'Provider' : 'Client'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.account_number || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/users/${user.user_id}`)}
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </Card>
        )}

        {renderUserTable(generalUsers, "General Users")}
        {renderUserTable(serviceProviders, "Service Providers")}
        {renderUserTable(clients, "Clients")}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;