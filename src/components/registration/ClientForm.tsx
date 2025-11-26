import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Upload } from "lucide-react";

interface ClientFormProps {
  onSuccess: () => void;
}

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X (Twitter)",
  "Fiverr",
  "Upwork",
  "Freelancer.com",
  "Behance",
  "Dribbble",
  "Github",
  "Portfolio Website",
  "Others"
];

export const ClientForm = ({ onSuccess }: ClientFormProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([
    { platform: "", url: "" }
  ]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const validateSocialLinks = () => {
    const platforms = socialLinks.map(link => link.platform).filter(p => p);
    const uniquePlatforms = new Set(platforms);
    
    if (platforms.length !== uniquePlatforms.size) {
      toast({
        title: "Error",
        description: "Duplicate platforms are not allowed",
        variant: "destructive",
      });
      return false;
    }

    if (socialLinks.some(link => !link.platform || !link.url)) {
      toast({
        title: "Error",
        description: "Please fill all social media fields",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!policyAccepted) {
      toast({
        title: "Error",
        description: "You must accept the payment policy to continue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate email
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, approval_status")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.approval_status === 'pending') {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists and is waiting for admin approval. Please wait for your approval.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please login instead.",
            variant: "destructive",
          });
        }
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name, phone },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        let nidUrl = "";
        
        if (nidFile) {
          const fileExt = nidFile.name.split('.').pop();
          const filePath = `${authData.user.id}/nid.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('nid-documents')
            .upload(filePath, nidFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('nid-documents')
            .getPublicUrl(filePath);

          nidUrl = publicUrl;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            name,
            email,
            phone,
            account_type: 'client',
            nid_url: nidUrl,
            social_media_links: socialLinks,
            approval_status: 'pending',
            payment_policy_accepted: true,
          });

        if (profileError) throw profileError;

        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: email,
            userName: name,
            accountType: 'Client',
            status: 'pending',
          },
        });

        toast({
          title: "Success!",
          description: "Your Client account is pending admin approval. Please wait for review.",
        });

        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || !email || !phone || !password || !confirmPassword) {
        toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!nidFile) {
        toast({ title: "Error", description: "Please upload your NID", variant: "destructive" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!validateSocialLinks()) return;
      setShowPolicyModal(true);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload NID</Label>
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNidFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="nid-upload"
                />
                <label htmlFor="nid-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {nidFile ? nidFile.name : "Click to upload NID (JPG, PNG, PDF)"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Label>Social Media Links</Label>
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Select value={link.platform} onValueChange={(value) => updateSocialLink(index, 'platform', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Enter URL"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  />
                </div>
                {socialLinks.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={addSocialLink}>
              <Plus className="w-4 h-4 mr-2" />
              Add More
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button type="button" onClick={handleNext} className="flex-1">
            Next
          </Button>
        </div>
      </div>

      <Dialog open={showPolicyModal} onOpenChange={setShowPolicyModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Any service order requires advance payment to the website. Payment will be held by the website and released to the Service Provider after job completion.
            </p>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="policy"
                checked={policyAccepted}
                onCheckedChange={(checked) => setPolicyAccepted(checked as boolean)}
              />
              <label htmlFor="policy" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to these terms and conditions
              </label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!policyAccepted || loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
