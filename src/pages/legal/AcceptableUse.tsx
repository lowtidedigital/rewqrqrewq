import { Helmet } from "react-helmet-async";
import { XCircle } from "lucide-react";

const prohibitedUses = [
  "Distribute malware or malicious files",
  "Phish, scam, or mislead users",
  "Promote hate, violence, or illegal activity",
  "Evade law enforcement or platform moderation",
  "Harass or abuse others",
  "Send spam or run deceptive campaigns",
  "Infringe on intellectual property rights",
  "Impersonate individuals or organizations",
];

const AcceptableUse = () => {
  return (
    <>
      <Helmet>
        <title>Acceptable Use Policy | LinkHarbour</title>
        <meta name="description" content="LinkHarbour Acceptable Use Policy. Learn what activities are prohibited on our platform." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-2">Acceptable Use Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <p className="text-muted-foreground">
          This policy outlines what you may not do when using LinkHarbour. Violations may result in link removal and account suspension.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Activities</h2>
        
        <p className="text-muted-foreground mb-4">You may not use LinkHarbour to:</p>

        <div className="space-y-3 not-prose">
          {prohibitedUses.map((use, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{use}</span>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Enforcement</h2>
        <p className="text-muted-foreground">
          We may remove links or suspend accounts to protect users and the platform. We reserve the right to take action at our discretion without prior notice.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Reporting Abuse</h2>
        <p className="text-muted-foreground">
          If you encounter a LinkHarbour link that violates this policy, please report it to{" "}
          <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>.
        </p>
      </article>
    </>
  );
};

export default AcceptableUse;
