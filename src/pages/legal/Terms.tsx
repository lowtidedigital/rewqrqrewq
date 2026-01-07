import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | LinkHarbour</title>
        <meta name="description" content="LinkHarbour Terms of Service. By using LinkHarbour, you agree to these terms." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <p className="text-muted-foreground">
          By using LinkHarbour, you agree to these terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">The Service</h2>
        <p className="text-muted-foreground">
          We provide link shortening and analytics services. We may update features over time to improve the product.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Account</h2>
        <p className="text-muted-foreground">
          You're responsible for all activity under your account. Keep your credentials secure and notify us immediately of any unauthorized access.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptable Use</h2>
        <p className="text-muted-foreground">
          You agree not to use LinkHarbour for malware distribution, phishing, scams, illegal content, or abusive behavior. See our{" "}
          <Link to="/legal/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link> for details.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Availability</h2>
        <p className="text-muted-foreground">
          We aim for reliable service with high uptime, but availability is not guaranteed. We may perform maintenance that temporarily affects service availability.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Billing</h2>
        <p className="text-muted-foreground">
          Paid plans renew automatically unless canceled. Payments are handled by our payment processor. You may cancel your subscription at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
        <p className="text-muted-foreground">
          We may suspend or terminate accounts that violate the Acceptable Use Policy or these Terms of Service. You may also delete your account at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
        <p className="text-muted-foreground">
          To the maximum extent permitted by law, LinkHarbour is provided "as is" and we're not liable for indirect, incidental, special, consequential, or punitive damages.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
        <p className="text-muted-foreground">
          We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p className="text-muted-foreground">
          Questions about these terms? Contact us at{" "}
          <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>
        </p>
      </article>
    </>
  );
};

export default Terms;
