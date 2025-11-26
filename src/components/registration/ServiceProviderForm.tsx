import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Upload } from "lucide-react";

interface ServiceProviderFormProps {
  onSuccess: () => void;
}

const CATEGORIES = [
  "Web Development",
  "Digital Marketing",
  "Web Design",
  "UI/UX Design",
  "Graphics Design",
  "Video Editing",
  "Content Writing",
  "SEO Expert",
  "Others"
];

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

export const ServiceProviderForm = ({ onSuccess }: ServiceProviderFormProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([
    { platform: "", url: "" }
  ]);
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
    if (!validateSocialLinks()) return;

    setLoading(true);

    try {
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
        let cvUrl = "";
        
        if (cvFile) {
          const fileExt = cvFile.name.split('.').pop();
          const filePath = `${authData.user.id}/cv.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(filePath, cvFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(filePath);

          cvUrl = publicUrl;
        }

        const finalCategory = category === "Others" ? customCategory : category;

        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            name,
            email,
            phone,
            account_type: 'service_provider',
            category: finalCategory,
            cv_url: cvUrl,
            social_media_links: socialLinks,
            approval_status: 'pending',
          });

        if (profileError) throw profileError;

        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: email,
            userName: name,
            accountType: 'service_provider',
            status: 'pending',
          },
        });

        toast({
          title: "Success!",
          description: "Your account is pending for approval. You will receive an email once approved.",
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
      if (!category) {
        toast({ title: "Error", description: "Please select a category", variant: "destructive" });
        return;
      }
      if (category === "Others" && !customCategory) {
        toast({ title: "Error", description: "Please enter your category", variant: "destructive" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!cvFile) {
        toast({ title: "Error", description: "Please upload your CV", variant: "destructive" });
        return;
      }
      setStep(4);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">Step {step} of 4</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
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
            <Label>Service Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select your category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {category === "Others" && (
            <div className="space-y-2">
              <Label>Write Your Category</Label>
              <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Enter your category" required />
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload CV</Label>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {cvFile ? cvFile.name : "Click to upload CV (PDF, JPG, PNG, DOCX)"}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
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
        {step < 4 ? (
          <Button type="button" onClick={handleNext} className="flex-1">
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} className="flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};
