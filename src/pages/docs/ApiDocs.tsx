import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Code, Lock, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ApiDocs = () => {
  return (
    <>
      <Helmet>
        <title>API Documentation | LinkHarbour Docs</title>
        <meta name="description" content="LinkHarbour API documentation. Integrate link shortening and analytics into your applications." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">API Documentation</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Integrate LinkHarbour's powerful link shortening and analytics into your applications.
        </p>

        {/* Coming Soon Banner */}
        <div className="not-prose p-6 rounded-xl border border-primary/30 bg-primary/5 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">API Access Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're working on a full REST API that will let you create links, retrieve analytics, and manage your account programmatically. API access will be available on Pro plans and above.
              </p>
              <Button variant="hero" size="sm" asChild>
                <Link to="/pricing">
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Planned Endpoints</h2>
        
        <p className="text-muted-foreground mb-4">
          Here's a preview of the API endpoints we're building:
        </p>

        <div className="space-y-4 not-prose">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-green-500/20 text-green-400 rounded">POST</span>
              <code className="text-sm text-foreground">/api/v1/links</code>
            </div>
            <p className="text-sm text-muted-foreground">Create a new short link</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-blue-500/20 text-blue-400 rounded">GET</span>
              <code className="text-sm text-foreground">/api/v1/links</code>
            </div>
            <p className="text-sm text-muted-foreground">List all your short links</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-blue-500/20 text-blue-400 rounded">GET</span>
              <code className="text-sm text-foreground">/api/v1/links/:id</code>
            </div>
            <p className="text-sm text-muted-foreground">Get details for a specific link</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-yellow-500/20 text-yellow-400 rounded">PATCH</span>
              <code className="text-sm text-foreground">/api/v1/links/:id</code>
            </div>
            <p className="text-sm text-muted-foreground">Update an existing link</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-red-500/20 text-red-400 rounded">DELETE</span>
              <code className="text-sm text-foreground">/api/v1/links/:id</code>
            </div>
            <p className="text-sm text-muted-foreground">Delete a short link</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-blue-500/20 text-blue-400 rounded">GET</span>
              <code className="text-sm text-foreground">/api/v1/links/:id/analytics</code>
            </div>
            <p className="text-sm text-muted-foreground">Get analytics for a specific link</p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-blue-500/20 text-blue-400 rounded">GET</span>
              <code className="text-sm text-foreground">/api/v1/analytics</code>
            </div>
            <p className="text-sm text-muted-foreground">Get aggregated analytics for your account</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Authentication</h2>
        
        <div className="not-prose flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">API Keys</h4>
            <p className="text-sm text-muted-foreground">
              API requests will be authenticated using API keys. You'll be able to generate and manage keys from your dashboard settings.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Rate Limits</h2>
        
        <p className="text-muted-foreground">
          API rate limits will vary by plan:
        </p>

        <div className="not-prose mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Requests/min</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Requests/day</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Pro</td>
                <td className="py-3 px-4">60</td>
                <td className="py-3 px-4">10,000</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Business</td>
                <td className="py-3 px-4">120</td>
                <td className="py-3 px-4">50,000</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Enterprise</td>
                <td className="py-3 px-4">Custom</td>
                <td className="py-3 px-4">Custom</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Get Notified</h2>
        
        <p className="text-muted-foreground">
          Want to be notified when the API launches? Contact us at{" "}
          <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>{" "}
          and we'll let you know as soon as it's ready.
        </p>
      </article>
    </>
  );
};

export default ApiDocs;
