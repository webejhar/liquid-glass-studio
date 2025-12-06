import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Paperclip, FileText, DollarSign, Upload, Download, CreditCard, Image, Video, File, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentConfirmationDialog } from "@/components/PaymentConfirmationDialog";

interface Project {
  id: string;
  provider_id: string;
  client_id: string;
  client_name: string;
  project_title: string;
  project_details: string;
  budget_type: string;
  delivery_time_unit: string;
  delivery_time_value: number;
  advance_percentage: number;
  final_percentage: number;
  final_budget: number | null;
  status: string;
  advance_paid: boolean;
  final_paid: boolean;
  submission_files: string[] | null;
  admin_approved: boolean;
  provider_payment_method?: string;
  provider_payment_id?: string;
}

interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  message: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
}

interface ProjectChatProps {
  project: Project;
  currentUserId: string;
  onBack: () => void;
  onProjectUpdate: () => void;
}

// Currency conversion rate (City Bank rate)
const USD_TO_BDT = 127;

export const ProjectChat = ({ project, currentUserId, onBack, onProjectUpdate }: ProjectChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFinalPaymentModal, setShowFinalPaymentModal] = useState(false);
  const [finalBudget, setFinalBudget] = useState(project.final_budget?.toString() || "");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState<'advance' | 'final' | null>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submissionFileInputRef = useRef<HTMLInputElement>(null);

  const isProvider = currentUserId === project.provider_id;
  const isClient = currentUserId === project.client_id;

  useEffect(() => {
    loadMessages();
    
    const channel = supabase
      .channel(`project-${project.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${project.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("project_messages")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from("project_messages").insert({
        project_id: project.id,
        sender_id: currentUserId,
        message: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `project-files/${project.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      // Determine file type
      let fileType = 'document';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';

      const { error } = await supabase.from("project_messages").insert({
        project_id: project.id,
        sender_id: currentUserId,
        file_url: publicUrl,
        file_type: fileType,
        message: file.name
      });

      if (error) throw error;
      toast.success("File uploaded!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOrderProject = async () => {
    if (!finalBudget || parseFloat(finalBudget) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!paymentReference.trim()) {
      toast.error("Please enter payment reference/transaction ID");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          final_budget: parseFloat(finalBudget),
          status: "in_progress",
          advance_paid: true
        })
        .eq("id", project.id);

      if (error) throw error;

      // Send notification to admin
      await supabase.rpc('create_admin_notification', {
        p_title: 'Project Payment Received',
        p_message: `Advance payment received for project: ${project.project_title}`,
        p_type: 'project_payment',
        p_reference_id: project.id
      });

      toast.success("Order placed! Payment pending admin approval.");
      setShowPaymentModal(false);
      onProjectUpdate();
    } catch (error: any) {
      console.error("Error ordering project:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProject = async () => {
    if (submissionFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setIsLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of submissionFiles) {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${project.id}/${Date.now()}-${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-submissions')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-submissions')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Update project with submission files
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          submission_files: uploadedUrls,
          status: "submitted"
        })
        .eq("id", project.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      // Notify client
      await supabase.rpc('create_user_notification', {
        p_user_id: project.client_id,
        p_title: 'Project Submitted',
        p_message: `Project "${project.project_title}" has been submitted. Please review and make final payment.`,
        p_type: 'project_submitted',
        p_reference_id: project.id
      });

      // Get client email and send email notification
      const { data: clientProfile } = await supabase
        .from("profiles")
        .select("email, name")
        .eq("user_id", project.client_id)
        .single();

      if (clientProfile?.email) {
        await supabase.functions.invoke('send-project-status-email', {
          body: {
            recipientEmail: clientProfile.email,
            recipientName: clientProfile.name || 'Client',
            projectTitle: project.project_title,
            status: 'submitted',
            projectId: project.id
          }
        });
      }

      toast.success("Project submitted successfully!");
      setShowSubmitModal(false);
      setShowSubmitConfirmation(false);
      setSubmissionFiles([]);
      onProjectUpdate();
    } catch (error: any) {
      console.error("Error submitting project:", error);
      toast.error(error.message || "Failed to submit project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalPayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!paymentReference.trim()) {
      toast.error("Please enter payment reference/transaction ID");
      return;
    }

    setIsLoading(true);
    try {
      // Update project - set final_paid but status stays "submitted" until admin approves
      const { error } = await supabase
        .from("projects")
        .update({
          final_paid: true
          // Status will be changed to "completed" when admin approves
        })
        .eq("id", project.id);

      if (error) throw error;

      // Notify admin
      await supabase.rpc('create_admin_notification', {
        p_title: 'Final Payment Received',
        p_message: `Final payment received for project: ${project.project_title}. Pending admin approval.`,
        p_type: 'project_payment',
        p_reference_id: project.id
      });

      // Get provider email and send payment received notification
      const { data: providerProfile } = await supabase
        .from("profiles")
        .select("email, name")
        .eq("user_id", project.provider_id)
        .single();

      if (providerProfile?.email) {
        await supabase.functions.invoke('send-project-status-email', {
          body: {
            recipientEmail: providerProfile.email,
            recipientName: providerProfile.name || 'Provider',
            projectTitle: project.project_title,
            status: 'payment_received',
            projectId: project.id,
            amount: finalAmount
          }
        });
      }

      toast.success("Final payment submitted! Pending admin approval.");
      setShowFinalPaymentModal(false);
      setPaymentConfirmed(false);
      onProjectUpdate();
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string | null) => {
    switch (fileType) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const advanceAmount = project.final_budget 
    ? (project.final_budget * project.advance_percentage / 100) 
    : parseFloat(finalBudget || "0") * project.advance_percentage / 100;
  
  const finalAmount = project.final_budget 
    ? (project.final_budget * project.final_percentage / 100) 
    : 0;

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="glass-card p-4 rounded-t-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-semibold line-clamp-1">{project.project_title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={
                project.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                project.status === "submitted" ? "bg-purple-500/20 text-purple-400" :
                project.status === "completed" ? "bg-green-500/20 text-green-400" :
                "bg-yellow-500/20 text-yellow-400"
              }>
                {project.status.replace("_", " ").toUpperCase()}
              </Badge>
              {project.advance_paid && <Badge className="bg-green-500/20 text-green-400 text-xs">Advance Paid</Badge>}
              {project.admin_approved && <Badge className="bg-primary/20 text-primary text-xs">Admin Approved</Badge>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {isClient && project.status === "accepted" && !project.advance_paid && (
            <Button onClick={() => setShowPaymentModal(true)} size="sm" className="gap-1 flex-1 sm:flex-none">
              <CreditCard className="w-4 h-4" />
              Order Project
            </Button>
          )}
          {isProvider && project.status === "in_progress" && project.admin_approved && (
            <Button onClick={() => setShowSubmitModal(true)} size="sm" className="gap-1 flex-1 sm:flex-none">
              <Upload className="w-4 h-4" />
              Submit Project
            </Button>
          )}
          {isClient && project.status === "submitted" && !project.final_paid && (
            <Button 
              onClick={() => setShowFinalPaymentModal(true)} 
              size="sm" 
              className="gap-1 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
            >
              <DollarSign className="w-4 h-4" />
              Pay Final (${finalAmount.toFixed(2)})
            </Button>
          )}
          {project.submission_files && project.submission_files.length > 0 && (project.final_paid || isProvider) && (
            <Button
              onClick={() => project.submission_files?.forEach(url => window.open(url, '_blank'))}
              size="sm"
              variant="outline"
              className="gap-1 flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              Download Files
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            
            return (
              <motion.div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] ${isMine ? "bg-primary text-primary-foreground" : "glass-card"} p-3 rounded-xl`}>
                  {msg.file_url ? (
                    <div>
                      {msg.file_type === "image" ? (
                        <img 
                          src={msg.file_url} 
                          alt="Shared" 
                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(msg.file_url!, '_blank')}
                        />
                      ) : msg.file_type === "video" ? (
                        <video 
                          src={msg.file_url} 
                          controls 
                          className="max-w-full rounded-lg"
                        />
                      ) : (
                        <a 
                          href={msg.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`flex items-center gap-2 ${isMine ? 'text-primary-foreground' : 'text-primary'} underline`}
                        >
                          {getFileIcon(msg.file_type)}
                          {msg.message || "Download File"}
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  )}
                  <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-4 rounded-b-xl flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="icon"
          disabled={isUploading}
          className="shrink-0"
        >
          {isUploading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={!newMessage.trim() || isLoading} className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Order/Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={(open) => {
        setShowPaymentModal(open);
        if (!open) setPaymentConfirmed(false);
      }}>
        <DialogContent className="glass-premium max-w-md">
          <DialogHeader>
            <DialogTitle>Order Your Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Final Budget (USD) *</Label>
              <Input
                type="number"
                value={finalBudget}
                onChange={(e) => setFinalBudget(e.target.value)}
                placeholder="Enter agreed budget in USD"
                min="1"
              />
            </div>
            
            <div>
              <Label>Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binance">Binance (USD)</SelectItem>
                  <SelectItem value="bkash">bKash (BDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Reference/Transaction ID *</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>

            <div className="glass-card p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Total Budget:</span>
                <span className="font-bold">${parseFloat(finalBudget || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Advance Payment ({project.advance_percentage}%):</span>
                <span className="font-bold">
                  {paymentMethod === 'bkash' 
                    ? `৳${(advanceAmount * USD_TO_BDT).toFixed(2)} BDT`
                    : `$${advanceAmount.toFixed(2)} USD`
                  }
                </span>
              </div>
              {paymentMethod === 'bkash' && (
                <p className="text-xs text-muted-foreground">
                  Rate: 1 USD = {USD_TO_BDT} BDT (City Bank)
                </p>
              )}
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-3 glass-card rounded-lg border border-primary/20">
              <Checkbox 
                id="payment-confirm" 
                checked={paymentConfirmed}
                onCheckedChange={(checked) => setPaymentConfirmed(checked === true)}
              />
              <label htmlFor="payment-confirm" className="text-sm cursor-pointer">
                I confirm that I have completed the payment and the transaction ID is correct.
              </label>
            </div>

            <Button 
              onClick={() => {
                setPendingPaymentAction('advance');
                setShowPaymentConfirmation(true);
              }} 
              disabled={isLoading || !paymentConfirmed} 
              className="w-full"
            >
              {isLoading ? "Processing..." : "Confirm & Pay Advance"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Project Modal - With File Upload */}
      <Dialog open={showSubmitModal} onOpenChange={(open) => {
        setShowSubmitModal(open);
        if (!open) {
          setSubmissionFiles([]);
          setShowSubmitConfirmation(false);
        }
      }}>
        <DialogContent className="glass-premium max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Submit Project</DialogTitle>
          </DialogHeader>
          
          {!showSubmitConfirmation ? (
            <div className="space-y-4 py-2">
              <div>
                <Label>Upload Final Files * (All file types supported)</Label>
                <input
                  type="file"
                  ref={submissionFileInputRef}
                  multiple
                  onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                  className="w-full glass-card p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: Images, Videos, Documents, Archives, and all other file types (Max 50MB per file)
                </p>
              </div>
              
              {submissionFiles.length > 0 && (
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Files to upload ({submissionFiles.length}):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {submissionFiles.map((file, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setShowSubmitConfirmation(true)} 
                disabled={submissionFiles.length === 0} 
                className="w-full"
              >
                Continue to Submit
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Are you sure you have completed this project?</h3>
                <p className="text-sm text-muted-foreground">
                  By submitting, you confirm that all work has been completed according to the project requirements. 
                  The client will be notified and prompted to make the final payment.
                </p>
                <p className="text-xs text-primary">
                  {submissionFiles.length} file(s) will be uploaded
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleSubmitProject} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  {isLoading ? "Uploading & Submitting..." : "Yes, Submit Project"}
                </Button>
                <Button 
                  onClick={() => setShowSubmitConfirmation(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  No, Go Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Final Payment Modal */}
      <Dialog open={showFinalPaymentModal} onOpenChange={(open) => {
        setShowFinalPaymentModal(open);
        if (!open) setPaymentConfirmed(false);
      }}>
        <DialogContent className="glass-premium max-w-md">
          <DialogHeader>
            <DialogTitle>Final Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binance">Binance (USD)</SelectItem>
                  <SelectItem value="bkash">bKash (BDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Reference/Transaction ID *</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>

            <div className="glass-card p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Final Payment ({project.final_percentage}%):</span>
                <span className="font-bold text-green-400">
                  {paymentMethod === 'bkash' 
                    ? `৳${(finalAmount * USD_TO_BDT).toFixed(2)} BDT`
                    : `$${finalAmount.toFixed(2)} USD`
                  }
                </span>
              </div>
              {paymentMethod === 'bkash' && (
                <p className="text-xs text-muted-foreground">
                  Rate: 1 USD = {USD_TO_BDT} BDT (City Bank)
                </p>
              )}
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-3 glass-card rounded-lg border border-primary/20">
              <Checkbox 
                id="final-payment-confirm" 
                checked={paymentConfirmed}
                onCheckedChange={(checked) => setPaymentConfirmed(checked === true)}
              />
              <label htmlFor="final-payment-confirm" className="text-sm cursor-pointer">
                I confirm that I have completed the payment and the transaction ID is correct.
              </label>
            </div>

            <Button 
              onClick={() => {
                setPendingPaymentAction('final');
                setShowPaymentConfirmation(true);
              }} 
              disabled={isLoading || !paymentConfirmed} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Confirm Final Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <PaymentConfirmationDialog
        isOpen={showPaymentConfirmation}
        onConfirm={() => {
          setShowPaymentConfirmation(false);
          if (pendingPaymentAction === 'advance') {
            handleOrderProject();
          } else if (pendingPaymentAction === 'final') {
            handleFinalPayment();
          }
          setPendingPaymentAction(null);
        }}
        onCancel={() => {
          setShowPaymentConfirmation(false);
          setPendingPaymentAction(null);
        }}
      />
    </div>
  );
};
