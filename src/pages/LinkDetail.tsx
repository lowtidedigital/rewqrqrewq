import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import {
  ArrowLeft,
  Link2,
  Wand2,
  Calendar,
  Tag,
  FileText,
  Zap,
  BarChart2,
  MousePointerClick,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Copy,
  Check,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { config, buildShortUrl } from "@/config";

// Mock data for the link - uses buildShortUrl for correct domain
const mockLink = {
  id: "1",
  slug: "spring-sale",
  shortUrl: buildShortUrl("spring-sale"), // Uses lh.linkharbour.io/r/{slug}
  longUrl: "https://mystore.com/collections/spring-2024-sale?utm_source=social&utm_medium=instagram",
  title: "Spring Sale Campaign",
  clicks: 4521,
  enabled: true,
  createdAt: "2024-03-15T10:30:00Z",
  updatedAt: "2024-03-18T09:15:00Z",
  expiresAt: "",
  redirectType: "302",
  tags: ["marketing", "sale"],
  notes: "Main campaign link for the Spring 2024 sale. Used in Instagram bio and stories.",
  privacyMode: false,
};

// Mock analytics data
const mockAnalytics = {
  clicksByDay: [
    { date: "Mar 15", clicks: 245 },
    { date: "Mar 16", clicks: 892 },
    { date: "Mar 17", clicks: 1123 },
    { date: "Mar 18", clicks: 1456 },
    { date: "Mar 19", clicks: 805 },
  ],
  topReferrers: [
    { source: "instagram.com", clicks: 2145 },
    { source: "twitter.com", clicks: 892 },
    { source: "facebook.com", clicks: 567 },
    { source: "direct", clicks: 453 },
    { source: "linkedin.com", clicks: 234 },
  ],
  topCountries: [
    { country: "United States", clicks: 2341, flag: "🇺🇸" },
    { country: "United Kingdom", clicks: 892, flag: "🇬🇧" },
    { country: "Germany", clicks: 456, flag: "🇩🇪" },
    { country: "France", clicks: 345, flag: "🇫🇷" },
    { country: "Canada", clicks: 234, flag: "🇨🇦" },
  ],
  devices: [
    { type: "Mobile", percentage: 68, icon: Smartphone },
    { type: "Desktop", percentage: 28, icon: Monitor },
    { type: "Tablet", percentage: 4, icon: Tablet },
  ],
};

const LinkDetail = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    longUrl: mockLink.longUrl,
    slug: mockLink.slug,
    title: mockLink.title,
    tags: mockLink.tags,
    notes: mockLink.notes,
    expiresAt: mockLink.expiresAt,
    redirectType: mockLink.redirectType,
    enabled: mockLink.enabled,
    privacyMode: mockLink.privacyMode,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mockLink.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/dashboard/links"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Links
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold truncate">
                {mockLink.title || mockLink.slug}
              </h1>
              {!mockLink.enabled && (
                <Badge variant="secondary">Disabled</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a
                href={mockLink.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-1.5"
              >
                {mockLink.shortUrl.replace("https://", "")}
                <ExternalLink className="w-4 h-4" />
              </a>
              <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button variant="hero">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="longUrl" className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    Destination URL
                  </Label>
                  <Input
                    id="longUrl"
                    type="url"
                    value={formData.longUrl}
                    onChange={(e) => setFormData({ ...formData, longUrl: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    Custom Slug
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">{config.shortDomain}/r/</span>
                    <Input
                      id="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Expiration Date
                    </Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirectType" className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Redirect Type
                    </Label>
                    <Select
                      value={formData.redirectType}
                      onValueChange={(value) => setFormData({ ...formData, redirectType: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="redirectType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="302">302 - Temporary</SelectItem>
                        <SelectItem value="301">301 - Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={!isEditing}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Clicks</span>
                    <span className="font-display font-bold text-xl">{mockLink.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(mockLink.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-sm">{new Date(mockLink.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Link Status</p>
                    <p className="text-sm text-muted-foreground">Enable or disable this link</p>
                  </div>
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Privacy Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce tracking data</p>
                  </div>
                  <Switch
                    checked={formData.privacyMode}
                    onCheckedChange={(checked) => setFormData({ ...formData, privacyMode: checked })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Clicks Over Time */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Clicks Over Time
              </h3>
              <div className="space-y-3">
                {mockAnalytics.clicksByDay.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-16">{day.date}</span>
                    <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-lg transition-all duration-500"
                        style={{ width: `${(day.clicks / 1500) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{day.clicks}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-primary" />
                Top Referrers
              </h3>
              <div className="space-y-3">
                {mockAnalytics.topReferrers.map((ref, index) => (
                  <div key={ref.source} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <span className="font-medium">{ref.source}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{ref.clicks.toLocaleString()} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Top Countries
              </h3>
              <div className="space-y-3">
                {mockAnalytics.topCountries.map((country) => (
                  <div key={country.country} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{country.clicks.toLocaleString()} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4">Devices</h3>
              <div className="space-y-4">
                {mockAnalytics.devices.map((device) => (
                  <div key={device.type} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <device.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{device.type}</span>
                        <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full transition-all duration-500"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="rounded-xl border border-border bg-card p-8 max-w-md w-full">
              <h3 className="font-display text-xl font-semibold text-center mb-6">QR Code for your link</h3>
              <QRCodeDisplay url={mockLink.shortUrl} size="lg" />
              <p className="text-center text-muted-foreground text-sm mt-6">
                Scan this QR code to access your short link. Download as PNG or SVG for print and digital use.
              </p>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkDetail;
