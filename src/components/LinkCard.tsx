import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ExternalLink, 
  Copy, 
  Check, 
  MoreHorizontal, 
  BarChart2, 
  Edit, 
  Trash2,
  QrCode,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import QRCodeDisplay from "./QRCodeDisplay";

export interface LinkData {
  id: string;
  slug: string;
  shortUrl: string;
  longUrl: string;
  title?: string;
  clicks: number;
  enabled: boolean;
  createdAt: string;
  tags?: string[];
}

interface LinkCardProps {
  link: LinkData;
  delay?: number;
}

const LinkCard = ({ link, delay = 0 }: LinkCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        !link.enabled && "opacity-60"
      )}
    >
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and status */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={`/dashboard/links/${link.id}`}
              className="font-display font-semibold text-lg hover:text-primary transition-colors truncate"
            >
              {link.title || link.slug}
            </Link>
            {!link.enabled && (
              <Badge variant="secondary" className="text-xs">Disabled</Badge>
            )}
          </div>

          {/* Short URL */}
          <div className="flex items-center gap-2 mb-2">
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium flex items-center gap-1.5"
            >
              {link.shortUrl.replace("https://", "")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>

          {/* Long URL */}
          <p className="text-sm text-muted-foreground truncate">
            {truncateUrl(link.longUrl)}
          </p>
        </div>

        {/* QR Code Preview */}
        <div className="hidden sm:flex flex-col items-center gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <QrCode className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/links/${link.id}`} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Link
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/links/${link.id}?tab=analytics`} className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                View Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowQR(!showQR)} className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              {showQR ? "Hide" : "Show"} QR Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              {link.enabled ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Disable Link
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Enable Link
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BarChart2 className="w-4 h-4" />
            <span className="font-medium text-foreground">{link.clicks.toLocaleString()}</span>
            clicks
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(link.createdAt)}
          </span>
        </div>

        {link.tags && link.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            {link.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {link.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{link.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* QR Code Expanded */}
      {showQR && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-4 pt-4 border-t border-border/50"
        >
          <QRCodeDisplay url={link.shortUrl} size="md" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default LinkCard;
