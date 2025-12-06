import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingBag, Calendar, Mail, UserCheck, AlertCircle, MessageSquare, Briefcase, TrendingUp, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGeneralUsers: 0,
    totalServiceProviders: 0,
    totalClients: 0,
    pendingApprovals: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalContacts: 0,
    totalTickets: 0,
    totalProjects: 0,
  });

  const [todayStats, setTodayStats] = useState({
    newOrders: 0,
    newTickets: 0,
    newRegistrations: 0,
    newProjects: 0,
    newContacts: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchTodayStats();

    // Real-time subscriptions for today's stats
    const channels = setupRealtimeSubscriptions();
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const setupRealtimeSubscriptions = () => {
    const channels = [];

    // Product orders channel
    const productOrdersChannel = supabase
      .channel("dashboard_product_orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "product_orders" }, () => {
        fetchTodayStats();
        fetchStats();
      })
      .subscribe();
    channels.push(productOrdersChannel);

    // Domain orders channel
    const domainOrdersChannel = supabase
      .channel("dashboard_domain_orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "domain_orders" }, () => {
        fetchTodayStats();
        fetchStats();
      })
      .subscribe();
    channels.push(domainOrdersChannel);

    // Support tickets channel
    const ticketsChannel = supabase
      .channel("dashboard_tickets")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_tickets" }, () => {
        fetchTodayStats();
        fetchStats();
      })
      .subscribe();
    channels.push(ticketsChannel);

    // Profiles channel
    const profilesChannel = supabase
      .channel("dashboard_profiles")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => {
        fetchTodayStats();
        fetchStats();
      })
      .subscribe();
    channels.push(profilesChannel);

    // Projects channel
    const projectsChannel = supabase
      .channel("dashboard_projects")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "projects" }, () => {
        fetchTodayStats();
        fetchStats();
      })
      .subscribe();
    channels.push(projectsChannel);

    // Contacts channel
    const contactsChannel = supabase
      .channel("dashboard_contacts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contacts" }, () => {
        fetchTodayStats();
        fetchStats();
      })
      .subscribe();
    channels.push(contactsChannel);

    return channels;
  };

  const fetchStats = async () => {
    try {
      const [profilesData, productOrdersData, domainOrdersData, bookingsData, contactsData, ticketsData, projectsData] = await Promise.all([
        supabase.from("profiles").select("account_type, approval_status"),
        supabase.from("product_orders").select("id", { count: "exact", head: true }),
        supabase.from("domain_orders").select("id", { count: "exact", head: true }),
        supabase.from("meeting_bookings").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
      ]);

      const profiles = profilesData.data || [];
      const totalGeneralUsers = profiles.filter(p => p.account_type === 'general').length;
      const totalServiceProviders = profiles.filter(p => p.account_type === 'service_provider').length;
      const totalClients = profiles.filter(p => p.account_type === 'client').length;
      const pendingApprovals = profiles.filter(p => 
        (p.account_type === 'service_provider' || p.account_type === 'client') && 
        p.approval_status === 'pending'
      ).length;

      const totalOrders = (productOrdersData.count || 0) + (domainOrdersData.count || 0);

      setStats({
        totalGeneralUsers,
        totalServiceProviders,
        totalClients,
        pendingApprovals,
        totalOrders,
        totalBookings: bookingsData.count || 0,
        totalContacts: contactsData.count || 0,
        totalTickets: ticketsData.count || 0,
        totalProjects: projectsData.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [productOrders, domainOrders, tickets, profiles, projects, contacts] = await Promise.all([
        supabase.from("product_orders").select("product_price, created_at").gte("created_at", todayISO),
        supabase.from("domain_orders").select("price, created_at").gte("created_at", todayISO),
        supabase.from("support_tickets").select("id, created_at").gte("created_at", todayISO),
        supabase.from("profiles").select("id, created_at").gte("created_at", todayISO),
        supabase.from("projects").select("id, created_at").gte("created_at", todayISO),
        supabase.from("contacts").select("id, created_at").gte("created_at", todayISO),
      ]);

      const productRevenue = (productOrders.data || []).reduce((sum, o) => sum + (Number(o.product_price) || 0), 0);
      const domainRevenue = (domainOrders.data || []).reduce((sum, o) => sum + (Number(o.price) || 0), 0);

      setTodayStats({
        newOrders: (productOrders.data?.length || 0) + (domainOrders.data?.length || 0),
        newTickets: tickets.data?.length || 0,
        newRegistrations: profiles.data?.length || 0,
        newProjects: projects.data?.length || 0,
        newContacts: contacts.data?.length || 0,
        revenue: productRevenue + domainRevenue,
      });
    } catch (error) {
      console.error("Error fetching today's stats:", error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const overviewCards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-cyan-500", path: "/admin/orders" },
    { title: "Support Tickets", value: stats.totalTickets, icon: MessageSquare, color: "text-pink-500", path: "/admin/support" },
    { title: "Total Projects", value: stats.totalProjects, icon: Briefcase, color: "text-purple-500", path: "/admin/project-orders" },
    { title: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-orange-500", path: "/admin/meetings" },
    { title: "Total Contacts", value: stats.totalContacts, icon: Mail, color: "text-yellow-500", path: "/admin/contacts" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: AlertCircle, color: "text-red-500", path: "/admin/users" },
  ];

  const todayCards = [
    { title: "New Orders Today", value: todayStats.newOrders, icon: ShoppingBag, color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-500/10" },
    { title: "New Tickets Today", value: todayStats.newTickets, icon: MessageSquare, color: "from-pink-500 to-rose-500", bgColor: "bg-pink-500/10" },
    { title: "New Registrations", value: todayStats.newRegistrations, icon: UserCheck, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
    { title: "New Projects", value: todayStats.newProjects, icon: Briefcase, color: "from-purple-500 to-violet-500", bgColor: "bg-purple-500/10" },
    { title: "New Contacts", value: todayStats.newContacts, icon: Mail, color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-500/10" },
    { title: "Today's Revenue", value: `$${todayStats.revenue.toFixed(2)}`, icon: DollarSign, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-500/10" },
  ];

  const userCards = [
    { title: "General Users", value: stats.totalGeneralUsers, color: "text-blue-500" },
    { title: "Service Providers", value: stats.totalServiceProviders, color: "text-purple-500" },
    { title: "Clients", value: stats.totalClients, color: "text-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform</p>
        </div>

        {/* Today's Stats - Real-time Widgets */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Today's Activity</h2>
            <Badge variant="secondary" className="animate-pulse">Live</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {todayCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`${card.bgColor} border-none hover:scale-105 transition-transform duration-300`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full bg-gradient-to-br ${card.color} mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* User Stats */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">User Statistics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="backdrop-blur-xl bg-background/60 border-border/50 cursor-pointer hover:bg-background/80 transition-colors"
                  onClick={() => navigate("/admin/users")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                      </div>
                      <Users className={`w-8 h-8 ${card.color} opacity-50`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Platform Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {overviewCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="backdrop-blur-xl bg-background/60 border-border/50 cursor-pointer hover:bg-background/80 transition-colors"
                    onClick={() => navigate(stat.path)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                      <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
