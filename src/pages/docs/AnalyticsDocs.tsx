import { Helmet } from "react-helmet-async";

const AnalyticsDocs = () => {
  return (
    <>
      <Helmet>
        <title>Analytics | LinkHarbour Docs</title>
        <meta name="description" content="Understand how LinkHarbour analytics helps you track clicks, referrers, devices, and locations for your short links." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">Analytics Overview</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          LinkHarbour analytics helps you understand how your short links perform.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What You Can See</h2>
        
        <div className="grid gap-4 md:grid-cols-2 not-prose">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Click Metrics</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clicks today</li>
              <li>• Clicks this week</li>
              <li>• Clicks this month</li>
              <li>• Total clicks (all time)</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Traffic Sources</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Referrer websites</li>
              <li>• Direct traffic</li>
              <li>• Social media sources</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Device Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Desktop vs Mobile vs Tablet</li>
              <li>• Browser types</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Geographic Data</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Country of visitors</li>
              <li>• Regional distribution</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Important Limitations</h2>
        
        <div className="space-y-4 text-muted-foreground">
          <div className="p-4 rounded-lg border border-warning/50 bg-warning/10">
            <p className="m-0">
              <strong className="text-warning">Privacy & Browser Limitations:</strong> Some clicks may show as "direct" or "unknown" due to privacy settings, browsers, ad blockers, or missing referrer headers. This is normal and expected behavior.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="m-0">
              <strong className="text-foreground">Processing Time:</strong> Analytics may take a short time to appear after clicks occur. Allow a few minutes for data to fully populate.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Viewing Analytics</h2>
        
        <p className="text-muted-foreground">
          You can view analytics in two places:
        </p>
        
        <ul className="text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Dashboard Analytics:</strong> See an overview of all your links' performance in one place.</li>
          <li><strong className="text-foreground">Per-Link Analytics:</strong> Click on any link and select "View Analytics" to see detailed stats for that specific link.</li>
        </ul>
      </article>
    </>
  );
};

export default AnalyticsDocs;
