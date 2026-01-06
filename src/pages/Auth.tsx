import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, User, ArrowLeft, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

type AuthMode = "signin" | "signup" | "reset" | "confirm" | "reset-confirm";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, confirmSignUp, forgotPassword, confirmForgotPassword, resendConfirmationCode, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    code: "",
    newPassword: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      switch (mode) {
        case "signin": {
          if (!formData.email || !formData.password) {
            throw { message: "Please fill in all fields" };
          }
          await signIn(formData.email, formData.password);
          // Navigation happens via useEffect
          break;
        }
        case "signup": {
          if (!formData.email || !formData.password || !formData.name) {
            throw { message: "Please fill in all fields" };
          }
          if (formData.password.length < 8) {
            throw { message: "Password must be at least 8 characters" };
          }
          const result = await signUp(formData.email, formData.password, formData.name);
          if (result.requiresConfirmation) {
            setPendingEmail(formData.email);
            setMode("confirm");
            setSuccess("Check your email for a verification code");
          }
          break;
        }
        case "confirm": {
          if (!formData.code) {
            throw { message: "Please enter the verification code" };
          }
          await confirmSignUp(pendingEmail || formData.email, formData.code);
          setSuccess("Email verified! You can now sign in.");
          setMode("signin");
          setFormData({ ...formData, code: "" });
          break;
        }
        case "reset": {
          if (!formData.email) {
            throw { message: "Please enter your email" };
          }
          await forgotPassword(formData.email);
          setPendingEmail(formData.email);
          setMode("reset-confirm");
          setSuccess("Check your email for a reset code");
          break;
        }
        case "reset-confirm": {
          if (!formData.code || !formData.newPassword) {
            throw { message: "Please fill in all fields" };
          }
          if (formData.newPassword.length < 8) {
            throw { message: "Password must be at least 8 characters" };
          }
          await confirmForgotPassword(pendingEmail, formData.code, formData.newPassword);
          setSuccess("Password reset! You can now sign in.");
          setMode("signin");
          setFormData({ ...formData, code: "", newPassword: "" });
          break;
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await resendConfirmationCode(pendingEmail || formData.email);
      setSuccess("Verification code sent!");
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form if already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/30 rounded-full blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <BrandLogo variant="authPanel" linkTo="/" />

          <div className="space-y-6">
            <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight">
              Shorten links,
              <br />
              amplify reach.
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Join thousands of marketers using Link Harbour to create, track, and optimise their links.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-primary bg-white/20 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-sm">
                <span className="font-semibold text-white">50,000+</span> happy users
              </p>
            </div>
          </div>

          <p className="text-white/60 text-sm">
            © 2025 Link Harbour. All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <BrandLogo variant="header" linkTo="/" />
          </div>

          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "reset" && "Reset password"}
              {mode === "confirm" && "Verify your email"}
              {mode === "reset-confirm" && "Set new password"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "signin" && "Sign in to your Link Harbour account"}
              {mode === "signup" && "Start shortening links in seconds"}
              {mode === "reset" && "We'll send you a reset code"}
              {mode === "confirm" && `Enter the code sent to ${pendingEmail}`}
              {mode === "reset-confirm" && "Enter the code and your new password"}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm mb-4"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-11 h-12"
                  />
                </div>
              </div>
            )}

            {(mode === "signin" || mode === "signup" || mode === "reset") && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-11 h-12"
                  />
                </div>
              </div>
            )}

            {(mode === "confirm" || mode === "reset-confirm") && (
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
            )}

            {(mode === "signin" || mode === "signup") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 pr-11 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                )}
              </div>
            )}

            {mode === "reset-confirm" && (
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="pl-11 pr-11 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {mode === "signin" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "reset" && "Send Reset Code"}
                  {mode === "confirm" && "Verify Email"}
                  {mode === "reset-confirm" && "Reset Password"}
                </>
              )}
            </Button>

            {mode === "confirm" && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend verification code
              </Button>
            )}
          </form>

          {/* Toggle Mode */}
          <p className="text-center mt-6 text-muted-foreground">
            {mode === "signin" && (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
            {(mode === "reset" || mode === "confirm" || mode === "reset-confirm") && (
              <>
                Remember your password?{" "}
                <button
                  onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
