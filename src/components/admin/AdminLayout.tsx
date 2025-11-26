import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Shield, 
  LogOut,
  Menu,
  Mail,
  Calendar,
  CheckSquare,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { AdminNotifications } from "./AdminNotifications";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    
    // Subscribe to changes in profiles table
    const channel = supabase
      .channel('pending-approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .in('account_type', ['service_provider', 'client'])
        .eq('approval_status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "All Users", icon: Users },
    { path: "/admin/pending-approval", label: "Pending Approval", icon: Clock, badge: pendingCount },
    { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { path: "/admin/meetings", label: "Meetings", icon: Calendar },
    { path: "/admin/verification", label: "Verification", icon: CheckSquare },
    { path: "/admin/contacts", label: "Contacts", icon: Mail },
    { path: "/admin/roles", label: "Roles", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="backdrop-blur-xl bg-background/80 border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <AdminNotifications />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r border-border/50 min-h-[calc(100vh-73px)] backdrop-blur-xl bg-background/60">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="absolute left-0 top-[73px] bottom-0 w-64 backdrop-blur-xl bg-background/95 border-r border-border/50"
                onClick={(e) => e.stopPropagation()}
              >
                <nav className="p-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </nav>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
