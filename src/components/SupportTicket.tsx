import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Plus, Send, MessageSquare, Clock, CheckCircle, AlertCircle, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface SupportTicketProps {
  userId: string;
}

export const SupportTicket = ({ userId }: SupportTicketProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium"
  });

  useEffect(() => {
    loadTickets();
  }, [userId]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.description.trim() || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: userId,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority
      });

      if (error) throw error;

      toast.success("Ticket created successfully!");
      setShowCreateModal(false);
      setFormData({ subject: "", description: "", category: "", priority: "medium" });
      loadTickets();

      // Notify admin
      await supabase.rpc('create_admin_notification', {
        p_title: 'New Support Ticket',
        p_message: `New ${formData.priority} priority ticket: ${formData.subject}`,
        p_type: 'support_ticket'
      });
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error(error.message || "Failed to create ticket");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const { error } = await supabase.from("support_messages").insert({
        ticket_id: selectedTicket.id,
        sender_id: userId,
        is_admin: false,
        message: newMessage.trim()
      });

      if (error) throw error;

      setNewMessage("");
      loadMessages(selectedTicket.id);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const getStatusInfo = (status: string) => {
    const info: Record<string, { badge: string; icon: JSX.Element }> = {
      open: { badge: "bg-blue-500/20 text-blue-400", icon: <AlertCircle className="w-3 h-3" /> },
      in_progress: { badge: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" /> },
      resolved: { badge: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
      closed: { badge: "bg-muted text-muted-foreground", icon: <CheckCircle className="w-3 h-3" /> }
    };
    return info[status] || info.open;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      high: "bg-orange-500/20 text-orange-400",
      urgent: "bg-red-500/20 text-red-400"
    };
    return styles[priority] || styles.medium;
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Support Tickets
        </h3>
        <Button onClick={() => setShowCreateModal(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No support tickets yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create one if you need help</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, index) => {
            const statusInfo = getStatusInfo(ticket.status);
            return (
              <motion.div
                key={ticket.id}
                className="glass-card p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{ticket.subject}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={statusInfo.badge}>
                        <span className="flex items-center gap-1">
                          {statusInfo.icon}
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      <Badge className={getPriorityBadge(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="glass-premium max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your issue"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>
            <Button onClick={handleCreateTicket} className="w-full">
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="glass-premium max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate pr-4">{selectedTicket?.subject}</span>
              <Badge className={getStatusInfo(selectedTicket?.status || 'open').badge}>
                {selectedTicket?.status.replace('_', ' ')}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="glass-card p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">{selectedTicket?.description}</p>
          </div>

          <ScrollArea className="flex-1 min-h-[200px] max-h-[300px] pr-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.is_admin 
                      ? "glass-card ml-4" 
                      : "bg-primary/20 mr-4"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {msg.is_admin ? "Support Team" : "You"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedTicket?.status !== 'closed' && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
