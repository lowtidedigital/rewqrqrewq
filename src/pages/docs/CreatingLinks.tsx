import { Helmet } from "react-helmet-async";

const CreatingLinks = () => {
  return (
    <>
      <Helmet>
        <title>Creating Links | LinkHarbour Docs</title>
        <meta name="description" content="Learn how to create, edit, and manage your short links with LinkHarbour." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">Creating Links</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Everything you need to know about creating and managing your short links.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Creating a New Link</h2>
        
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">1</span>
            <span><strong className="text-foreground">Paste a destination URL</strong> (the "long URL") — this is where users will be redirected.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">2</span>
            <span><strong className="text-foreground">Optional:</strong> Set a custom slug (must be unique across all links).</span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">3</span>
            <span><strong className="text-foreground">Optional:</strong> Set an expiration date if you want the link to stop working after a certain time.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">4</span>
            <span><strong className="text-foreground">Save</strong> your link and it's ready to share!</span>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Editing Links</h2>
        
        <div className="space-y-3 text-muted-foreground">
          <p>You can update the following properties of your links:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Destination URL</li>
            <li>Title and description</li>
            <li>Tags for organization</li>
            <li>Custom slug (if available on your plan)</li>
          </ul>
          <div className="p-4 rounded-lg border border-warning/50 bg-warning/10 mt-4">
            <p className="text-warning m-0">
              <strong>Note:</strong> If you change the slug, the old short URL will stop working. Existing links pointing to the old slug will no longer redirect.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Disabling & Deleting Links</h2>
        
        <div className="space-y-4 text-muted-foreground">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Disabling Links</h4>
            <p className="m-0">Disabled links stop redirecting users to the destination. Visitors will see a "link unavailable" message instead. You can re-enable a disabled link at any time.</p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Deleting Links</h4>
            <p className="m-0">Deleted links are removed from your active list. Some data may be retained for a limited time for audit and abuse prevention purposes.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">QR Codes</h2>
        
        <p className="text-muted-foreground">
          Every link automatically comes with a QR code. You can download it as PNG or SVG format, perfect for both print and digital campaigns.
        </p>
      </article>
    </>
  );
};

export default CreatingLinks;
