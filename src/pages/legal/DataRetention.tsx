import { Helmet } from "react-helmet-async";
import { Database, Clock, Trash2 } from "lucide-react";

const DataRetention = () => {
  return (
    <>
      <Helmet>
        <title>Data Retention | LinkHarbour</title>
        <meta name="description" content="Learn about LinkHarbour's data retention policies and how long we keep your data." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-2">Data Retention</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <p className="text-muted-foreground">
          This policy explains how long we retain different types of data.
        </p>

        <div className="space-y-4 not-prose mt-8">
          <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Link Data</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Link data (URLs, slugs, metadata) is retained while your account is active. When you delete a link, it's removed from your dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Analytics Data</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Analytics data (click events, referrers, device info) may be retained for a limited period to provide reporting and prevent abuse.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Account Deletion</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You may request account deletion at any time. Some data may be retained if required for legal or security reasons.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Requesting Data Deletion</h2>
        <p className="text-muted-foreground">
          To request deletion of your account and associated data, contact us at{" "}
          <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Exceptions</h2>
        <p className="text-muted-foreground">
          We may retain certain data beyond these periods when required by law, to resolve disputes, enforce agreements, or prevent abuse.
        </p>
      </article>
    </>
  );
};

export default DataRetention;
