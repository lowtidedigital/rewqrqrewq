import { motion } from "framer-motion";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { config, buildShortUrl } from "@/config";
import { api, UpdateLinkInput } from "@/lib/api";
import { toast } from "sonner";

const LinkDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const defaultTab = searchParams.get('tab') || 'details';
  
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    longUrl: "",
    slug: "",
    title: "",
    tags: [] as string[],
    notes: "",
    expiresAt: "",
    redirectType: "302",
    enabled: true,
    privacyMode: false,
  });

  // Fetch real link data
  const { data: link, isLoading, error } = useQuery({
    queryKey: ['link', id],
    queryFn: () => api.getLink(id!),
    enabled: !!id,
  });

  // Fetch real analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['linkAnalytics', id],
    queryFn: () => api.getLinkAnalytics(id!),
    enabled: !!id,
  });

  // Update link mutation
  const updateMutation = useMutation({
    mutationFn: (input: UpdateLinkInput) => api.updateLink(id!, input),
    onSuccess: (updatedLink) => {
      queryClient.invalidateQueries({ queryKey: ['link', id] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success("Link updated successfully");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update link");
    },
  });

  // Initialize form data when link loads
  useEffect(() => {
    if (link) {
      setFormData({
        longUrl: link.long_url || "",
        slug: link.slug || "",
        title: link.title || "",
        tags: link.tags || [],
        notes: link.notes || "",
        expiresAt: link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : "",
        redirectType: String(link.redirect_type || 302),
        enabled: link.enabled ?? true,
        privacyMode: link.privacy_mode ?? false,
      });
    }
  }, [link]);

  const shortUrl = link ? buildShortUrl(link.slug) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSave = () => {
    const input: UpdateLinkInput = {
      longUrl: formData.longUrl,
      slug: formData.slug,
      title: formData.title || undefined,
      notes: formData.notes || undefined,
      enabled: formData.enabled,
      redirectType: Number(formData.redirectType) as 301 | 302,
      privacyMode: formData.privacyMode,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };
    updateMutation.mutate(input);
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    if (link) {
      setFormData({
        longUrl: link.long_url || "",
        slug: link.slug || "",
        title: link.title || "",
        tags: link.tags || [],
        notes: link.notes || "",
        expiresAt: link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : "",
        redirectType: String(link.redirect_type || 302),
        enabled: link.enabled ?? true,
        privacyMode: link.privacy_mode ?? false,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Link not found</h2>
        <p className="text-muted-foreground mb-6">This link doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/dashboard/links')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Links
        </Button>
      </div>
    );
  }

  // Process analytics data with comprehensive "has data" check
  const recentClicks = analytics?.recent_clicks || [];
  const clicksOverTime = analytics?.clicks_over_time || [];
  const topReferrers = analytics?.top_referrers || [];
  const topCountries = analytics?.top_countries || [];
  const deviceBreakdown = analytics?.device_breakdown || [];
  
  // Fix: Check ALL sources of analytics data, not just total_clicks
  const hasAnalytics = analytics && (
    analytics.total_clicks > 0 ||
    analytics.clicks_today > 0 ||
    analytics.clicks_this_week > 0 ||
    analytics.clicks_this_month > 0 ||
    recentClicks.length > 0 ||
    topReferrers.some(r => r.count > 0) ||
    topCountries.some(c => c.count > 0) ||
    deviceBreakdown.some(d => d.count > 0)
  );

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
                {link.title || link.slug}
              </h1>
              {!link.enabled && (
                <Badge variant="secondary">Disabled</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-1.5"
              >
                {shortUrl.replace("https://", "")}
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
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
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
                    <span className="font-display font-bold text-xl">
                      {(link.click_count || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(link.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-sm">{new Date(link.updated_at).toLocaleDateString()}</span>
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
                {formData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !hasAnalytics ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No analytics yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Share your link to start collecting click data. Analytics will appear here in real-time.
              </p>
            </motion.div>
          ) : (
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
                {clicksOverTime.length > 0 ? (
                  <div className="space-y-3">
                    {clicksOverTime.slice(0, 7).map((day) => (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden">
                          <div
                            className="h-full gradient-primary rounded-lg transition-all duration-500"
                            style={{ width: `${Math.min((day.count / Math.max(...clicksOverTime.map(d => d.count))) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{day.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No click data available</p>
                )}
              </div>

              {/* Top Referrers */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-primary" />
                  Top Referrers
                </h3>
                {topReferrers.length > 0 ? (
                  <div className="space-y-3">
                    {topReferrers.slice(0, 5).map((ref, index) => (
                      <div key={ref.referrer} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                          <span className="font-medium">{ref.referrer || 'Direct'}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{ref.count.toLocaleString()} clicks</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No referrer data available</p>
                )}
              </div>

              {/* Countries */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Top Countries
                </h3>
                {topCountries.length > 0 ? (
                  <div className="space-y-3">
                    {topCountries.slice(0, 5).map((country) => (
                      <div key={country.country} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="font-medium">{country.country || 'Unknown'}</span>
                        <span className="text-sm text-muted-foreground">{country.count.toLocaleString()} clicks</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No country data available</p>
                )}
              </div>

              {/* Devices */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold mb-4">Devices</h3>
                {deviceBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {deviceBreakdown.map((device) => {
                      const Icon = device.device === 'Mobile' ? Smartphone : device.device === 'Tablet' ? Tablet : Monitor;
                      const total = deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                      const percentage = total > 0 ? Math.round((device.count / total) * 100) : 0;
                      return (
                        <div key={device.device} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{device.device}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full gradient-primary rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No device data available</p>
                )}
              </div>
            </motion.div>
          )}
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
              <QRCodeDisplay url={shortUrl} size="lg" />
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