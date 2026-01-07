import { Helmet } from "react-helmet-async";
import { Shield, Lock, Eye, Key } from "lucide-react";

const SecurityDocs = () => {
  return (
    <>
      <Helmet>
        <title>Security | LinkHarbour Docs</title>
        <meta name="description" content="Learn about LinkHarbour's security measures and how we protect your account and data." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">Security</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          We take reasonable measures to protect your account and data.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Security Measures</h2>
        
        <div className="grid gap-4 not-prose">
          <div className="flex gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Encrypted HTTPS Traffic</h4>
              <p className="text-sm text-muted-foreground mt-1">All data transmitted between your browser and our servers is encrypted using industry-standard TLS/SSL.</p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Secure Authentication</h4>
              <p className="text-sm text-muted-foreground mt-1">Authentication is handled via secure login with password hashing and session management.</p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Access Controls</h4>
              <p className="text-sm text-muted-foreground mt-1">Strict access controls prevent cross-account data access. You can only see and manage your own links.</p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Infrastructure Security</h4>
              <p className="text-sm text-muted-foreground mt-1">Built on AWS with DynamoDB encryption, Cognito authentication, and least-privilege IAM policies.</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Your Responsibility</h2>
        
        <div className="p-4 rounded-lg border border-border bg-card">
          <ul className="text-muted-foreground space-y-2 m-0">
            <li>• <strong className="text-foreground">Use a strong password</strong> — combine letters, numbers, and symbols.</li>
            <li>• <strong className="text-foreground">Keep your account credentials private</strong> — never share your password.</li>
            <li>• <strong className="text-foreground">Only shorten links you have the right to share</strong> — don't use LinkHarbour for malicious purposes.</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Reporting Security Issues</h2>
        
        <p className="text-muted-foreground">
          If you discover a security vulnerability, please report it to us at <a href="mailto:support@linkharbour.io" className="text-primary hover:underline">support@linkharbour.io</a>. We take all reports seriously and will investigate promptly.
        </p>
      </article>
    </>
  );
};

export default SecurityDocs;
