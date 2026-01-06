import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/StatsCard";
import LinkCard, { LinkData } from "@/components/LinkCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, MousePointerClick, TrendingUp, Globe, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { api, Link as ApiLink } from "@/lib/api";
import { buildShortUrl } from "@/config";

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

const Dashboard = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats(),
  });

  // Fetch recent links
  const { data: linksResponse, isLoading: linksLoading, error: linksError } = useQuery({
    queryKey: ['recentLinks'],
    queryFn: () => api.getLinks({ limit: 5 }),
  });

  const recentLinks = linksResponse?.items.map(transformLink) || [];

  const statsCards = [
    { 
      title: "Total Links", 
      value: stats?.total_links?.toString() || "0", 
      change: `${stats?.active_links || 0} active`, 
      changeType: "positive" as const, 
      icon: Link2 
    },
    { 
      title: "Total Clicks", 
      value: stats?.total_clicks?.toLocaleString() || "0", 
      change: `${stats?.clicks_this_week || 0} this week`, 
      changeType: "positive" as const, 
      icon: MousePointerClick 
    },
    { 
      title: "Clicks Today", 
      value: stats?.clicks_today?.toString() || "0", 
      change: "Today's activity", 
      changeType: "positive" as const, 
      icon: TrendingUp 
    },
    { 
      title: "This Week", 
      value: stats?.clicks_this_week?.toString() || "0", 
      change: "Last 7 days", 
      changeType: "positive" as const, 
      icon: Globe 
    },
  ];

  const hasError = statsError || linksError;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your links.</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/links/new">
            <Plus className="w-4 h-4" />
            Create Link
          </Link>
        </Button>
      </motion.div>

      {/* Error State */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Failed to load dashboard data. Please try again.</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </>
        ) : (
          statsCards.map((stat, index) => (
            <StatsCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))
        )}
      </div>

      {/* Recent Links */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Recent Links</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/links" className="flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {linksLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </>
          ) : recentLinks.length > 0 ? (
            recentLinks.map((link, index) => (
              <LinkCard key={link.id} link={link} delay={0.5 + index * 0.1} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Link2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No links yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first short link to get started
              </p>
              <Button variant="hero" asChild>
                <Link to="/dashboard/links/new">
                  <Plus className="w-4 h-4" />
                  Create Link
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
