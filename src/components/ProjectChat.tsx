import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Paperclip, Image, FileText, DollarSign, Upload, Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const ProjectChat = ({ project, currentUserId, onBack, onProjectUpdate }: ProjectChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [finalBudget, setFinalBudget] = useState(project.final_budget?.toString() || "");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${project.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';

      const { error } = await supabase.from("project_messages").insert({
        project_id: project.id,
        sender_id: currentUserId,
        file_url: publicUrl,
        file_type: fileType,
        message: file.name
      });

      if (error) throw error;
      toast.success("File uploaded!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderProject = async () => {
    if (!finalBudget || !paymentMethod || !paymentReference) {
      toast.error("Please fill all payment details");
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
      toast.success("Order placed! Waiting for admin approval.");
      setShowPaymentModal(false);
      onProjectUpdate();
    } catch (error) {
      console.error("Error ordering project:", error);
      toast.error("Failed to place order");
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
        const fileExt = file.name.split('.').pop();
        const filePath = `submissions/${project.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from("projects")
        .update({
          submission_files: uploadedUrls,
          status: "submitted"
        })
        .eq("id", project.id);

      if (error) throw error;
      toast.success("Project submitted successfully!");
      setShowSubmitModal(false);
      setSubmissionFiles([]);
      onProjectUpdate();
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="glass-card p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-semibold">{project.project_title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={
                project.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                project.status === "submitted" ? "bg-purple-500/20 text-purple-400" :
                project.status === "completed" ? "bg-green-500/20 text-green-400" :
                "bg-yellow-500/20 text-yellow-400"
              }>
                {project.status.replace("_", " ").toUpperCase()}
              </Badge>
              {project.advance_paid && <Badge className="bg-green-500/20 text-green-400">Advance Paid</Badge>}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isClient && project.status === "accepted" && !project.advance_paid && (
            <Button onClick={() => setShowPaymentModal(true)} size="sm" className="gap-1">
              <CreditCard className="w-4 h-4" />
              Order Project
            </Button>
          )}
          {isProvider && project.status === "in_progress" && (
            <Button onClick={() => setShowSubmitModal(true)} size="sm" className="gap-1">
              <Upload className="w-4 h-4" />
              Submit Project
            </Button>
          )}
          {isClient && project.status === "submitted" && project.submission_files && (
            <Button
              onClick={() => project.submission_files?.forEach(url => window.open(url, '_blank'))}
              size="sm"
              className="gap-1"
            >
              <Download className="w-4 h-4" />
              Download Files
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          
          return (
            <motion.div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`max-w-[80%] ${isMine ? "bg-primary text-primary-foreground" : "glass-card"} p-3 rounded-xl`}>
                {msg.file_url ? (
                  <div>
                    {msg.file_type === "image" ? (
                      <img src={msg.file_url} alt="Shared" className="max-w-full rounded-lg" />
                    ) : (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary underline">
                        <FileText className="w-4 h-4" />
                        {msg.message || "Download File"}
                      </a>
                    )}
                  </div>
                ) : (
                  <p>{msg.message}</p>
                )}
                <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-4 rounded-b-xl flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.zip"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="icon"
          disabled={isLoading}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={!newMessage.trim() || isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="glass-premium">
          <DialogHeader>
            <DialogTitle>Order Your Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Final Budget ($)</Label>
              <Input
                type="number"
                value={finalBudget}
                onChange={(e) => setFinalBudget(e.target.value)}
                placeholder="Enter agreed budget"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full glass-card p-2 rounded-lg"
              >
                <option value="">Select method</option>
                <option value="binance">Binance</option>
                <option value="bkash">bKash</option>
              </select>
            </div>
            <div>
              <Label>Payment Reference/Transaction ID</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>
            <div className="glass-card p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">Advance Payment:</span> {project.advance_percentage}% = ${(parseFloat(finalBudget || "0") * project.advance_percentage / 100).toFixed(2)}
              </p>
            </div>
            <Button onClick={handleOrderProject} disabled={isLoading} className="w-full">
              {isLoading ? "Processing..." : "Confirm Order & Pay Advance"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="glass-premium">
          <DialogHeader>
            <DialogTitle>Submit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Upload Final Files</Label>
              <input
                type="file"
                multiple
                onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                className="w-full glass-card p-2 rounded-lg"
              />
            </div>
            {submissionFiles.length > 0 && (
              <div className="glass-card p-3 rounded-lg">
                <p className="text-sm font-semibold mb-2">Files to upload:</p>
                {submissionFiles.map((file, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{file.name}</p>
                ))}
              </div>
            )}
            <Button onClick={handleSubmitProject} disabled={isLoading} className="w-full">
              {isLoading ? "Uploading..." : "Submit Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};