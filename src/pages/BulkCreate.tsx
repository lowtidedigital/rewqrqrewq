import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { canBulkCreate } from "@/lib/plans";
import BulkCreateForm from "@/components/BulkCreateForm";

const BulkCreate = () => {
  const { currentPlan } = useSubscription();
  const hasBulkAccess = canBulkCreate(currentPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/links">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">Bulk Create Links</h1>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Pro Feature
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Create multiple short links at once from a CSV file or paste them directly
          </p>
        </div>
      </motion.div>

      {hasBulkAccess ? (
        <BulkCreateForm />
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Bulk Creation is a Pro Feature
          </h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Upgrade to Pro or Enterprise to create multiple links at once from CSV files
            or by pasting URLs directly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="hero" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/links/new">Create Single Link</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BulkCreate;
