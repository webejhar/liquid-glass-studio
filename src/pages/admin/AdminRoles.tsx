import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, UserCog } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
}

const AdminRoles = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<(UserRole & { profile?: Profile })[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [managerData, setManagerData] = useState({ email: "", password: "", name: "", role: "moderator" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserRoles();
    fetchProfiles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data for each user
      const rolesWithProfiles = await Promise.all(
        (data || []).map(async (role) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", role.user_id)
            .single();

          return { ...role, profile };
        })
      );

      setUserRoles(rolesWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error fetching roles",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_roles").insert([{
        user_id: selectedUserId,
        role: selectedRole as "admin" | "moderator" | "user",
      }]);

      if (error) throw error;

      toast({
        title: "Role assigned",
        description: "User role has been assigned successfully",
      });

      setDialogOpen(false);
      setSelectedUserId("");
      setSelectedRole("");
      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "Error assigning role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Role removed",
        description: "User role has been removed successfully",
      });

      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateManager = async () => {
    if (!managerData.email || !managerData.password) {
      toast({
        title: "Missing fields",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("create-manager", {
        body: managerData,
      });

      if (error) throw error;

      toast({
        title: "Manager created",
        description: "New manager account has been created successfully",
      });

      setManagerDialogOpen(false);
      setManagerData({ email: "", password: "", name: "", role: "moderator" });
      fetchUserRoles();
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Error creating manager",
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Role Management</h1>
            <p className="text-muted-foreground">Assign and manage user roles</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" variant="secondary">
                  <UserCog className="w-4 h-4" />
                  Create Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Manager Account</DialogTitle>
                  <DialogDescription>
                    Create a new manager or moderator account with restricted permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="managerEmail">Email *</Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      placeholder="manager@example.com"
                      value={managerData.email}
                      onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerPassword">Password *</Label>
                    <Input
                      id="managerPassword"
                      type="password"
                      placeholder="Enter secure password"
                      value={managerData.password}
                      onChange={(e) => setManagerData({ ...managerData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerName">Name</Label>
                    <Input
                      id="managerName"
                      placeholder="Manager Name"
                      value={managerData.name}
                      onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerRole">Role</Label>
                    <Select 
                      value={managerData.role} 
                      onValueChange={(value) => setManagerData({ ...managerData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleCreateManager}
                    disabled={loading || !managerData.email || !managerData.password}
                    className="w-full"
                  >
                    {loading ? "Creating..." : "Create Manager"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Assign Role
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>
                  Select a user and assign them a role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.name || profile.email || "Unnamed User"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAssignRole}
                  disabled={loading || !selectedUserId || !selectedRole}
                  className="w-full"
                >
                  {loading ? "Assigning..." : "Assign Role"}
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell className="font-medium">
                      {userRole.profile?.name || "N/A"}
                    </TableCell>
                    <TableCell>{userRole.profile?.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          userRole.role === "admin"
                            ? "default"
                            : userRole.role === "moderator"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {userRole.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userRole.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRole(userRole.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;
