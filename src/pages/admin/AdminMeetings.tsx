import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const AdminMeetings = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [meetingBookings, setMeetingBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMeetingBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching meetings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateMeetingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("meeting_bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      const booking = meetingBookings.find((b) => b.id === id);
      if (booking) {
        await supabase.functions.invoke("send-status-change-email", {
          body: {
            type: "booking",
            status,
            recipientEmail: booking.email,
            recipientName: booking.name,
            details: booking,
          },
        });
      }

      toast({
        title: "Status updated",
        description: `Meeting status changed to ${status} and notification sent`,
      });

      fetchMeetings();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "secondary" | "default" | "destructive"; label: string }> = {
      pending: { icon: Clock, variant: "secondary", label: "Pending" },
      confirmed: { icon: CheckCircle, variant: "default", label: "Confirmed" },
      rejected: { icon: XCircle, variant: "destructive", label: "Rejected" },
    };

    const statusConfig = config[status] || config.pending;
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Meeting Bookings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage all meeting bookings</p>
        </div>

        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-3 sm:p-4 md:p-6">
          <div className="rounded-lg border border-border/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Phone</TableHead>
                  <TableHead className="min-w-[180px]">Date & Time</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{booking.email}</TableCell>
                    <TableCell>{booking.phone || "N/A"}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(booking.meeting_date).toLocaleDateString()} at {booking.meeting_time}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateMeetingStatus(booking.id, value)}
                      >
                        <SelectTrigger className="w-[110px] sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
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

export default AdminMeetings;
