import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, Clock, CheckCircle, AlertCircle, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  user?: {
    name: string | null;
    email: string | null;
  };
}

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminSupportTickets() {
  useAdminAuth();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    getAdminId();
  }, [filterStatus]);

  const getAdminId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setAdminId(user?.id || null);
  };

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user details
      const ticketsWithUsers = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: user } = await supabase
            .from("profiles")
            .select("name, email")
            .eq("user_id", ticket.user_id)
            .single();
          return { ...ticket, user };
        })
      );

      setTickets(ticketsWithUsers);
    } catch (error) {
      console.error("Error loading tickets:", error);
      toast.error("Failed to load tickets");
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

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;
      
      toast.success("Status updated!");
      loadTickets();
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !adminId) return;

    try {
      const { error } = await supabase.from("support_messages").insert({
        ticket_id: selectedTicket.id,
        sender_id: adminId,
        is_admin: true,
        message: newMessage.trim()
      });

      if (error) throw error;

      // Notify user
      await supabase.rpc('create_user_notification', {
        p_user_id: selectedTicket.user_id,
        p_title: 'Support Reply',
        p_message: `New reply on your ticket: ${selectedTicket.subject}`,
        p_type: 'support_reply',
        p_reference_id: selectedTicket.id
      });

      setNewMessage("");
      loadMessages(selectedTicket.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    loadMessages(ticket.id);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Support Tickets
          </h1>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No support tickets found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket, index) => {
              const statusInfo = getStatusInfo(ticket.status);
              return (
                <motion.div
                  key={ticket.id}
                  className="glass-card p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => openTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <Badge className={statusInfo.badge}>
                          <span className="flex items-center gap-1">
                            {statusInfo.icon}
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </Badge>
                        <Badge className={getPriorityBadge(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.user?.name || ticket.user?.email || 'Unknown'}
                        </span>
                        <span>{ticket.category}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => {
                        handleStatusChange(ticket.id, value);
                      }}
                    >
                      <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Ticket Detail Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="glass-premium max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="truncate pr-4">{selectedTicket?.subject}</span>
                <Badge className={getStatusInfo(selectedTicket?.status || 'open').badge}>
                  {selectedTicket?.status.replace('_', ' ')}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="glass-card p-3 rounded-lg text-sm space-y-1">
              <p className="text-muted-foreground">{selectedTicket?.description}</p>
              <div className="flex gap-2 text-xs">
                <Badge variant="outline">{selectedTicket?.category}</Badge>
                <Badge className={getPriorityBadge(selectedTicket?.priority || 'medium')}>
                  {selectedTicket?.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                From: {selectedTicket?.user?.name || selectedTicket?.user?.email}
              </p>
            </div>

            <ScrollArea className="flex-1 min-h-[200px] max-h-[300px] pr-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.is_admin 
                        ? "bg-primary/20 ml-4" 
                        : "glass-card mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {msg.is_admin ? "Admin" : "User"}
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
                  placeholder="Type your reply..."
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
    </AdminLayout>
  );
}
