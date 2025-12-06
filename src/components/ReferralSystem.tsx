import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, DollarSign, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReferralSystemProps {
  userId: string;
}

interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  rewards_earned: number;
  is_active: boolean;
}

export const ReferralSystem = ({ userId }: ReferralSystemProps) => {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadReferralCode();
  }, [userId]);

  const loadReferralCode = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setReferralCode(data);
    } catch (error) {
      console.error("Error loading referral code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReferralCode = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("referral_codes")
        .insert([{ user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      setReferralCode(data);
      toast.success("Referral code created!");
    } catch (error: any) {
      console.error("Error creating referral code:", error);
      toast.error(error.message || "Failed to create referral code");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (referralCode) {
      const referralLink = `${window.location.origin}/register?ref=${referralCode.code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    }
  };

  const shareReferral = () => {
    if (referralCode && navigator.share) {
      navigator.share({
        title: 'Join our platform!',
        text: 'Sign up using my referral code and we both get rewards!',
        url: `${window.location.origin}/register?ref=${referralCode.code}`
      });
    } else {
      copyToClipboard();
    }
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
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        Referral Program
      </h3>

      {!referralCode ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl text-center"
        >
          <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h4 className="text-xl font-semibold mb-2">Start Earning Rewards</h4>
          <p className="text-muted-foreground mb-4">
            Share your referral code with friends and earn rewards when they sign up!
          </p>
          <Button onClick={createReferralCode} disabled={isCreating} className="gap-2">
            <Gift className="w-4 h-4" />
            {isCreating ? "Creating..." : "Get My Referral Code"}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Referral Code Card */}
          <div className="glass-card p-6 rounded-xl">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold tracking-wider text-primary">
                  {referralCode.code}
                </span>
                <Button onClick={copyToClipboard} variant="ghost" size="icon">
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/register?ref=${referralCode.code}`}
                readOnly
                className="text-sm"
              />
              <Button onClick={shareReferral} className="gap-1 shrink-0">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-xl text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{referralCode.uses_count}</p>
              <p className="text-sm text-muted-foreground">Referrals</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">${referralCode.rewards_earned.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Earned</p>
            </div>
          </div>

          {/* How it works */}
          <div className="glass-card p-4 rounded-xl">
            <h4 className="font-semibold mb-3">How it works</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Share your referral link with friends</p>
              <p>2. They sign up using your link</p>
              <p>3. When they complete their first project, you both earn $5</p>
            </div>
          </div>

          <Badge className={referralCode.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
            {referralCode.is_active ? "Active" : "Inactive"}
          </Badge>
        </motion.div>
      )}
    </div>
  );
};
