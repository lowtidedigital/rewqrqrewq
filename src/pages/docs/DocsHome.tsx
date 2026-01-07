import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Book, Rocket, Link2, BarChart3, Shield, HelpCircle, Wrench, ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    description: "Create an account and start shortening links in minutes.",
    href: "/docs/getting-started",
    icon: Rocket,
  },
  {
    title: "Creating & Managing Links",
    description: "Learn how to create, edit, and organize your short links.",
    href: "/docs/creating-links",
    icon: Link2,
  },
  {
    title: "Analytics",
    description: "Understand how your links perform with detailed analytics.",
    href: "/docs/analytics",
    icon: BarChart3,
  },
  {
    title: "Security & Privacy",
    description: "Learn about our security measures and your data privacy.",
    href: "/docs/security",
    icon: Shield,
  },
  {
    title: "FAQ",
    description: "Find answers to frequently asked questions.",
    href: "/docs/faq",
    icon: HelpCircle,
  },
  {
    title: "Troubleshooting",
    description: "Common issues and how to resolve them.",
    href: "/docs/troubleshooting",
    icon: Wrench,
  },
];

const DocsHome = () => {
  return (
    <>
      <Helmet>
        <title>Documentation | LinkHarbour</title>
        <meta name="description" content="Everything you need to shorten links, manage redirects, and understand analytics with LinkHarbour." />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-display mb-4">LinkHarbour Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to shorten links, manage redirects, and understand analytics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                to={section.href}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {section.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-6 rounded-xl border border-border bg-muted/30">
          <h3 className="font-semibold text-foreground mb-2">Need help?</h3>
          <p className="text-muted-foreground">
            Can't find what you're looking for?{" "}
            <Link to="/support" className="text-primary hover:underline">
              Contact our support team
            </Link>{" "}
            and we'll get back to you within 1–2 business days.
          </p>
        </div>
      </div>
    </>
  );
};

export default DocsHome;
