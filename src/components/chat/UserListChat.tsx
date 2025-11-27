import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, UserPlus, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FriendRequests } from "./FriendRequests";

interface UserProfile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
  account_type: string | null;
  account_number: string | null;
}

interface UserListChatProps {
  currentUserId: string;
  onSelectUser: (userId: string, userName: string, avatarUrl: string | null) => void;
}

interface FriendStatus {
  [userId: string]: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

export function UserListChat({ currentUserId, onSelectUser }: UserListChatProps) {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>({});
  const [showRequests, setShowRequests] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
    loadFriendStatus();

    // Subscribe to friend request changes
    const channel = supabase
      .channel('friend-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests'
        },
        () => {
          loadFriends();
          loadFriendStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      handleSearch();
    }
  }, [searchQuery]);

  const loadFriends = async () => {
    try {
      // Get accepted friend requests
      const { data: friendRequests, error } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

      if (error) throw error;

      if (!friendRequests || friendRequests.length === 0) {
        setFriends([]);
        setIsLoading(false);
        return;
      }

      // Get friend user IDs
      const friendIds = friendRequests.map(req => 
        req.sender_id === currentUserId ? req.receiver_id : req.sender_id
      );

      // Load friend profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, email, account_type, account_number')
        .in('user_id', friendIds)
        .order('name');

      setFriends(profiles || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id, status')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

      if (error) throw error;

      const statusMap: FriendStatus = {};
      data?.forEach(req => {
        const otherUserId = req.sender_id === currentUserId ? req.receiver_id : req.sender_id;
        if (req.status === 'accepted') {
          statusMap[otherUserId] = 'accepted';
        } else if (req.status === 'pending') {
          statusMap[otherUserId] = req.sender_id === currentUserId ? 'pending_sent' : 'pending_received';
        }
      });

      setFriendStatus(statusMap);
    } catch (error) {
      console.error('Error loading friend status:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const query = searchQuery.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, email, account_type, account_number')
        .neq('user_id', currentUserId)
        .or(`email.ilike.%${query}%,account_number.ilike.%${query}%`);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Friend request already sent',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Friend request sent',
      });

      loadFriendStatus();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive',
      });
    }
  };

  const getAccountTypeBadge = (accountType: string | null) => {
    if (!accountType || accountType === 'general') return null;
    
    const badges = {
      service_provider: { text: 'Provider', color: 'bg-primary/20 text-primary' },
      client: { text: 'Client', color: 'bg-accent/20 text-accent' }
    };
    
    const badge = badges[accountType as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const displayUsers = searchQuery.trim() ? searchResults : friends;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Live Chat
          </h2>
          <Button
            onClick={() => setShowRequests(!showRequests)}
            variant={showRequests ? "default" : "outline"}
            size="sm"
          >
            {showRequests ? "Chat" : "Requests"}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or account number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showRequests ? (
          <div className="p-4">
            <FriendRequests currentUserId={currentUserId} />
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-center">
              {searchQuery.trim() 
                ? "No users found. Search by email or account number."
                : "No friends yet. Search for users to send friend requests."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayUsers.map((user, index) => {
              const status = friendStatus[user.user_id] || 'none';
              return (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-accent/10 transition-colors group relative"
                >
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => {
                        // Allow messaging if accepted friends or any user
                        onSelectUser(user.user_id, user.name || 'User', user.avatar_url);
                      }}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{user.name || 'User'}</p>
                          {getAccountTypeBadge(user.account_type)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.account_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      {status === 'none' && searchQuery.trim() && (
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(user.user_id)}
                          variant="default"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                      {status === 'pending_sent' && (
                        <Badge variant="secondary" className="text-xs">Sent</Badge>
                      )}
                      {status === 'pending_received' && (
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                      {status === 'accepted' && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Friends
                        </Badge>
                      )}
                      <button
                        onClick={() => navigate(`/profile/${user.user_id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
