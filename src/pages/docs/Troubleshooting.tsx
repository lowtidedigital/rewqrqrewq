import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const issues = [
  {
    problem: "My short link isn't redirecting",
    solutions: [
      "Check if the link is enabled (not disabled) in your dashboard",
      "Verify the link hasn't expired",
      "Ensure the destination URL is valid and accessible",
      "Try clearing your browser cache and cookies",
    ],
  },
  {
    problem: "Analytics aren't showing up",
    solutions: [
      "Analytics may take a few minutes to appear after clicks",
      "Ensure you're viewing the correct link's analytics",
      "Some clicks may not register due to ad blockers or privacy settings",
      "Try refreshing the page or clicking the refresh button",
    ],
  },
  {
    problem: "I can't create a custom slug",
    solutions: [
      "Custom slugs must be unique — try a different slug",
      "Slugs can only contain letters, numbers, and hyphens",
      "Check that you have permission to use custom slugs on your plan",
    ],
  },
  {
    problem: "I forgot my password",
    solutions: [
      "Click 'Forgot Password' on the sign-in page",
      "Enter your email address",
      "Check your email for the reset link (including spam folder)",
      "Follow the link to set a new password",
    ],
  },
  {
    problem: "My QR code isn't working",
    solutions: [
      "Ensure the short link is enabled and not expired",
      "Try scanning with a different QR code reader app",
      "Make sure there's enough contrast and the QR code isn't too small",
      "Download a fresh copy of the QR code from your dashboard",
    ],
  },
  {
    problem: "Page is loading slowly",
    solutions: [
      "Check your internet connection",
      "Try clearing your browser cache",
      "Disable browser extensions that might interfere",
      "Try using a different browser",
    ],
  },
];

const Troubleshooting = () => {
  return (
    <>
      <Helmet>
        <title>Troubleshooting | LinkHarbour Docs</title>
        <meta name="description" content="Common issues and solutions for LinkHarbour. Find help with redirects, analytics, and more." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">Troubleshooting</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Having issues? Here are solutions to common problems.
        </p>

        <div className="space-y-6 not-prose">
          {issues.map((issue, index) => (
            <div key={index} className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <h3 className="font-semibold text-foreground">{issue.problem}</h3>
              </div>
              <ul className="space-y-2 ml-8">
                {issue.solutions.map((solution, sIndex) => (
                  <li key={sIndex} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 mt-8">
          <h3 className="font-semibold text-foreground mb-2">Problem not listed?</h3>
          <p className="text-muted-foreground">
            If you're experiencing an issue that isn't covered here,{" "}
            <Link to="/support" className="text-primary hover:underline">
              contact our support team
            </Link>. Please include:
          </p>
          <ul className="text-muted-foreground mt-3 space-y-1">
            <li>• The short link slug or link ID</li>
            <li>• What you expected to happen</li>
            <li>• Screenshot or error message (if applicable)</li>
          </ul>
        </div>
      </article>
    </>
  );
};

export default Troubleshooting;
