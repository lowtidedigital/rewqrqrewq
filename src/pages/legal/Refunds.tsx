import { Helmet } from "react-helmet-async";
import { CreditCard, Clock, Mail } from "lucide-react";

const Refunds = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy | LinkHarbour</title>
        <meta name="description" content="LinkHarbour refund policy. Learn about our refund process for paid subscriptions." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <p className="text-muted-foreground">
          We want you to be satisfied with LinkHarbour. If you're not, here's how refunds work.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Eligibility</h2>
        
        <div className="space-y-4 not-prose">
          <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Case-by-Case Basis</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Refunds are handled on a case-by-case basis. We'll review your request and respond within a few business days.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">14-Day Window</h4>
              <p className="text-sm text-muted-foreground mt-1">
                If you believe you were charged in error, contact support within 14 days of the charge for the best chance of resolution.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">How to Request</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Email us at support@linkharbour.io with your account email and the reason for your refund request.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Cancellations</h2>
        <p className="text-muted-foreground">
          You can cancel your subscription at any time from your billing settings. After cancellation, you'll retain access until the end of your current billing period.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p className="text-muted-foreground">
          For refund requests or billing questions, contact us at{" "}
          <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>
        </p>
      </article>
    </>
  );
};

export default Refunds;
