# LinkHarbour Dashboard QA Checklist

Use this checklist to verify all dashboard features are working correctly before release.

## Prerequisites
- [ ] Have a valid account on https://app.linkharbour.io
- [ ] Browser dev tools open to monitor network requests and console

---

## 1. Authentication

### Sign Up
- [ ] Navigate to https://app.linkharbour.io/auth
- [ ] Click "Sign Up" tab
- [ ] Enter valid email, password, and name
- [ ] Verify confirmation email is sent (if email confirmation enabled)
- [ ] Complete confirmation if required
- [ ] Verify redirect to dashboard after signup

### Sign In
- [ ] Navigate to https://app.linkharbour.io/auth
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Verify redirect to dashboard
- [ ] Verify no "Demo User" text anywhere in UI

### Sign Out
- [ ] Click user menu in header
- [ ] Click "Sign Out"
- [ ] Verify redirect to landing page
- [ ] Verify cannot access /dashboard routes when logged out

---

## 2. Profile & Settings

### Real User Display
- [ ] Navigate to Settings
- [ ] Verify email shows your real email (not demo@example.com)
- [ ] Verify name shows your name or is blank (not "Demo User")
- [ ] Verify DashboardHeader shows real name or email prefix

### Update Profile
- [ ] Edit your name
- [ ] Click "Save Changes"
- [ ] Verify toast success message
- [ ] Refresh page
- [ ] Verify name persists

### Change Password
- [ ] Click "Change Password" button
- [ ] Enter current password
- [ ] Enter new password + confirmation
- [ ] Click "Change Password"
- [ ] Verify success message
- [ ] Sign out and sign in with new password

### API Access Section
- [ ] Verify "API Access" shows "Coming Soon" badge
- [ ] Verify NO fake API key is displayed
- [ ] Verify copy/regenerate buttons are NOT active

### Notification Preferences
- [ ] Toggle email reports switch
- [ ] Verify "Preferences saved. Email delivery coming soon." message
- [ ] Refresh page
- [ ] Verify preference persists

### Security
- [ ] Verify "Enable Two-Factor Authentication" shows "Coming Soon"
- [ ] Verify Change Password works (tested above)

---

## 3. Link Management

### Create Link
- [ ] Navigate to Dashboard > Create Link
- [ ] Enter a destination URL (e.g., https://example.com)
- [ ] Optionally add title, custom slug
- [ ] Click "Create Short Link"
- [ ] Verify success screen appears with short URL
- [ ] Verify short URL format: `https://lh.linkharbour.io/r/{slug}`
- [ ] Copy short URL
- [ ] Verify link appears in Links list

### View Links List
- [ ] Navigate to Dashboard > Links
- [ ] Verify all your links appear
- [ ] Verify each link shows correct short URL domain (lh.linkharbour.io)
- [ ] Verify click counts are real (not mock numbers)

### Edit Link
- [ ] Click "Edit Link" from dropdown menu (or navigate to link detail)
- [ ] Click "Edit" button
- [ ] Change title or destination URL
- [ ] Click "Save Changes"
- [ ] Verify success toast
- [ ] Verify changes persist after refresh

### Toggle Enable/Disable
- [ ] From link card dropdown, click "Disable Link"
- [ ] Verify success toast
- [ ] Verify "Disabled" badge appears
- [ ] Click "Enable Link"
- [ ] Verify badge disappears

### Delete Link
- [ ] From link card dropdown, click "Delete Link"
- [ ] Verify confirmation dialog appears
- [ ] Click "Delete"
- [ ] Verify link removed from list
- [ ] Verify success toast

### QR Code
- [ ] Click "Show QR Code" from link card
- [ ] Verify QR code appears
- [ ] Verify QR encodes the short URL (lh.linkharbour.io/r/...)
- [ ] Click "PNG" download - verify file downloads
- [ ] Click "SVG" download - verify file downloads
- [ ] Scan QR code with phone - verify it goes to correct destination

---

## 4. Analytics

### Dashboard Overview
- [ ] Navigate to Dashboard (main page)
- [ ] Verify stats cards show real numbers (may be 0 for new accounts)
- [ ] Verify no mock numbers like "45.2K" appear

### Analytics Page
- [ ] Navigate to Dashboard > Analytics
- [ ] If no links/clicks: verify empty state "No analytics yet"
- [ ] If links exist: verify real click counts
- [ ] Verify "Geographic Distribution" shows "coming soon" message
- [ ] Verify top performing links are real (not mock data)

### Per-Link Analytics
- [ ] Navigate to a link detail page
- [ ] Click "Analytics" tab
- [ ] If no clicks: verify empty state "No analytics yet"
- [ ] If clicks exist: verify real data in charts

---

## 5. Redirect Flow

### Short Link Redirect
```bash
# Test redirect works
curl -I https://lh.linkharbour.io/r/{your-slug}

# Expected: 302 redirect to your destination URL
```

- [ ] Open short link in browser
- [ ] Verify redirect to destination
- [ ] Verify click count increments in dashboard

### Disabled Link
- [ ] Disable a link
- [ ] Visit its short URL
- [ ] Verify appropriate disabled message (not redirect)

### Wrong Domain Handler
- [ ] Visit https://app.linkharbour.io/r/test
- [ ] Verify message: "Short Links Live Elsewhere"
- [ ] Verify button to open correct domain

---

## 6. No Hardcoded Demo Content

Search codebase for these terms - should NOT appear in production UI:

- [ ] "Demo User" - MUST NOT appear
- [ ] "demo@example.com" - MUST NOT appear
- [ ] "api_key_placeholder" - MUST NOT appear
- [ ] "sk_live" or fake API keys - MUST NOT appear
- [ ] "45.2K" or other mock analytics - MUST NOT appear
- [ ] "awsapp.linkharbour.io" - MUST NOT appear

---

## 7. Domain Configuration

### Short Domain
- [ ] All short URLs use: `lh.linkharbour.io`
- [ ] QR codes encode: `lh.linkharbour.io/r/{slug}`
- [ ] No references to old domains

### App Domain
- [ ] App accessible at: `app.linkharbour.io`
- [ ] 404 page links to: `app.linkharbour.io`

### Apex Domain (if configured)
- [ ] `linkharbour.io` redirects to `app.linkharbour.io`
- [ ] `www.linkharbour.io` redirects to `app.linkharbour.io`
- [ ] No S3 XML AccessDenied error

---

## 8. Error Handling

### Network Errors
- [ ] Disable network in dev tools
- [ ] Try to create a link
- [ ] Verify error toast appears
- [ ] Verify UI doesn't crash

### Invalid Form Data
- [ ] Try to create link without URL
- [ ] Verify validation error message
- [ ] Enter invalid URL format
- [ ] Verify appropriate error

---

## Sign-Off

| Area | Tested By | Date | Status |
|------|-----------|------|--------|
| Authentication | | | |
| Profile/Settings | | | |
| Link CRUD | | | |
| Analytics | | | |
| Redirects | | | |
| No Demo Content | | | |
| Domain Config | | | |
| Error Handling | | | |

**Overall Status:** [ ] PASS / [ ] FAIL

**Notes:**
