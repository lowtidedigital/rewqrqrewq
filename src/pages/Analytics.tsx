import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/StatsCard";
import { api } from "@/lib/api";
import { buildShortUrl } from "@/config";
import { 
  MousePointerClick, 
  TrendingUp, 
  Link2, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Analytics = () => {
  // Fetch real dashboard stats
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats(),
    staleTime: 30000,
  });

  // Fetch links to show top performers
  const { data: linksData, isLoading: isLoadingLinks } = useQuery({
    queryKey: ['links'],
    queryFn: () => api.getLinks({ limit: 10 }),
    staleTime: 30000,
  });

  const isLoading = isLoadingStats || isLoadingLinks;

  // Calculate real stats
  const totalClicks = stats?.total_clicks ?? 0;
  const totalLinks = stats?.total_links ?? 0;
  const activeLinks = stats?.active_links ?? 0;
  const clicksToday = stats?.clicks_today ?? 0;

  // Sort links by click count for top performers
  const topLinks = [...(linksData?.items || [])]
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 5);

  const hasData = totalClicks > 0 || totalLinks > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load analytics</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track performance across all your links.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Clicks" 
          value={totalClicks.toLocaleString()} 
          change={hasData ? "All time" : "No clicks yet"}
          changeType="neutral"
          icon={MousePointerClick}
          delay={0}
        />
        <StatsCard 
          title="Clicks Today" 
          value={clicksToday.toLocaleString()} 
          change="Last 24 hours"
          changeType="neutral"
          icon={TrendingUp}
          delay={0.1}
        />
        <StatsCard 
          title="Total Links" 
          value={totalLinks.toLocaleString()} 
          change={`${activeLinks} active`}
          changeType="neutral"
          icon={Link2}
          delay={0.2}
        />
        <StatsCard 
          title="Avg. Clicks/Link" 
          value={totalLinks > 0 ? Math.round(totalClicks / totalLinks).toLocaleString() : "0"} 
          change="Per link average"
          changeType="neutral"
          icon={Calendar}
          delay={0.3}
        />
      </div>

      {/* Content Area */}
      {!hasData ? (
        /* Empty State */
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No analytics yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first link and share it to start seeing analytics data here.
            Click tracking happens in real-time.
          </p>
          <Link
            to="/dashboard/links/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Your First Link
          </Link>
        </motion.div>
      ) : (
        /* Real Data */
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4">Top Performing Links</h3>
            {topLinks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No links yet</p>
            ) : (
              <div className="space-y-4">
                {topLinks.map((link, index) => (
                  <Link 
                    key={link.link_id} 
                    to={`/dashboard/links/${link.link_id}`}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <div>
                        <p className="font-medium">{link.title || link.slug}</p>
                        <p className="text-sm text-muted-foreground">/{link.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{(link.click_count || 0).toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">clicks</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Geographic & Device Analytics - Coming Soon */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4">Geographic Distribution</h3>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Detailed geographic and device analytics coming soon.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Per-link analytics available on link detail pages.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Analytics;