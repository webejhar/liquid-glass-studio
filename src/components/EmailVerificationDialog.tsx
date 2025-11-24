import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onVerify: (code: string) => void;
  onResend: () => void;
  email: string;
  isLoading: boolean;
}

export const EmailVerificationDialog = ({
  isOpen,
  onVerify,
  onResend,
  email,
  isLoading
}: EmailVerificationDialogProps) => {
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isOpen && resendCooldown === 0) {
      setResendCooldown(30);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    onResend();
    setResendCooldown(30);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="glass-premium max-w-sm sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">
            Verify Your Email
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4">
          <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-semibold mb-6">{email}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code" className="text-sm">Enter Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="mt-2 text-center text-2xl tracking-widest"
                required
              />
            </div>
            
            <Button
              type="submit"
              variant="liquid"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleResend}
              disabled={isLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
