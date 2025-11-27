import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: {
    name: string;
    avatar_url: string | null;
    email: string;
    account_type: string;
  };
}

interface FriendRequestsProps {
  currentUserId: string;
}

export function FriendRequests({ currentUserId }: FriendRequestsProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFriendRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('friend-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${currentUserId}`
        },
        () => {
          loadFriendRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const loadFriendRequests = async () => {
    try {
      const { data: requestsData, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load sender profiles
      if (requestsData && requestsData.length > 0) {
        const senderIds = requestsData.map(r => r.sender_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url, email, account_type')
          .in('user_id', senderIds);

        const requestsWithProfiles = requestsData.map(req => ({
          ...req,
          sender: profiles?.find(p => p.user_id === req.sender_id)
        }));

        setRequests(requestsWithProfiles);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Friend request accepted',
        description: 'You are now friends!',
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Friend request rejected',
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject friend request',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Friend Requests</h3>
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.sender?.avatar_url || ''} />
              <AvatarFallback>
                {request.sender?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{request.sender?.name || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">{request.sender?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {request.sender?.account_type || 'general'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAccept(request.id)}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(request.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
