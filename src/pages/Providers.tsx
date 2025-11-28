import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowLeft, Tag, Briefcase, User } from "lucide-react";
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
  "All Categories",
  "Web Development",
  "Digital Marketing",
  "Web Design",
  "UI/UX Design",
  "Graphics Design",
  "Video Editing",
  "Content Writing",
  "SEO Expert",
  "Others"
];

export default function Providers() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchQuery, selectedCategory, providers]);

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

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter with fuzzy matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const categoryMatch = p.category?.toLowerCase().includes(query);
        const skillsMatch = p.skills?.some(s => s.toLowerCase().includes(query));
        const tagsMatch = p.tags?.some(t => t.toLowerCase().includes(query));
        const bioMatch = p.bio?.toLowerCase().includes(query);
        
        // Fuzzy matching for typos
        const fuzzyMatch = (str: string | null) => {
          if (!str) return false;
          const strLower = str.toLowerCase();
          // Check if query is a substring or has similar characters
          return strLower.includes(query) || 
                 query.split('').every(char => strLower.includes(char));
        };

        return nameMatch || categoryMatch || skillsMatch || tagsMatch || bioMatch ||
               fuzzyMatch(p.name) || fuzzyMatch(p.category);
      });
    }

    setFilteredProviders(filtered);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-3 sm:px-4 md:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Find Service Providers</h1>
            <p className="text-muted-foreground">
              Search and hire skilled professionals for your projects
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <motion.div
          className="glass-premium p-4 rounded-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, service, tags..."
                className="pl-10 glass-card"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] glass-card">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <motion.div
            className="glass-card p-12 rounded-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Providers Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.user_id}
                className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/profile/${provider.user_id}`)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={provider.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(provider.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{provider.name || "Provider"}</h3>
                    {provider.category && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {provider.category}
                      </div>
                    )}
                    {provider.verification_status === "verified" && (
                      <Badge className="bg-green-500/20 text-green-400 mt-1">Verified</Badge>
                    )}
                  </div>
                </div>

                {provider.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {provider.bio}
                  </p>
                )}

                {provider.skills && provider.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {provider.skills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {provider.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {provider.tags && provider.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {provider.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-primary flex items-center gap-0.5">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredProviders.length > 0 && (
          <p className="text-center text-muted-foreground mt-8">
            Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}