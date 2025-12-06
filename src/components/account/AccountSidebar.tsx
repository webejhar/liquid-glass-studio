import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  ShoppingCart, 
  Package, 
  Heart, 
  MessageSquare, 
  Bell, 
  Shield, 
  Briefcase,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AccountSidebarProps {
  profile: any;
  formData: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  cartCount: number;
  favoritesCount: number;
  ordersCount: number;
  projectRequestsCount: number;
  yourProjectsCount: number;
  messagesCount: number;
  notificationsCount: number;
  sessionsCount: number;
  onNavigateHome: () => void;
}

export const AccountSidebar = ({
  profile,
  formData,
  activeTab,
  onTabChange,
  onLogout,
  cartCount,
  favoritesCount,
  ordersCount,
  projectRequestsCount,
  yourProjectsCount,
  messagesCount,
  notificationsCount,
  sessionsCount,
  onNavigateHome
}: AccountSidebarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { id: "profile", label: "Profile", icon: User, badge: null },
    { id: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount > 0 ? cartCount : null },
    { id: "orders", label: "Orders", icon: Package, badge: ordersCount > 0 ? ordersCount : null },
    { id: "favorites", label: "Favorites", icon: Heart, badge: favoritesCount > 0 ? favoritesCount : null },
    ...(profile?.account_type === 'service_provider' 
      ? [{ id: "project-requests", label: "Project Requests", icon: Briefcase, badge: projectRequestsCount > 0 ? projectRequestsCount : null }]
      : []
    ),
    ...(profile?.account_type === 'client' || profile?.account_type === 'general'
      ? [{ id: "your-projects", label: "Your Projects", icon: Briefcase, badge: yourProjectsCount > 0 ? yourProjectsCount : null }]
      : []
    ),
    { id: "chat", label: "Messages", icon: MessageSquare, badge: messagesCount > 0 ? messagesCount : null },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notificationsCount > 0 ? notificationsCount : null },
    { id: "sessions", label: "Security", icon: Shield, badge: sessionsCount > 0 ? sessionsCount : null },
  ];

  return (
    <aside className="w-64 border-r border-border/50 min-h-[calc(100vh-80px)] backdrop-blur-xl bg-background/60 hidden md:block">
      {/* User Info */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback className="text-sm">
              {formData.name ? getInitials(formData.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{formData.name || "User"}</h3>
            <p className="text-xs text-muted-foreground truncate">{formData.email}</p>
          </div>
        </div>
        
        {/* Account Type Badge */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {profile?.account_type === 'general' && 'General User'}
            {profile?.account_type === 'service_provider' && 'Provider'}
            {profile?.account_type === 'client' && 'Client'}
          </Badge>
          {profile?.account_number && (
            <Badge variant="outline" className="text-xs">
              {profile.account_number}
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 text-sm"
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {item.badge !== null && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm mb-1"
          onClick={onNavigateHome}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};