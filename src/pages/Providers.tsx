import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowLeft, Tag, Briefcase, User, Star, Clock, DollarSign, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Provider {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  category: string | null;
  bio: string | null;
  skills: string[] | null;
  tags: string[] | null;
  verification_status: string | null;
}

const SERVICE_CATEGORIES = [
  "All Categories", "Web Development", "Digital Marketing", "Web Design", "UI/UX Design",
  "Graphics Design", "Video Editing", "Content Writing", "SEO Expert", "Others"
];

export default function Providers() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => { loadProviders(); }, []);
  useEffect(() => { filterProviders(); }, [searchQuery, selectedCategory, providers]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, category, bio, skills, tags, verification_status")
        .eq("account_type", "service_provider")
        .eq("approval_status", "approved");
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        return p.name?.toLowerCase().includes(query) ||
               p.category?.toLowerCase().includes(query) ||
               p.skills?.some(s => s.toLowerCase().includes(query)) ||
               p.tags?.some(t => t.toLowerCase().includes(query)) ||
               p.bio?.toLowerCase().includes(query);
      });
    }
    setFilteredProviders(filtered);
  };

  const getInitials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "P";

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-3 sm:px-4 md:px-6 lg:px-8 pb-16 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-5 h-5" /></Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Find Service Providers</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Search and hire skilled professionals</p>
          </div>
        </div>

        <motion.div className="glass-premium p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, service, tags..." className="pl-9 sm:pl-10 glass-card w-full text-sm sm:text-base" />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full glass-card text-sm sm:text-base"><Filter className="w-4 h-4 mr-2 shrink-0" /><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : filteredProviders.length === 0 ? (
          <motion.div className="glass-card p-8 sm:p-12 rounded-xl sm:rounded-2xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Providers Found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProviders.map((provider, index) => (
              <motion.div key={provider.user_id} className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:scale-[1.02] transition-all cursor-pointer group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => navigate(`/profile/${provider.user_id}`)}>
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
                    <AvatarImage src={provider.avatar_url || undefined} />
                    <AvatarFallback className="text-sm sm:text-base">{getInitials(provider.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{provider.name || "Provider"}</h3>
                      {provider.verification_status === "verified" && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                    </div>
                    {provider.category && <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground"><Briefcase className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /><span className="truncate">{provider.category}</span></div>}
                  </div>
                </div>
                {provider.bio && <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{provider.bio}</p>}
                {provider.skills && provider.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                    {provider.skills.slice(0, 3).map((skill, i) => <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>)}
                    {provider.skills.length > 3 && <Badge variant="outline" className="text-xs">+{provider.skills.length - 3}</Badge>}
                  </div>
                )}
                {provider.tags && provider.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                    {provider.tags.slice(0, 3).map((tag, i) => <span key={i} className="text-xs text-primary flex items-center gap-0.5"><Tag className="w-3 h-3" />{tag}</span>)}
                  </div>
                )}
                <Button className="w-full text-xs sm:text-sm group-hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${provider.user_id}`); }}>View Profile & Hire</Button>
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && filteredProviders.length > 0 && <p className="text-center text-sm sm:text-base text-muted-foreground mt-6 sm:mt-8">Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}</p>}
      </div>
    </div>
  );
}