import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  AlertCircle,
  Check,
  Trash2,
  Plus,
  Download,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { config, buildShortUrl } from "@/config";
import { api, CreateLinkInput, Link } from "@/lib/api";
import { toast } from "sonner";

interface BulkLinkEntry {
  id: string;
  longUrl: string;
  customSlug?: string;
  title?: string;
  status: "pending" | "creating" | "success" | "error";
  error?: string;
  createdLink?: Link;
}

const BulkCreateForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<BulkLinkEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [showCsvInput, setShowCsvInput] = useState(false);

  const createMutation = useMutation({
    mutationFn: (input: CreateLinkInput) => api.createLink(input),
  });

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        longUrl: "",
        customSlug: "",
        title: "",
        status: "pending",
      },
    ]);
  };

  const updateEntry = (id: string, updates: Partial<BulkLinkEntry>) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const parseCSV = (text: string): BulkLinkEntry[] => {
    const lines = text.trim().split("\n");
    const newEntries: BulkLinkEntry[] = [];

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts[0] && parts[0].startsWith("http")) {
        newEntries.push({
          id: crypto.randomUUID(),
          longUrl: parts[0],
          customSlug: parts[1] || "",
          title: parts[2] || "",
          status: "pending",
        });
      }
    }

    return newEntries;
  };

  const handleImportCSV = () => {
    const parsed = parseCSV(csvText);
    if (parsed.length === 0) {
      toast.error("No valid URLs found in CSV");
      return;
    }
    setEntries([...entries, ...parsed]);
    setCsvText("");
    setShowCsvInput(false);
    toast.success(`Imported ${parsed.length} links`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        toast.error("No valid URLs found in file");
        return;
      }
      setEntries([...entries, ...parsed]);
      toast.success(`Imported ${parsed.length} links from file`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const validateEntry = (entry: BulkLinkEntry): string | null => {
    try {
      const url = new URL(entry.longUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        return "Only HTTP and HTTPS URLs are allowed";
      }
      return null;
    } catch {
      return "Invalid URL format";
    }
  };

  const handleCreateAll = async () => {
    const validEntries = entries.filter((e) => e.status === "pending");
    if (validEntries.length === 0) {
      toast.error("No pending links to create");
      return;
    }

    setIsProcessing(true);

    for (const entry of validEntries) {
      const validationError = validateEntry(entry);
      if (validationError) {
        updateEntry(entry.id, { status: "error", error: validationError });
        continue;
      }

      updateEntry(entry.id, { status: "creating" });

      try {
        const input: CreateLinkInput = {
          longUrl: entry.longUrl,
          customSlug: entry.customSlug || undefined,
          title: entry.title || undefined,
          enabled: true,
        };

        const createdLink = await createMutation.mutateAsync(input);
        updateEntry(entry.id, { status: "success", createdLink });
      } catch (error: any) {
        updateEntry(entry.id, {
          status: "error",
          error: error.message || "Failed to create",
        });
      }
    }

    // Refresh queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["links"] }),
      queryClient.invalidateQueries({ queryKey: ["recentLinks"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
    ]);

    setIsProcessing(false);

    const successCount = entries.filter((e) => e.status === "success").length;
    const errorCount = entries.filter((e) => e.status === "error").length;

    if (errorCount === 0) {
      toast.success(`Created ${successCount} links successfully!`);
    } else {
      toast.warning(
        `Created ${successCount} links, ${errorCount} failed`
      );
    }
  };

  const handleCopyShortUrl = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(buildShortUrl(slug));
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadTemplate = () => {
    const csv = "Long URL,Custom Slug (optional),Title (optional)\nhttps://example.com/page1,my-slug,My Link Title\nhttps://example.com/page2,,Another Link";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-links-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const successCount = entries.filter((e) => e.status === "success").length;
  const errorCount = entries.filter((e) => e.status === "error").length;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Import Options */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={addEntry}>
          <Plus className="w-4 h-4" />
          Add Row
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowCsvInput(!showCsvInput)}
        >
          <FileText className="w-4 h-4" />
          Paste CSV
        </Button>
        <Label className="cursor-pointer">
          <Button variant="outline" asChild>
            <span>
              <Upload className="w-4 h-4" />
              Upload CSV
            </span>
          </Button>
          <Input
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </Label>
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {/* CSV Paste Input */}
      {showCsvInput && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-3 p-4 rounded-xl border border-border bg-muted/30"
        >
          <Label>Paste CSV (one URL per line: url,slug,title)</Label>
          <Textarea
            placeholder="https://example.com/page1,my-slug,My Title
https://example.com/page2,,Another Link
https://example.com/page3"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleImportCSV}>
              Import
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCsvInput(false);
                setCsvText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Links Table */}
      {entries.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%]">Destination URL</TableHead>
                  <TableHead>Custom Slug</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.status === "success" ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={buildShortUrl(entry.createdLink!.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 font-mono text-sm"
                          >
                            {buildShortUrl(entry.createdLink!.slug)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              handleCopyShortUrl(entry.createdLink!.slug)
                            }
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Input
                          placeholder="https://example.com/long-url"
                          value={entry.longUrl}
                          onChange={(e) =>
                            updateEntry(entry.id, { longUrl: e.target.value })
                          }
                          disabled={entry.status === "creating"}
                          className="h-8 text-sm"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.status === "success" ? (
                        <span className="text-muted-foreground text-sm">
                          {entry.createdLink!.slug}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">
                            {config.shortDomain}/r/
                          </span>
                          <Input
                            placeholder="optional"
                            value={entry.customSlug || ""}
                            onChange={(e) =>
                              updateEntry(entry.id, {
                                customSlug: e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, ""),
                              })
                            }
                            disabled={entry.status === "creating"}
                            className="h-8 text-sm w-24"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.status === "success" ? (
                        <span className="text-muted-foreground text-sm">
                          {entry.createdLink!.title || "—"}
                        </span>
                      ) : (
                        <Input
                          placeholder="optional"
                          value={entry.title || ""}
                          onChange={(e) =>
                            updateEntry(entry.id, { title: e.target.value })
                          }
                          disabled={entry.status === "creating"}
                          className="h-8 text-sm"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.status === "pending" && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {entry.status === "creating" && (
                        <Badge variant="outline" className="animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Creating
                        </Badge>
                      )}
                      {entry.status === "success" && (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Created
                        </Badge>
                      )}
                      {entry.status === "error" && (
                        <Badge variant="destructive" title={entry.error}>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEntry(entry.id)}
                        disabled={entry.status === "creating"}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold mb-2">No links added yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add rows manually or import from a CSV file
          </p>
          <Button onClick={addEntry}>
            <Plus className="w-4 h-4" />
            Add First Link
          </Button>
        </div>
      )}

      {/* Summary & Actions */}
      {entries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border">
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              <strong>{entries.length}</strong> total
            </span>
            <span className="text-muted-foreground">
              {pendingCount} pending
            </span>
            {successCount > 0 && (
              <span className="text-green-500">{successCount} created</span>
            )}
            {errorCount > 0 && (
              <span className="text-destructive">{errorCount} errors</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/links")}
            >
              View All Links
            </Button>
            <Button
              variant="hero"
              onClick={handleCreateAll}
              disabled={isProcessing || pendingCount === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create {pendingCount} Links</>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BulkCreateForm;
