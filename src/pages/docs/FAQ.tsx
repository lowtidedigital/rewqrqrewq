import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is LinkHarbour?",
    answer: "LinkHarbour is a URL shortening service that lets you create branded short links, generate QR codes, and track detailed analytics on how your links perform.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes! We offer a free tier that lets you create and manage short links with basic analytics. Upgrade to a paid plan for advanced features like custom slugs, detailed analytics, and more.",
  },
  {
    question: "How do I create a short link?",
    answer: "Sign in to your dashboard, click 'Create Link', paste your destination URL, optionally customize the slug, and save. Your short link is ready to share immediately.",
  },
  {
    question: "Can I customize my short link URL?",
    answer: "Yes! You can set a custom slug when creating a link. Custom slugs must be unique across the platform.",
  },
  {
    question: "How long do links last?",
    answer: "Links remain active indefinitely unless you set an expiration date or manually disable/delete them.",
  },
  {
    question: "Can I edit a link after creating it?",
    answer: "Yes, you can update the destination URL, title, tags, and other properties. If you change the slug, the old URL will stop working.",
  },
  {
    question: "What analytics do you provide?",
    answer: "We track clicks (daily, weekly, monthly, all-time), referrer sources, device types (desktop/mobile/tablet), and geographic locations when available.",
  },
  {
    question: "Why do some clicks show as 'unknown' or 'direct'?",
    answer: "This happens when referrer information isn't available due to browser privacy settings, ad blockers, or when users type the link directly. It's normal behavior.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use HTTPS encryption, secure authentication, and access controls to protect your account and data. Your links are only visible to you.",
  },
  {
    question: "Can I delete my account?",
    answer: "Yes. Contact our support team to request account deletion. Some data may be retained for legal and abuse prevention purposes.",
  },
];

const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>FAQ | LinkHarbour Docs</title>
        <meta name="description" content="Find answers to frequently asked questions about LinkHarbour link shortening service." />
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold font-display mb-6">Frequently Asked Questions</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Find answers to common questions about LinkHarbour.
        </p>

        <Accordion type="single" collapsible className="not-prose space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="p-6 rounded-xl border border-border bg-muted/30 mt-8">
          <h3 className="font-semibold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground">
            Can't find the answer you're looking for?{" "}
            <Link to="/support" className="text-primary hover:underline">
              Contact our support team
            </Link>{" "}
            and we'll help you out.
          </p>
        </div>
      </article>
    </>
  );
};

export default FAQ;
