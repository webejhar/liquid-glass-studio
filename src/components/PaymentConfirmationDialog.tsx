import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PaymentConfirmationDialog = ({
  isOpen,
  onConfirm,
  onCancel
}: PaymentConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="glass-premium max-w-sm sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">
            Confirm Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4 sm:py-6">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
            Are you sure your payment is complete?
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Please confirm that you have successfully sent the payment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full text-sm sm:text-base"
            >
              No, Go Back
            </Button>
            <Button
              onClick={onConfirm}
              variant="liquid"
              className="w-full text-sm sm:text-base"
            >
              Yes, Complete Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
