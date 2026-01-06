import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Link2, 
  Wand2, 
  Calendar, 
  Tag, 
  FileText, 
  Zap,
  AlertCircle,
  Check,
  ExternalLink,
  Copy
} from "lucide-react";
import { config, buildShortUrl } from "@/config";
import { api, CreateLinkInput, Link } from "@/lib/api";
import { toast } from "sonner";

interface CreateLinkFormProps {
  onSuccess?: (link: Link) => void;
}

const CreateLinkForm = ({ onSuccess }: CreateLinkFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<Link | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    longUrl: "",
    customSlug: "",
    title: "",
    tags: [] as string[],
    notes: "",
    expiresAt: "",
    redirectType: "302" as "301" | "302",
    enabled: true,
  });
  
  const [tagInput, setTagInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (input: CreateLinkInput) => api.createLink(input),
    onSuccess: async (link) => {
      const shortUrl = buildShortUrl(link.slug);
      
      // Dev-mode diagnostics
      if (import.meta.env.DEV) {
        console.log('[LinkHarbour Diagnostics] Link created successfully:');
        console.log('  - Slug:', link.slug);
        console.log('  - Short URL:', shortUrl);
        console.log('  - Link ID:', link.link_id);
      }

      // Invalidate and refetch queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['links'] }),
        queryClient.invalidateQueries({ queryKey: ['recentLinks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
      ]);

      // Dev-mode: verify the GET /links works
      if (import.meta.env.DEV) {
        try {
          const linksCheck = await api.getLinks({ limit: 1 });
          console.log('[LinkHarbour Diagnostics] GET /links succeeded:', linksCheck.items.length, 'items');
        } catch (err) {
          console.error('[LinkHarbour Diagnostics] GET /links failed:', err);
        }
      }
      
      // Store the created link to show success UI
      setCreatedLink(link);
      
      // Show success toast
      toast.success("Link created successfully!", {
        description: shortUrl,
      });
      
      if (onSuccess) {
        onSuccess(link);
      }
    },
    onError: (err: any) => {
      const errorMessage = err.message || "Failed to create link. Please try again.";
      setError(errorMessage);
      
      // Show error toast - do NOT reset any state
      toast.error("Failed to create link", {
        description: errorMessage,
      });
      
      // Dev-mode diagnostics
      if (import.meta.env.DEV) {
        console.error('[LinkHarbour Diagnostics] Link creation failed:', err);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    try {
      const url = new URL(formData.longUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are allowed");
      }
    } catch {
      setError("Please enter a valid HTTP or HTTPS URL");
      return;
    }

    const input: CreateLinkInput = {
      long_url: formData.longUrl,
      custom_slug: formData.customSlug || undefined,
      title: formData.title || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      notes: formData.notes || undefined,
      expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      redirect_type: parseInt(formData.redirectType) as 301 | 302,
    };

    createMutation.mutate(input);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleCopyShortUrl = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(buildShortUrl(createdLink.slug));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCreateAnother = () => {
    setCreatedLink(null);
    setFormData({
      longUrl: "",
      customSlug: "",
      title: "",
      tags: [],
      notes: "",
      expiresAt: "",
      redirectType: "302",
      enabled: true,
    });
  };

  // Show success state with link details
  if (createdLink) {
    const shortUrl = buildShortUrl(createdLink.slug);
    
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-2">Link Created!</h3>
        <p className="text-muted-foreground mb-4">Your short link is ready to use</p>
        
        {/* Short URL display with copy */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6 w-full max-w-md">
          <div className="flex items-center justify-between gap-3">
            <a 
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-mono hover:underline flex items-center gap-2"
            >
              {shortUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
            <Button variant="ghost" size="icon-sm" onClick={handleCopyShortUrl}>
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCreateAnother}>
            Create Another
          </Button>
          <Button variant="hero" onClick={() => navigate("/dashboard/links")}>
            View All Links
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Destination URL */}
      <div className="space-y-2">
        <Label htmlFor="longUrl" className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          Destination URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="longUrl"
          type="url"
          placeholder="https://example.com/your-long-url"
          value={formData.longUrl}
          onChange={(e) => setFormData({ ...formData, longUrl: e.target.value })}
          required
          className="h-12"
        />
      </div>

      {/* Custom Slug */}
      <div className="space-y-2">
        <Label htmlFor="customSlug" className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          Custom Slug <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{config.shortDomain}/r/</span>
          <Input
            id="customSlug"
            type="text"
            placeholder="my-custom-slug"
            value={formData.customSlug}
            onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            className="flex-1"
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Title <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="My awesome link"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags" className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          Tags <span className="text-muted-foreground text-xs">(press Enter to add)</span>
        </Label>
        <Input
          id="tags"
          type="text"
          placeholder="Add tags..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Expiration & Redirect Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiresAt" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Expiration Date <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirectType" className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Redirect Type
          </Label>
          <Select
            value={formData.redirectType}
            onValueChange={(value: "301" | "302") => setFormData({ ...formData, redirectType: value })}
          >
            <SelectTrigger id="redirectType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="302">302 - Temporary Redirect</SelectItem>
              <SelectItem value="301">301 - Permanent Redirect</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          Notes <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this link..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
        <div>
          <p className="font-medium">Enable Link</p>
          <p className="text-sm text-muted-foreground">Link will be active immediately</p>
        </div>
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
        />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={createMutation.isPending || !formData.longUrl}
      >
        {createMutation.isPending ? "Creating..." : "Create Short Link"}
      </Button>
    </motion.form>
  );
};

export default CreateLinkForm;
