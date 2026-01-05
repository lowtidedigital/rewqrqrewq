import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  url: string;
  size?: "sm" | "md" | "lg";
  showActions?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 64,
  md: 128,
  lg: 200,
};

const QRCodeDisplay = ({ url, size = "md", showActions = true, className }: QRCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadPNG = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) {
      // Fallback: create canvas from SVG
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = sizeMap[size] * 2;
        canvas.height = sizeMap[size] * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const link = document.createElement("a");
          link.download = "qrcode.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
      return;
    }
    
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "qrcode.svg";
    link.href = URL.createObjectURL(svgBlob);
    link.click();
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col items-center gap-4", className)}
    >
      <div 
        ref={qrRef}
        className="p-4 bg-white rounded-xl shadow-lg"
      >
        <QRCodeSVG
          value={url}
          size={sizeMap[size]}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0f172a"
        />
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPNG}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSVG}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy URL"}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default QRCodeDisplay;
