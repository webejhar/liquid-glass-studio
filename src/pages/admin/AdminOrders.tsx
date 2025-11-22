import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const AdminOrders = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [productOrders, setProductOrders] = useState<any[]>([]);
  const [domainOrders, setDomainOrders] = useState<any[]>([]);
  const [meetingBookings, setMeetingBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const [products, domains, meetings] = await Promise.all([
        supabase.from("product_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("domain_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("meeting_bookings").select("*").order("created_at", { ascending: false }),
      ]);

      setProductOrders(products.data || []);
      setDomainOrders(domains.data || []);
      setMeetingBookings(meetings.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (table: "product_orders" | "domain_orders" | "meeting_bookings", id: string, status: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Order status changed to ${status}`,
      });

      fetchOrders();
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
          <h1 className="text-4xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">View and manage all orders and bookings</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Product Orders</TabsTrigger>
            <TabsTrigger value="domains">Domain Orders</TabsTrigger>
            <TabsTrigger value="meetings">Meeting Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.product_name}</TableCell>
                        <TableCell>
                          <div>
                            <div>{order.buyer_name || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">{order.buyer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>${order.product_price}</TableCell>
                        <TableCell>{order.payment_method}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus("product_orders", order.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
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
          </TabsContent>

          <TabsContent value="domains">
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>TLD</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.domain_name}</TableCell>
                        <TableCell>
                          <div>
                            <div>{order.buyer_name || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">{order.buyer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.tld}</TableCell>
                        <TableCell>{order.payment_method}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus("domain_orders", order.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
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
          </TabsContent>

          <TabsContent value="meetings">
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-6">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.phone || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(booking.meeting_date).toLocaleDateString()} at {booking.meeting_time}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={booking.status}
                            onValueChange={(value) =>
                              updateOrderStatus("meeting_bookings", booking.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
