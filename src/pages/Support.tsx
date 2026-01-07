import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Clock, FileText, MessageCircle, Book, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

const Support = () => {
  return (
    <>
      <Helmet>
        <title>Support | LinkHarbour</title>
        <meta name="description" content="Get help with LinkHarbour. Contact our support team or browse our documentation." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <BrandLogo variant="header" linkTo="/" />
              <div className="flex items-center gap-4">
                <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Docs
                </Link>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                How can we help?
              </h1>
              <p className="text-xl text-muted-foreground">
                Get in touch with our support team or browse our documentation.
              </p>
            </div>

            {/* Contact Card */}
            <div className="p-8 rounded-2xl border border-border bg-card mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Contact Support</h2>
                  <p className="text-muted-foreground">
                    Email us and we'll get back to you as soon as possible.
                  </p>
                </div>
              </div>

              <a
                href="mailto:support@linkharbour.io"
                className="inline-flex items-center gap-2 text-lg font-medium text-primary hover:underline mb-6"
              >
                <Mail className="w-5 h-5" />
                support@linkharbour.io
              </a>

              <div className="flex items-center gap-2 text-muted-foreground mb-8">
                <Clock className="w-4 h-4" />
                <span>Typical response: 1–2 business days</span>
              </div>

              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Please include in your message:
                </h4>
                <ul className="text-muted-foreground space-y-2">
                  <li>• The short link slug (or link ID) if applicable</li>
                  <li>• What you expected to happen</li>
                  <li>• Screenshot or error message (if applicable)</li>
                </ul>
              </div>
            </div>

            {/* Self-Service Options */}
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                to="/docs"
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Book className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Documentation
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn how to use LinkHarbour with our comprehensive guides.
                </p>
              </Link>

              <Link
                to="/docs/faq"
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    FAQ
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Find answers to frequently asked questions.
                </p>
              </Link>

              <Link
                to="/docs/troubleshooting"
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Troubleshooting
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Common issues and how to resolve them.
                </p>
              </Link>

              <Link
                to="/legal/terms"
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Legal & Policies
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Terms, privacy policy, and other legal documents.
                </p>
              </Link>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              © 2026 Link Harbour. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Support;
