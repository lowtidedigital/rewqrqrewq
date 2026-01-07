import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | LinkHarbour</title>
        <meta name="description" content="LinkHarbour Privacy Policy. Learn what data we collect and how we use it." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What We Collect</h2>
        <ul className="text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Account information:</strong> Email address and user ID</li>
          <li><strong className="text-foreground">Links you create:</strong> Slug, destination URL, and metadata</li>
          <li><strong className="text-foreground">Usage data:</strong> Click events including timestamp, device type, country (when available), and referrer (when available)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Data</h2>
        <ul className="text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Provide the service:</strong> Redirects and analytics functionality</li>
          <li><strong className="text-foreground">Prevent abuse:</strong> Detect and stop spam, malware, and phishing</li>
          <li><strong className="text-foreground">Improve reliability:</strong> Monitor and enhance performance</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Sharing</h2>
        <p className="text-muted-foreground">
          We don't sell personal data. We may share limited data with service providers needed to operate LinkHarbour (e.g., hosting and payments).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
        <p className="text-muted-foreground">
          We retain data as needed to operate the service and meet legal and abuse-prevention requirements. You may request deletion of your account data.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Security</h2>
        <p className="text-muted-foreground">
          No system is 100% secure, but we use reasonable safeguards including encryption, secure authentication, and access controls.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p className="text-muted-foreground">
          You may access, update, or delete your account data at any time. Contact us if you need assistance.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p className="text-muted-foreground">
          Privacy questions? Contact us at{" "}
          <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>
        </p>
      </article>
    </>
  );
};

export default Privacy;
