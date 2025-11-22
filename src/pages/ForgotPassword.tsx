import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      // Notify admins about password reset request
      await supabase.functions.invoke("send-password-reset-notification", {
        body: {
          userEmail: email,
          timestamp: new Date().toISOString(),
        },
      });

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-premium p-8 rounded-2xl text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login">
              <Button variant="liquid" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="glass-premium p-8 rounded-2xl">
          <motion.h1
            className="text-4xl font-bold mb-2 text-glow"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Forgot Password?
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Enter your email and we'll send you a reset link
          </motion.p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-2"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                variant="liquid"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <Link to="/login" className="text-muted-foreground hover:text-primary">
              Back to Login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
