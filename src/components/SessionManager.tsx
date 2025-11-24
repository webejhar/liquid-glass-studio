import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, LogOut } from "lucide-react";

interface Session {
  id: string;
  device_type: string;
  device_model: string;
  browser_name: string;
  browser_version: string;
  login_time: string;
  last_activity: string;
  is_active: boolean;
}

export const SessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('login_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('login_time', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const logoutSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('login_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session logged out successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error logging out session:', error);
      toast.error('Failed to logout session');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No active sessions</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 glass-card rounded-lg"
            >
              <div className="flex items-center gap-4">
                {getDeviceIcon(session.device_type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{session.device_model}</span>
                    {session.is_active && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.browser_name} {session.browser_version}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Login: {new Date(session.login_time).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last activity: {new Date(session.last_activity).toLocaleString()}
                  </div>
                </div>
              </div>
              {session.is_active && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => logoutSession(session.id)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
