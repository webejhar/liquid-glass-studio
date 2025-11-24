import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, CheckCircle, XCircle, Clock } from "lucide-react";

interface ProfileVerification {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  nid_url: string | null;
  face_verification_url: string | null;
  verification_status: string;
  verification_notes: string | null;
  created_at: string;
}

const AdminVerification = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<ProfileVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<ProfileVerification | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchVerifications();

    // Real-time subscription for verification updates
    const channel = supabase
      .channel('admin-verification-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile verification updated:', payload);
          fetchVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .not("nid_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching verifications",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateVerificationStatus = async (userId: string, status: string, notes: string) => {
    try {
      console.log('Updating verification:', { userId, status, notes });
      
      const { data, error } = await supabase
        .from("profiles")
        .update({ 
          verification_status: status,
          verification_notes: notes 
        })
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error('Verification update error:', error);
        toast({
          title: "Error updating verification",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log('Verification updated successfully:', data);

      if (data && data.length > 0) {
        toast({
          title: "Verification updated successfully",
          description: `Status changed to ${status}`,
        });
        
        // Refresh the list and close dialog
        await fetchVerifications();
        setShowDetailsDialog(false);
      } else {
        toast({
          title: "Warning",
          description: "No profile was updated. Please check the user exists.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error in updateVerificationStatus:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "secondary" | "default" | "destructive"; label: string }> = {
      pending: { icon: Clock, variant: "secondary", label: "Pending" },
      verified: { icon: CheckCircle, variant: "default", label: "Verified" },
      rejected: { icon: XCircle, variant: "destructive", label: "Rejected" },
      unverified: { icon: Clock, variant: "secondary", label: "Unverified" },
    };

    const statusConfig = config[status] || config.unverified;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">User Verification</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and manage user verification submissions</p>
        </div>

        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-3 sm:p-4 md:p-6">
          <div className="rounded-lg border border-border/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Submitted</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell className="font-medium">{verification.name || "N/A"}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{verification.email || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(verification.verification_status)}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVerification(verification);
                          setVerificationNotes(verification.verification_notes || "");
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>Review verification documents and update status</DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedVerification.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-xs sm:text-sm">{selectedVerification.email || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                {getStatusBadge(selectedVerification.verification_status)}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">NID Document</p>
                  {selectedVerification.nid_url ? (
                    <a 
                      href={selectedVerification.nid_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={selectedVerification.nid_url} 
                        alt="NID" 
                        className="max-w-full h-auto rounded-lg border border-border/50 hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No NID uploaded</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Face Verification</p>
                  {selectedVerification.face_verification_url ? (
                    <a 
                      href={selectedVerification.face_verification_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={selectedVerification.face_verification_url} 
                        alt="Face Verification" 
                        className="max-w-full h-auto rounded-lg border border-border/50 hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No face verification uploaded</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                  <Select
                    value={selectedVerification.verification_status}
                    onValueChange={(value) => {
                      setSelectedVerification({
                        ...selectedVerification,
                        verification_status: value,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about this verification..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() =>
                    updateVerificationStatus(
                      selectedVerification.user_id,
                      selectedVerification.verification_status,
                      verificationNotes
                    )
                  }
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVerification;
