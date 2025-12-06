import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Globe, 
  Puzzle,
  Palette,
  Calendar, 
  CreditCard, 
  Filter, 
  RefreshCw, 
  Info,
  Download,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  id: string;
  type: 'product' | 'domain';
  name: string;
  date: string;
  price: number;
  payment_method: string;
  payment_reference: string;
  status: string;
  quantity?: number;
  category?: string;
  buyer_name?: string;
  buyer_email: string;
  plugin_file_path?: string;
}

interface OrdersSectionProps {
  orders: Order[];
  sortBy: string;
  onSortChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const OrdersSection = ({
  orders,
  sortBy,
  onSortChange,
  onRefresh,
  isRefreshing
}: OrdersSectionProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusDisplay = (status: string) => {
    if (status === 'pending') return 'Pending';
    if (status === 'completed') return 'Confirmed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'completed') return 'bg-green-500/20 text-green-400';
    if (status === 'cancelled') return 'bg-red-500/20 text-red-400';
    return 'bg-muted/20 text-muted-foreground';
  };

  const getCategoryIcon = (type: string, category?: string) => {
    if (type === 'domain') return <Globe className="w-4 h-4" />;
    if (category?.toLowerCase().includes('plugin')) return <Puzzle className="w-4 h-4" />;
    if (category?.toLowerCase().includes('theme')) return <Palette className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const getCategoryLabel = (type: string, category?: string) => {
    if (type === 'domain') return 'Domain';
    if (category?.toLowerCase().includes('plugin')) return 'Plugin';
    if (category?.toLowerCase().includes('theme')) return 'Theme';
    return category || 'Product';
  };

  // Filter orders by category
  const filteredOrders = activeCategory === "all" 
    ? orders 
    : orders.filter(order => {
        if (activeCategory === "domains") return order.type === "domain";
        if (activeCategory === "plugins") return order.category?.toLowerCase().includes('plugin');
        if (activeCategory === "themes") return order.category?.toLowerCase().includes('theme');
        return order.type === "product";
      });

  // Count orders by category
  const domainCount = orders.filter(o => o.type === 'domain').length;
  const pluginCount = orders.filter(o => o.category?.toLowerCase().includes('plugin')).length;
  const themeCount = orders.filter(o => o.category?.toLowerCase().includes('theme')).length;
  const productCount = orders.filter(o => o.type === 'product' && !o.category?.toLowerCase().includes('plugin') && !o.category?.toLowerCase().includes('theme')).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Order History</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="gap-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="glass-card w-full grid grid-cols-5 gap-1 p-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="domains" className="text-xs sm:text-sm gap-1">
            <Globe className="w-3 h-3 hidden sm:inline" />
            Domains ({domainCount})
          </TabsTrigger>
          <TabsTrigger value="plugins" className="text-xs sm:text-sm gap-1">
            <Puzzle className="w-3 h-3 hidden sm:inline" />
            Plugins ({pluginCount})
          </TabsTrigger>
          <TabsTrigger value="themes" className="text-xs sm:text-sm gap-1">
            <Palette className="w-3 h-3 hidden sm:inline" />
            Themes ({themeCount})
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm gap-1">
            <Package className="w-3 h-3 hidden sm:inline" />
            Others ({productCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <p className="text-sm sm:text-base text-muted-foreground">
            {activeCategory === "all" ? "No orders yet" : `No ${activeCategory} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass-card p-4 sm:p-5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedOrder(order);
                setShowOrderDetails(true);
              }}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                  {/* Category Icon */}
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                    {getCategoryIcon(order.type, order.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base break-words flex-1">{order.name}</h3>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs gap-1">
                        {getCategoryIcon(order.type, order.category)}
                        {getCategoryLabel(order.type, order.category)}
                      </Badge>
                      <Badge className={`${getStatusColor(order.status)} text-xs`}>
                        {getStatusDisplay(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {order.payment_method}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-primary text-lg">${order.price}</span>
                  {order.status === 'completed' && order.plugin_file_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(order.plugin_file_path, '_blank');
                      }}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="glass-premium max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedOrder && getCategoryIcon(selectedOrder.type, selectedOrder.category)}
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Product</p>
                  <p className="font-semibold">{selectedOrder.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="outline" className="gap-1 mt-1">
                    {getCategoryIcon(selectedOrder.type, selectedOrder.category)}
                    {getCategoryLabel(selectedOrder.type, selectedOrder.category)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDateTime(selectedOrder.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-primary">${selectedOrder.price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusDisplay(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Transaction Reference</p>
                  <p className="font-mono text-sm break-all">{selectedOrder.payment_reference}</p>
                </div>
              </div>
              
              {selectedOrder.status === 'completed' && selectedOrder.plugin_file_path && (
                <Button
                  className="w-full gap-2"
                  onClick={() => window.open(selectedOrder.plugin_file_path, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  Download Product
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
