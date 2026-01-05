import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatsCard from "@/components/StatsCard";
import LinkCard, { LinkData } from "@/components/LinkCard";
import { Button } from "@/components/ui/button";
import { Link2, MousePointerClick, TrendingUp, Globe, Plus, ArrowRight } from "lucide-react";

// Mock data
const mockStats = [
  { title: "Total Links", value: "247", change: "+12 this week", changeType: "positive" as const, icon: Link2 },
  { title: "Total Clicks", value: "18.4K", change: "+23% vs last month", changeType: "positive" as const, icon: MousePointerClick },
  { title: "Click Rate", value: "4.2%", change: "-0.3% vs last week", changeType: "negative" as const, icon: TrendingUp },
  { title: "Countries", value: "42", change: "+5 new this month", changeType: "positive" as const, icon: Globe },
];

const mockLinks: LinkData[] = [
  {
    id: "1",
    slug: "spring-sale",
    shortUrl: "https://lh.io/spring-sale",
    longUrl: "https://mystore.com/collections/spring-2024-sale?utm_source=social&utm_medium=instagram",
    title: "Spring Sale Campaign",
    clicks: 4521,
    enabled: true,
    createdAt: "2024-03-15T10:30:00Z",
    tags: ["marketing", "sale"],
  },
  {
    id: "2",
    slug: "product-demo",
    shortUrl: "https://lh.io/product-demo",
    longUrl: "https://calendly.com/team/product-demo-30min",
    title: "Product Demo Booking",
    clicks: 1823,
    enabled: true,
    createdAt: "2024-03-10T14:20:00Z",
    tags: ["sales"],
  },
  {
    id: "3",
    slug: "newsletter",
    shortUrl: "https://lh.io/newsletter",
    longUrl: "https://mysite.com/subscribe?ref=qr-code",
    title: "Newsletter Signup",
    clicks: 892,
    enabled: false,
    createdAt: "2024-02-28T09:00:00Z",
  },
];

const Dashboard = () => {
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
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
          {mockLinks.map((link, index) => (
            <LinkCard key={link.id} link={link} delay={0.5 + index * 0.1} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
