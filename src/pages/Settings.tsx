import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Key, 
  Bell, 
  Shield, 
  Trash2,
  Save,
  Info,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword, updateUserAttributes } from "@/lib/cognito";
import { toast } from "sonner";

const Settings = () => {
  const { user, refreshUser } = useAuth();
  
  // Profile state - initialized from real user data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification preferences (stored locally for now - Coming Soon for email delivery)
  const [notifications, setNotifications] = useState({
    emailReports: false,
    clickAlerts: false,
    weeklyDigest: false,
  });

  // Change password dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initialize profile from user data
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Load notification preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lh_notification_prefs');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserAttributes([
        { Name: 'name', Value: profile.name.trim() }
      ]);
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('lh_notification_prefs', JSON.stringify(updated));
    toast.success("Preferences saved. Email delivery coming soon.");
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Add your name"
            />
            {!profile.name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Add a display name for your account
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="hero" onClick={handleSaveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* API Key Section - Coming Soon */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">API Access</h2>
            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Personal API tokens coming soon</p>
              <p className="text-sm text-muted-foreground mt-1">
                We're adding personal API tokens for programmatic access. For now, the API uses Cognito authentication.
              </p>
              <a 
                href="https://docs.linkharbour.io/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View API Documentation →
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">Notifications</h2>
            <Badge variant="secondary" className="text-xs">Email delivery coming soon</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <p className="font-medium">Email Reports</p>
              <p className="text-sm text-muted-foreground">Receive detailed analytics reports</p>
            </div>
            <Switch
              checked={notifications.emailReports}
              onCheckedChange={(checked) => handleNotificationChange('emailReports', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <p className="font-medium">Click Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when links hit milestones</p>
            </div>
            <Switch
              checked={notifications.clickAlerts}
              onCheckedChange={(checked) => handleNotificationChange('clickAlerts', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">Summary of your link performance</p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" />
          Preferences are saved. Email delivery will be activated soon.
        </p>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowPasswordDialog(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <Shield className="w-4 h-4 mr-2" />
            Enable Two-Factor Authentication
            <Badge variant="secondary" className="ml-auto text-xs">Coming Soon</Badge>
          </Button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Irreversible actions</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. All your links and data will be permanently removed.
        </p>

        <Button variant="destructive" disabled>
          <Trash2 className="w-4 h-4" />
          Delete Account
          <Badge variant="secondary" className="ml-2 text-xs bg-destructive/20">Contact Support</Badge>
        </Button>
      </motion.div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;