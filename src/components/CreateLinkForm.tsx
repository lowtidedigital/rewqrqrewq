import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Check
} from "lucide-react";
import { config, buildShortUrl } from "@/config";

interface CreateLinkFormProps {
  onSuccess?: (link: any) => void;
}

const CreateLinkForm = ({ onSuccess }: CreateLinkFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    longUrl: "",
    customSlug: "",
    title: "",
    tags: [] as string[],
    notes: "",
    expiresAt: "",
    redirectType: "302",
    enabled: true,
  });
  
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate URL
    try {
      const url = new URL(formData.longUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are allowed");
      }
    } catch {
      setError("Please enter a valid HTTP or HTTPS URL");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const slug = formData.customSlug || generateSlug();
    const newLink = {
      id: crypto.randomUUID(),
      slug: slug,
      shortUrl: buildShortUrl(slug),
      longUrl: formData.longUrl,
      title: formData.title || undefined,
      tags: formData.tags,
      notes: formData.notes,
      expiresAt: formData.expiresAt || undefined,
      redirectType: formData.redirectType,
      enabled: formData.enabled,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    setSuccess(true);
    setIsLoading(false);
    
    if (onSuccess) {
      onSuccess(newLink);
    }

    setTimeout(() => {
      navigate("/dashboard/links");
    }, 1500);
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 8);
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

  if (success) {
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
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <code className="text-primary font-mono">
            {buildShortUrl(formData.customSlug || "abc123")}
          </code>
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
            onValueChange={(value) => setFormData({ ...formData, redirectType: value })}
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
        disabled={isLoading || !formData.longUrl}
      >
        {isLoading ? "Creating..." : "Create Short Link"}
      </Button>
    </motion.form>
  );
};

export default CreateLinkForm;
