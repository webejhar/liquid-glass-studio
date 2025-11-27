import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image as ImageIcon, Smile, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { chatSounds } from "@/utils/chatSounds";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  message_type?: string;
  image_url?: string | null;
}

interface ChatInterfaceProps {
  currentUserId: string;
  selectedUserId: string;
  selectedUserName: string;
  selectedUserAvatar: string | null;
  onBack: () => void;
}

export function ChatInterface({
  currentUserId,
  selectedUserId,
  selectedUserName,
  selectedUserAvatar,
  onBack
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userOnlineStatus, setUserOnlineStatus] = useState<'online' | 'offline'>('offline');
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Add class to body on mount to hide header/footer on mobile
  useEffect(() => {
    document.body.classList.add('chat-active');
    return () => {
      document.body.classList.remove('chat-active');
    };
  }, []);

  // Persist chat state in localStorage
  useEffect(() => {
    const chatState = {
      userId: selectedUserId,
      userName: selectedUserName,
      avatarUrl: selectedUserAvatar,
      message: newMessage
    };
    localStorage.setItem('activeChatState', JSON.stringify(chatState));

    return () => {
      // Clean up on unmount
      if (!newMessage.trim()) {
        localStorage.removeItem('activeChatState');
      }
    };
  }, [selectedUserId, selectedUserName, selectedUserAvatar, newMessage]);

  // Restore message from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('activeChatState');
    if (savedState) {
      try {
        const { message } = JSON.parse(savedState);
        if (message) {
          setNewMessage(message);
        }
      } catch (e) {
        console.error('Error restoring chat state:', e);
      }
    }
  }, []);

  // Track user presence
  useEffect(() => {
    const presenceChannel = supabase.channel(`presence:${selectedUserId}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const isOnline = Object.keys(state).length > 0;
        setUserOnlineStatus(isOnline ? 'online' : 'offline');
        
        if (!isOnline) {
          // Check last seen from profile or messages
          loadLastSeen();
        }
      })
      .on('presence', { event: 'join' }, () => {
        setUserOnlineStatus('online');
        setLastSeen(null);
      })
      .on('presence', { event: 'leave' }, () => {
        setUserOnlineStatus('offline');
        setLastSeen(new Date());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await presenceChannel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString()
          });
        }
      });

    loadLastSeen();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [selectedUserId, currentUserId]);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
    
    // Set up realtime subscription for instant message delivery
    const channel = supabase
      .channel(`chat:${currentUserId}:${selectedUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${selectedUserId},receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMsg = payload.new as Message;
          
          // Play receive sound
          chatSounds.playReceiveSound();
          
          // Add message to list
          setMessages(prev => {
            // Check if message already exists (prevent duplicates)
            if (prev.some(m => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });

          // Mark as read immediately since user is in chat
          markMessagesAsRead();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${currentUserId},receiver_id=eq.${selectedUserId}`
        },
        (payload) => {
          console.log('Message sent confirmed:', payload);
          const newMsg = payload.new as Message;
          
          // Update messages list to include server-confirmed message
          setMessages(prev => {
            // Check if message already exists
            if (prev.some(m => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastSeen = async () => {
    try {
      // Get last message from this user
      const { data } = await supabase
        .from('chat_messages')
        .select('created_at')
        .or(`sender_id.eq.${selectedUserId},receiver_id.eq.${selectedUserId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLastSeen(new Date(data.created_at));
      }
    } catch (error) {
      console.error("Error loading last seen:", error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', selectedUserId)
        .eq('is_read', false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || isSending) return;

    setIsSending(true);
    setIsUploading(true);
    
    try {
      let imageUrl = null;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: selectedUserId,
          message: newMessage.trim() || (imageUrl ? 'Image' : ''),
          message_type: imageUrl ? 'image' : 'text',
          image_url: imageUrl
        });

      if (error) throw error;

      // Play send sound
      chatSounds.playSendSound();
      
      setNewMessage("");
      handleRemoveImage();
      
      // Clear saved message from localStorage
      const savedState = localStorage.getItem('activeChatState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          state.message = '';
          localStorage.setItem('activeChatState', JSON.stringify(state));
        } catch (e) {
          console.error('Error updating chat state:', e);
        }
      }
      
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, messagId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-image-${messagId}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatLastSeen = () => {
    if (userOnlineStatus === 'online') {
      return 'Online';
    }

    if (!lastSeen) {
      return 'Offline';
    }

    const now = new Date();
    const diffInHours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

    if (diffInHours >= 24) {
      return 'Offline';
    }

    const diffInMinutes = Math.floor(diffInHours * 60);
    
    if (diffInMinutes < 1) {
      return 'Last seen just now';
    } else if (diffInMinutes < 60) {
      return `Last seen ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3 bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div
          onClick={() => navigate(`/profile/${selectedUserId}`)}
          className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-accent/10 rounded-lg p-2 -m-2 transition-colors"
        >
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUserAvatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {selectedUserName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {userOnlineStatus === 'online' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{selectedUserName}</p>
            <p className="text-xs text-muted-foreground">{formatLastSeen()}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isSender = message.sender_id === currentUserId;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl ${
                      message.message_type === 'image' ? 'p-1' : 'px-4 py-2'
                    } ${
                      isSender
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-card border border-border rounded-tl-sm'
                    }`}
                  >
                    {message.message_type === 'image' && message.image_url ? (
                      <div className="space-y-2">
                        <div className="relative group">
                          <img 
                            src={message.image_url} 
                            alt="Chat image" 
                            className="rounded-lg max-w-full h-auto cursor-pointer"
                            onClick={() => window.open(message.image_url!, '_blank')}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDownloadImage(message.image_url!, message.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        {message.message && message.message !== 'Image' && (
                          <p className="text-sm break-words px-3 pb-2">{message.message}</p>
                        )}
                        <p
                          className={`text-xs px-3 pb-1 ${
                            isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm break-words">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-32 rounded-lg border border-border"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isSending}
          >
            <Smile className="w-5 h-5" />
          </Button>
          
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          
          <Button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            className="px-4"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
