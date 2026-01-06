import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LinkCard, { LinkData } from "@/components/LinkCard";
import { Plus, Search, Filter, SortAsc, Link2 } from "lucide-react";
import { buildShortUrl } from "@/config";

// Mock data
const mockLinks: LinkData[] = [
  {
    id: "1",
    slug: "spring-sale",
    shortUrl: buildShortUrl("spring-sale"),
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
    shortUrl: buildShortUrl("product-demo"),
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
    shortUrl: buildShortUrl("newsletter"),
    longUrl: "https://mysite.com/subscribe?ref=qr-code",
    title: "Newsletter Signup",
    clicks: 892,
    enabled: false,
    createdAt: "2024-02-28T09:00:00Z",
  },
  {
    id: "4",
    slug: "blog-post",
    shortUrl: buildShortUrl("blog-post"),
    longUrl: "https://blog.mysite.com/how-to-increase-conversions-with-short-links",
    title: "Blog: Increase Conversions",
    clicks: 3105,
    enabled: true,
    createdAt: "2024-03-01T11:00:00Z",
    tags: ["content", "blog"],
  },
  {
    id: "5",
    slug: "webinar-reg",
    shortUrl: buildShortUrl("webinar-reg"),
    longUrl: "https://zoom.us/webinar/register/WN_abc123xyz",
    title: "Q1 Webinar Registration",
    clicks: 756,
    enabled: true,
    createdAt: "2024-02-20T08:30:00Z",
    tags: ["webinar", "marketing"],
  },
];

const LinksList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredLinks = mockLinks
    .filter((link) => {
      const matchesSearch =
        link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.longUrl.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "enabled" && link.enabled) ||
        (filterStatus === "disabled" && !link.enabled);
      
      return matchesSearch && matchesStatus;
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
        {filteredLinks.length > 0 ? (
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
