import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LinkCard, { LinkData } from "@/components/LinkCard";
import { Plus, Search, Filter, SortAsc, Link2, AlertCircle } from "lucide-react";
import { buildShortUrl } from "@/config";
import { api, Link as ApiLink } from "@/lib/api";

// Transform API link to LinkCard format
const transformLink = (link: ApiLink): LinkData => ({
  id: link.link_id,
  slug: link.slug,
  shortUrl: buildShortUrl(link.slug),
  longUrl: link.long_url,
  title: link.title,
  clicks: link.click_count || 0,
  enabled: link.enabled,
  createdAt: link.created_at,
  tags: link.tags,
});

const LinksList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch links from API
  const { data: linksResponse, isLoading, error } = useQuery({
    queryKey: ['links', searchQuery],
    queryFn: () => api.getLinks({ search: searchQuery || undefined }),
  });

  const links = linksResponse?.items.map(transformLink) || [];

  const filteredLinks = links
    .filter((link) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "enabled" && link.enabled) ||
        (filterStatus === "disabled" && !link.enabled);
      
      return matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-clicks":
          return b.clicks - a.clicks;
        case "least-clicks":
          return a.clicks - b.clicks;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold">Links</h1>
          <p className="text-muted-foreground">Manage all your short links in one place.</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/links/new">
            <Plus className="w-4 h-4" />
            Create Link
          </Link>
        </Button>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load links. Please try again.</p>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-clicks">Most Clicks</SelectItem>
              <SelectItem value="least-clicks">Least Clicks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Links List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </>
        ) : filteredLinks.length > 0 ? (
          filteredLinks.map((link, index) => (
            <LinkCard key={link.id} link={link} delay={0.2 + index * 0.05} />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No links found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Create your first short link to get started"}
            </p>
            <Button variant="hero" asChild>
              <Link to="/dashboard/links/new">
                <Plus className="w-4 h-4" />
                Create Link
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LinksList;
