import { motion } from "framer-motion";
import StatsCard from "@/components/StatsCard";
import { MousePointerClick, TrendingUp, Globe, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

const mockStats = [
  { title: "Total Clicks (30d)", value: "45.2K", change: "+18% vs last period", changeType: "positive" as const, icon: MousePointerClick },
  { title: "Unique Visitors", value: "32.1K", change: "+12% vs last period", changeType: "positive" as const, icon: TrendingUp },
  { title: "Countries Reached", value: "67", change: "+8 new countries", changeType: "positive" as const, icon: Globe },
  { title: "Avg. Daily Clicks", value: "1,507", change: "-5% vs last period", changeType: "negative" as const, icon: Calendar },
];

const topLinks = [
  { title: "Spring Sale Campaign", slug: "spring-sale", clicks: 12450, trend: 23 },
  { title: "Product Demo Booking", slug: "product-demo", clicks: 8920, trend: 15 },
  { title: "Blog: Conversions", slug: "blog-post", clicks: 6340, trend: -8 },
  { title: "Newsletter Signup", slug: "newsletter", clicks: 4521, trend: 42 },
  { title: "Webinar Registration", slug: "webinar-reg", clicks: 3200, trend: 5 },
];

const topCountries = [
  { country: "United States", clicks: 18234, percentage: 40, flag: "🇺🇸" },
  { country: "United Kingdom", clicks: 8920, percentage: 20, flag: "🇬🇧" },
  { country: "Germany", clicks: 5673, percentage: 13, flag: "🇩🇪" },
  { country: "France", clicks: 4521, percentage: 10, flag: "🇫🇷" },
  { country: "Canada", clicks: 3892, percentage: 9, flag: "🇨🇦" },
];

const Analytics = () => {
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
        {mockStats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-4">Top Performing Links</h3>
          <div className="space-y-4">
            {topLinks.map((link, index) => (
              <div key={link.slug} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">/{link.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{link.clicks.toLocaleString()}</span>
                  <div className={`flex items-center gap-1 text-sm ${link.trend >= 0 ? "text-success" : "text-destructive"}`}>
                    {link.trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(link.trend)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Countries */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-4">Geographic Distribution</h3>
          <div className="space-y-4">
            {topCountries.map((country) => (
              <div key={country.country} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{country.flag}</span>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{country.clicks.toLocaleString()} ({country.percentage}%)</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
