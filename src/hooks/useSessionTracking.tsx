import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get device model (simplified)
const getDeviceModel = (): string => {
  const ua = navigator.userAgent;
  
  // Check for common patterns
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Android')) {
    const match = ua.match(/Android.*;\s([^)]+)\)/);
    return match ? match[1] : 'Android Device';
  }
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Linux')) return 'Linux PC';
  
  return 'Unknown Device';
};

// Get browser name and version
const getBrowserInfo = (): { name: string; version: string } => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Edg')) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  return { name: browserName, version: browserVersion };
};

export const useSessionTracking = () => {
  useEffect(() => {
    const trackSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const deviceType = getDeviceType();
      const deviceModel = getDeviceModel();
      const browserInfo = getBrowserInfo();

      try {
        // Create session record
        await supabase.from('login_sessions').insert({
          user_id: user.id,
          device_type: deviceType,
          device_model: deviceModel,
          browser_name: browserInfo.name,
          browser_version: browserInfo.version,
          is_active: true
        });

        // Update last activity periodically
        const activityInterval = setInterval(async () => {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (!currentUser) {
            clearInterval(activityInterval);
            return;
          }

          await supabase
            .from('login_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('user_id', currentUser.id)
            .eq('is_active', true);
        }, 60000); // Update every minute

        return () => clearInterval(activityInterval);
      } catch (error) {
        console.error('Error tracking session:', error);
      }
    };

    trackSession();
  }, []);
};
