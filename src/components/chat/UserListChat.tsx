import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
  account_type: string | null;
}

interface UserListChatProps {
  currentUserId: string;
  onSelectUser: (userId: string, userName: string, avatarUrl: string | null) => void;
}

export function UserListChat({ currentUserId, onSelectUser }: UserListChatProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [currentUserId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, email, account_type')
        .neq('user_id', currentUserId)
        .order('name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Live Chat
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-center">
              {searchQuery ? "No users found" : "No users available to chat"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-accent/10 transition-colors group relative"
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onSelectUser(user.user_id, user.name || 'User', user.avatar_url)}
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
                        <p className="font-semibold truncate">{user.name || 'Unnamed User'}</p>
                        {getAccountTypeBadge(user.account_type)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${user.user_id}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold"
                  >
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
