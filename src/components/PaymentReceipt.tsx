import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, CreditCard, DollarSign, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    receipt_number: string;
    project_title?: string;
    product_name?: string;
    payer_name: string;
    payee_name?: string;
    amount: number;
    currency: string;
    payment_method: string;
    payment_reference: string;
    payment_type: string;
    status: string;
    admin_fee?: number;
    provider_amount?: number;
    created_at: string;
  };
}

export const PaymentReceipt = ({ isOpen, onClose, receipt }: PaymentReceiptProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create receipt content for download
    const receiptContent = `
=====================================
        PAYMENT RECEIPT
=====================================

Receipt Number: ${receipt.receipt_number}
Date: ${new Date(receipt.created_at).toLocaleString()}

-------------------------------------
TRANSACTION DETAILS
-------------------------------------

${receipt.project_title ? `Project: ${receipt.project_title}` : ''}
${receipt.product_name ? `Product: ${receipt.product_name}` : ''}

Payer: ${receipt.payer_name}
${receipt.payee_name ? `Payee: ${receipt.payee_name}` : ''}

Payment Type: ${receipt.payment_type?.replace('_', ' ').toUpperCase() || 'FULL'}
Payment Method: ${receipt.payment_method?.toUpperCase()}
Reference: ${receipt.payment_reference}

-------------------------------------
AMOUNT BREAKDOWN
-------------------------------------

Total Amount: ${receipt.currency} ${receipt.amount.toFixed(2)}
${receipt.admin_fee ? `Platform Fee (5%): ${receipt.currency} ${receipt.admin_fee.toFixed(2)}` : ''}
${receipt.provider_amount ? `Provider Amount: ${receipt.currency} ${receipt.provider_amount.toFixed(2)}` : ''}

Status: ${receipt.status?.toUpperCase()}

-------------------------------------

Thank you for using our platform!
For support: support@webejhar.com

=====================================
    `.trim();

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receipt_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Receipt Header */}
          <div className="text-center p-4 glass-card rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-lg font-semibold text-green-500">Payment Confirmed</span>
            </div>
            <p className="text-sm text-muted-foreground">{receipt.receipt_number}</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            {(receipt.project_title || receipt.product_name) && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Item</p>
                  <p className="font-medium">{receipt.project_title || receipt.product_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{new Date(receipt.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Payer</p>
                <p className="font-medium">{receipt.payer_name}</p>
              </div>
            </div>

            {receipt.payee_name && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Payee</p>
                  <p className="font-medium">{receipt.payee_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{receipt.payment_method}</p>
                <p className="text-xs text-muted-foreground">Ref: {receipt.payment_reference}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount Breakdown */}
          <div className="glass-card p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold text-lg">
                {receipt.currency} {receipt.amount.toFixed(2)}
              </span>
            </div>
            
            {receipt.admin_fee !== undefined && receipt.admin_fee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Platform Fee (5%)</span>
                <span className="text-red-400">-{receipt.currency} {receipt.admin_fee.toFixed(2)}</span>
              </div>
            )}
            
            {receipt.provider_amount !== undefined && receipt.provider_amount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Provider Amount</span>
                <span className="text-green-400">{receipt.currency} {receipt.provider_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground">Status</span>
              <Badge className={
                receipt.status === 'completed' || receipt.status === 'paid' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }>
                {receipt.status?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full gap-2"
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Downloading..." : "Download Receipt"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
