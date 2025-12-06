import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, DollarSign, Eye, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PaymentReceipt } from "./PaymentReceipt";

interface Receipt {
  id: string;
  receipt_number: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference: string;
  payment_type: string | null;
  order_type: string | null;
  status: string | null;
  admin_fee: number | null;
  provider_amount: number | null;
  created_at: string;
  project_id: string | null;
  order_id: string | null;
}

interface UserReceiptsProps {
  userId: string;
}

export const UserReceipts = ({ userId }: UserReceiptsProps) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadReceipts();
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", userId)
        .single();
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_receipts")
        .select("*")
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error("Error loading receipts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = !searchQuery || 
      receipt.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || receipt.payment_type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string | null) => {
    const styles: Record<string, string> = {
      completed: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      failed: "bg-red-500/20 text-red-400"
    };
    return styles[status || "pending"] || styles.pending;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Payment Receipts
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-48"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No payment receipts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReceipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              className="glass-card p-4 rounded-xl hover:border-primary/50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm">{receipt.receipt_number}</span>
                    <Badge className={getStatusBadge(receipt.status)}>
                      {receipt.status || "pending"}
                    </Badge>
                    {receipt.payment_type && (
                      <Badge variant="outline" className="text-xs">
                        {receipt.payment_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {receipt.currency} {receipt.amount.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(receipt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReceipt(receipt);
                      setShowReceiptModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <PaymentReceipt
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceipt(null);
          }}
          receipt={{
            receipt_number: selectedReceipt.receipt_number,
            payer_name: profile?.name || "User",
            amount: selectedReceipt.amount,
            currency: selectedReceipt.currency || "USD",
            payment_method: selectedReceipt.payment_method,
            payment_reference: selectedReceipt.payment_reference,
            payment_type: selectedReceipt.payment_type || "payment",
            status: selectedReceipt.status || "pending",
            admin_fee: selectedReceipt.admin_fee || 0,
            provider_amount: selectedReceipt.provider_amount || 0,
            created_at: selectedReceipt.created_at
          }}
        />
      )}
    </div>
  );
};