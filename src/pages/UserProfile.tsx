import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Mail, Phone, MapPin, Briefcase, CheckCircle, Clock, Shield, Calendar, UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  profession: string | null;
  address: string | null;
  phone: string | null;
  account_type: string | null;
  account_number: string | null;
  verification_status: string | null;
  approval_status: string | null;
  category: string | null;
  social_media_links: any;
  created_at: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');

  useEffect(() => {
    checkCurrentUser();
    if (userId) {
      loadProfile(userId);
      loadFriendStatus();
    }
  }, [userId]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to view profiles");
      navigate("/login");
      return;
    }
    setCurrentUser(user);
  };

  const loadProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendStatus = async () => {
    if (!currentUser?.id || !userId) return;

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id, status')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        if (data.status === 'accepted') {
          setFriendStatus('accepted');
        } else if (data.status === 'pending') {
          setFriendStatus(data.sender_id === currentUser.id ? 'pending_sent' : 'pending_received');
        }
      } else {
        setFriendStatus('none');
      }
    } catch (error) {
      console.error('Error loading friend status:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!currentUser?.id || !userId) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUser.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Friend request sent');
      loadFriendStatus();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async () => {
    if (!currentUser?.id || !userId) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('sender_id', userId)
        .eq('receiver_id', currentUser.id);

      if (error) throw error;

      toast.success('Friend request accepted');
      loadFriendStatus();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async () => {
    if (!currentUser?.id || !userId) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('sender_id', userId)
        .eq('receiver_id', currentUser.id);

      if (error) throw error;

      toast.success('Friend request rejected');
      loadFriendStatus();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    }
  };

  const handleStartChat = () => {
    if (!currentUser || !profile) return;
    
    // Navigate to account page with chat tab and selected user
    navigate('/account', {
      state: {
        activeTab: 'chat',
        selectedUser: {
          userId: profile.user_id,
          userName: profile.name || 'User',
          avatarUrl: profile.avatar_url
        }
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAccountTypeBadge = (accountType: string | null) => {
    if (!accountType) return null;
    
    const badges = {
      general: { text: 'General User', color: 'bg-blue-500/20 text-blue-400' },
      service_provider: { text: 'Service Provider', color: 'bg-primary/20 text-primary' },
      client: { text: 'Client', color: 'bg-accent/20 text-accent' }
    };
    
    const badge = badges[accountType as keyof typeof badges];
    return badge ? (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        {badge.text}
      </div>
    ) : null;
  };

  const getVerificationBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Verified
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Pending Review
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/20 text-muted-foreground text-sm font-semibold">
            <Shield className="w-4 h-4" />
            Unverified
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Profile not found</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === profile.user_id;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-3 sm:px-4 md:px-6 lg:px-8 pb-16">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium p-6 sm:p-8 rounded-2xl"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.name ? getInitials(profile.name) : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                {profile.name || 'User'}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                {getAccountTypeBadge(profile.account_type)}
                {profile.account_number && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-semibold">
                    ID: {profile.account_number}
                  </div>
                )}
                {getVerificationBadge(profile.verification_status)}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {friendStatus === 'none' && (
                    <Button
                      onClick={sendFriendRequest}
                      variant="outline"
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Friend
                    </Button>
                  )}
                  {friendStatus === 'pending_sent' && (
                    <Button variant="secondary" disabled className="gap-2">
                      Request Sent
                    </Button>
                  )}
                  {friendStatus === 'pending_received' && (
                    <div className="flex gap-2">
                      <Button onClick={acceptFriendRequest} variant="default" className="gap-2">
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button onClick={rejectFriendRequest} variant="destructive" className="gap-2">
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {friendStatus === 'accepted' && (
                    <Badge variant="default" className="bg-green-500 px-4 py-2">
                      <Check className="w-4 h-4 mr-2" />
                      Friends
                    </Badge>
                  )}
                  <Button
                    onClick={handleStartChat}
                    variant="liquid"
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Live Chat
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <Button
                  onClick={() => navigate('/account')}
                  variant="outline"
                  className="gap-2"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.email && (
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold break-all">{profile.email}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.phone && (
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.profession && (
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profession</p>
                    <p className="font-semibold">{profile.profession}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.category && (
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold">{profile.category}</p>
                  </div>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="glass-card p-4 rounded-lg sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-semibold">{profile.address}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card p-4 rounded-lg sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-semibold">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          {profile.social_media_links && Array.isArray(profile.social_media_links) && profile.social_media_links.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">Social Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.social_media_links.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-3 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{link.platform}</p>
                        <p className="font-semibold truncate">{link.url}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
