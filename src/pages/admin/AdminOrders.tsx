import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CheckCircle, XCircle, Clock, Eye, EyeOff, Search, Trash2, Filter } from "lucide-react";

const AdminOrders = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [productOrders, setProductOrders] = useState<any[]>([]);
  const [domainOrders, setDomainOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeen, setFilterSeen] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      console.log('Admin: Fetching all orders...');
      
      const [products, domains] = await Promise.all([
        supabase.from("product_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("domain_orders").select("*").order("created_at", { ascending: false }),
      ]);

      if (products.error) {
        console.error('Error fetching product orders:', products.error);
        throw products.error;
      }
      if (domains.error) {
        console.error('Error fetching domain orders:', domains.error);
        throw domains.error;
      }

      console.log('Admin: Product orders loaded:', products.data?.length || 0);
      console.log('Admin: Domain orders loaded:', domains.data?.length || 0);

      setProductOrders(products.data || []);
      setDomainOrders(domains.data || []);
    } catch (error: any) {
      console.error('Admin: Error fetching orders:', error);
      toast({
        title: "Error fetching orders",
        description: error.message || "Failed to load orders. Please check your admin permissions.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (table: "product_orders" | "domain_orders", id: string, status: string) => {
    try {
      // If completed status, check if plugin file path exists
      if (status === 'completed' && table === 'product_orders') {
        const order = productOrders.find(o => o.id === id);
        if (!order?.plugin_file_path) {
          toast({
            title: "Cannot complete order",
            description: "Please upload the plugin file before marking as completed.",
            variant: "destructive",
          });
          return;
        }
      }

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

  const handleFileUpload = async (orderId: string, file: File) => {
    try {
      // Upload file to public plugins folder simulation (using Supabase storage in production)
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}.${fileExt}`;
      const filePath = `/plugins/${fileName}`;
      
      // In production, upload to Supabase storage
      // For now, we'll just store the path reference
      const { error } = await supabase
        .from('product_orders')
        .update({ plugin_file_path: filePath })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "File uploaded",
        description: "Plugin file has been uploaded successfully.",
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsSeen = async (table: "product_orders" | "domain_orders", id: string, isSeen: boolean) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_seen: isSeen } as any)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: isSeen ? "Marked as seen" : "Marked as unseen",
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

  const deleteOrder = async (table: "product_orders" | "domain_orders", id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Order deleted",
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error deleting order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProductOrders = productOrders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSeen = filterSeen === "all" || 
      (filterSeen === "seen" ? order.is_seen : !order.is_seen);
    const matchesSearch = !searchQuery || 
      order.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeen && matchesSearch;
  });

  const filteredDomainOrders = domainOrders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSeen = filterSeen === "all" || 
      (filterSeen === "seen" ? order.is_seen : !order.is_seen);
    const matchesSearch = !searchQuery || 
      order.domain_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeen && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "secondary" | "default" | "destructive" | "outline"; label: string }> = {
      pending: { icon: Clock, variant: "secondary", label: "Pending" },
      confirmed: { icon: CheckCircle, variant: "default", label: "Confirmed" },
      completed: { icon: CheckCircle, variant: "outline", label: "Completed" },
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

        {/* Filters */}
        <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeen} onValueChange={setFilterSeen}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Seen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="seen">Seen</SelectItem>
                <SelectItem value="unseen">Unseen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              Products ({filteredProductOrders.length})
            </TabsTrigger>
            <TabsTrigger value="domains" className="text-xs sm:text-sm">
              Domains ({filteredDomainOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="backdrop-blur-xl bg-background/60 border-border/50 p-3 sm:p-4 md:p-6">
              <div className="rounded-lg border border-border/50 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Seen</TableHead>
                      <TableHead className="min-w-[120px]">Product</TableHead>
                      <TableHead className="min-w-[150px]">Buyer</TableHead>
                      <TableHead className="min-w-[80px]">Price</TableHead>
                      <TableHead className="min-w-[120px]">Payment</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductOrders.map((order) => (
                      <TableRow key={order.id} className={!order.is_seen ? "bg-primary/5" : ""}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsSeen("product_orders", order.id, !order.is_seen)}
                            className="h-8 w-8"
                          >
                            {order.is_seen ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-yellow-500" />
                            )}
                          </Button>
                        </TableCell>
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
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* File Upload */}
                            {!order.plugin_file_path ? (
                              <div>
                                <input
                                  type="file"
                                  accept=".zip"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(order.id, file);
                                  }}
                                  className="text-xs w-24"
                                />
                              </div>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">Uploaded</Badge>
                            )}
                            
                            {/* Status Selector */}
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                updateOrderStatus("product_orders", order.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteOrder("product_orders", order.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                      <TableHead className="w-10">Seen</TableHead>
                      <TableHead className="min-w-[150px]">Domain</TableHead>
                      <TableHead className="min-w-[150px]">Buyer</TableHead>
                      <TableHead className="min-w-[60px]">TLD</TableHead>
                      <TableHead className="min-w-[120px]">Payment</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Date</TableHead>
                      <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDomainOrders.map((order) => (
                      <TableRow key={order.id} className={!order.is_seen ? "bg-primary/5" : ""}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsSeen("domain_orders", order.id, !order.is_seen)}
                            className="h-8 w-8"
                          >
                            {order.is_seen ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-yellow-500" />
                            )}
                          </Button>
                        </TableCell>
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
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                updateOrderStatus("domain_orders", order.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteOrder("domain_orders", order.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
