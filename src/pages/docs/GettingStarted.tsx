import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const GettingStarted = () => {
  return (
    <>
      <Helmet>
        <title>Getting Started | LinkHarbour Docs</title>
        <meta name="description" content="Learn how to create an account, set up your first short link, and start tracking analytics with LinkHarbour." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">Getting Started</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Get up and running with LinkHarbour in just a few minutes.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Start</h2>
        
        <ol className="space-y-4 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">1</span>
            <div>
              <strong className="text-foreground">Create an account and sign in.</strong>
              <p className="mt-1">Head to the <Link to="/auth?mode=signup" className="text-primary hover:underline">sign up page</Link> and create your free account.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">2</span>
            <div>
              <strong className="text-foreground">Create your first short link from the dashboard.</strong>
              <p className="mt-1">Click "Create Link" and paste your destination URL. Optionally customize the slug.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">3</span>
            <div>
              <strong className="text-foreground">Copy the short link and share it anywhere.</strong>
              <p className="mt-1">Your short link is ready to use immediately. Share it on social media, emails, or anywhere else.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium shrink-0">4</span>
            <div>
              <strong className="text-foreground">View analytics per-link or in the Analytics dashboard.</strong>
              <p className="mt-1">Track clicks, referrers, devices, and locations to understand your audience.</p>
            </div>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Permissions</h2>
        
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-muted-foreground m-0">
            You can only view and manage links created under your account. Each user's links are private and separate.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Next Steps</h2>
        
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <Link to="/docs/creating-links" className="text-primary hover:underline">Learn more about creating links →</Link>
          </li>
          <li>
            <Link to="/docs/analytics" className="text-primary hover:underline">Explore analytics features →</Link>
          </li>
          <li>
            <Link to="/docs/security" className="text-primary hover:underline">Understand our security measures →</Link>
          </li>
        </ul>
      </article>
    </>
  );
};

export default GettingStarted;
