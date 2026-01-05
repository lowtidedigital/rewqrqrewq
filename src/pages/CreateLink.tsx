import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CreateLinkForm from "@/components/CreateLinkForm";
import { ArrowLeft } from "lucide-react";

const CreateLink = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/dashboard/links"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Links
        </Link>

        <h1 className="font-display text-3xl font-bold mb-2">Create New Link</h1>
        <p className="text-muted-foreground mb-8">
          Shorten a URL and get a QR code instantly.
        </p>
      </motion.div>

      <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
        <CreateLinkForm />
      </div>
    </div>
  );
};

export default CreateLink;
