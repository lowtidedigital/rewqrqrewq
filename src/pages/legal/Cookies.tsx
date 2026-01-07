import { Helmet } from "react-helmet-async";
import { Cookie, Shield, BarChart3 } from "lucide-react";

const cookieTypes = [
  {
    icon: Shield,
    title: "Login & Session Management",
    description: "Essential cookies that keep you signed in and maintain your session securely.",
  },
  {
    icon: Shield,
    title: "Security & Fraud Prevention",
    description: "Cookies that help us detect and prevent malicious activity and protect your account.",
  },
  {
    icon: BarChart3,
    title: "Basic Product Analytics",
    description: "If enabled, cookies that help us understand how you use the service so we can improve it.",
  },
];

const Cookies = () => {
  return (
    <>
      <Helmet>
        <title>Cookies & Local Storage | LinkHarbour</title>
        <meta name="description" content="Learn how LinkHarbour uses cookies and local storage for login, security, and analytics." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-2">Cookies & Local Storage</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <p className="text-muted-foreground">
          LinkHarbour may use cookies and local storage to provide and improve our service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What We Use Cookies For</h2>

        <div className="space-y-4 not-prose">
          {cookieTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{type.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Managing Cookies</h2>
        <p className="text-muted-foreground">
          You can block cookies in your browser settings. However, some features may not work correctly if you disable essential cookies required for authentication.
        </p>

        <div className="p-4 rounded-lg border border-warning/50 bg-warning/10 mt-4">
          <p className="text-warning m-0">
            <strong>Note:</strong> If you block all cookies, you may not be able to sign in or use certain features of LinkHarbour.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Third-Party Cookies</h2>
        <p className="text-muted-foreground">
          We may use third-party services (such as payment processors) that set their own cookies. Please refer to their respective privacy policies for more information.
        </p>
      </article>
    </>
  );
};

export default Cookies;
