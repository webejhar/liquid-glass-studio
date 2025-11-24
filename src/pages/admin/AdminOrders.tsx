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

  useEffect(() => {
    fetchOrders();
  }, []);

  // Realtime subscriptions for orders
  useEffect(() => {
    // Subscribe to product orders changes
    const productOrdersChannel = supabase
      .channel('admin-product-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to domain orders changes
    const domainOrdersChannel = supabase
      .channel('admin-domain-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'domain_orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productOrdersChannel);
      supabase.removeChannel(domainOrdersChannel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const [products, domains] = await Promise.all([
        supabase.from("product_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("domain_orders").select("*").order("created_at", { ascending: false }),
      ]);

      setProductOrders(products.data || []);
      setDomainOrders(domains.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (table: "product_orders" | "domain_orders", id: string, status: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      // Send email notification
      let orderData;
      let type = "";
      
      if (table === "product_orders") {
        orderData = productOrders.find(o => o.id === id);
        type = "order";
      } else {
        orderData = domainOrders.find(o => o.id === id);
        type = "domain";
      }

      if (orderData) {
        await supabase.functions.invoke("send-status-change-email", {
          body: {
            type,
            status,
            recipientEmail: orderData.buyer_email,
            recipientName: orderData.buyer_name,
            details: orderData,
          },
        });
      }

      toast({
        title: "Status updated",
        description: `Order status changed to ${status} and notification sent`,
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Order Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage all orders</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
            <TabsTrigger value="domains" className="text-xs sm:text-sm">Domains</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-3 sm:p-4 md:p-6">
              <div className="rounded-lg border border-border/50 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Product</TableHead>
                      <TableHead className="min-w-[150px]">Buyer</TableHead>
                      <TableHead className="min-w-[80px]">Price</TableHead>
                      <TableHead className="min-w-[120px]">Payment</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.product_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-xs sm:text-sm">{order.buyer_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{order.buyer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>${order.product_price}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{order.payment_method}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus("product_orders", order.id, value)
                            }
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
          </TabsContent>

          <TabsContent value="domains">
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-3 sm:p-4 md:p-6">
              <div className="rounded-lg border border-border/50 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Domain</TableHead>
                      <TableHead className="min-w-[150px]">Buyer</TableHead>
                      <TableHead className="min-w-[60px]">TLD</TableHead>
                      <TableHead className="min-w-[120px]">Payment</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.domain_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-xs sm:text-sm">{order.buyer_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{order.buyer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.tld}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{order.payment_method}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus("domain_orders", order.id, value)
                            }
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
