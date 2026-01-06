# LinkHarbour Roadmap

This document outlines the development phases for LinkHarbour, from current MVP to full-featured enterprise product.

---

## Phase 1: Production MVP (Current Sprint) ✅

**Goal:** Ship a reliable, honest MVP with working core features.

### Completed Features
- ✅ Link creation with custom slugs, titles, tags
- ✅ QR code generation (PNG + SVG)
- ✅ Fast redirects via CloudFront + Lambda
- ✅ Enable/disable links (410 response when disabled)
- ✅ Link expiration
- ✅ Basic click analytics (per-link)
- ✅ Cognito authentication
- ✅ Profile management
- ✅ Change password

### In Progress
- 🔄 Stripe billing integration
- 🔄 Plan-based entitlements (API enforcement)
- 🔄 Consistent analytics loading

### Remaining
- [ ] Webhook for Stripe subscription events
- [ ] DynamoDB subscription table
- [ ] Backend plan enforcement (link limits, click tracking limits)

---

## Phase 2: Enhanced Features (Next)

### 1. Email Notifications (SES)
**Complexity:** Medium

**Required AWS Services:**
- Amazon SES (Simple Email Service)
- Lambda (scheduled triggers)
- EventBridge (cron for digests)

**Endpoints to Add:**
- `PUT /me/settings` - Save notification preferences
- `GET /me/settings` - Retrieve preferences
- Lambda: `send-weekly-digest` (EventBridge scheduled)
- Lambda: `send-milestone-alert` (triggered by click thresholds)

**UI Changes:**
- Settings page toggles persist to backend
- Add email template preview

**Estimate:** 2-3 days

---

### 2. MFA (Cognito TOTP)
**Complexity:** Medium

**Required AWS Services:**
- Cognito (already configured, enable MFA)

**Endpoints to Add:**
- `POST /me/mfa/setup` - Generate TOTP secret
- `POST /me/mfa/verify` - Verify TOTP code and enable MFA
- `POST /me/mfa/disable` - Disable MFA (requires verification)

**UI Changes:**
- Settings: MFA setup wizard with QR code
- Login: TOTP code input when MFA enabled
- Recovery codes display

**Estimate:** 2-3 days

---

### 3. API Tokens (Pro+ only)
**Complexity:** Medium

**Required AWS Services:**
- DynamoDB (new `api_tokens` table)
- Lambda (token validation middleware)

**Endpoints to Add:**
- `POST /me/tokens` - Create new API token (returns token once)
- `GET /me/tokens` - List tokens (metadata only, not values)
- `DELETE /me/tokens/{id}` - Revoke token

**Database Schema:**
```
api_tokens:
  PK: TOKEN#{tokenHash}
  SK: METADATA
  userId, name, createdAt, lastUsedAt, expiresAt
  
  GSI1PK: USER#{userId}
  GSI1SK: TOKEN#{tokenId}
```

**UI Changes:**
- Settings: API tokens section (Pro+ only)
- Token creation modal with one-time display
- Token list with revoke action

**Security:**
- Hash tokens before storage (SHA-256)
- Only show token value once on creation
- Rate limit token creation

**Estimate:** 3-4 days

---

### 4. Custom Domains Management
**Complexity:** Large

**Required AWS Services:**
- ACM (Certificate Manager) - us-east-1
- Route53 (if managing DNS)
- CloudFront (new distributions per domain)
- Lambda@Edge (for custom domain routing)

**Endpoints to Add:**
- `POST /domains` - Request custom domain setup
- `GET /domains` - List user's domains
- `GET /domains/{id}` - Domain status/verification
- `DELETE /domains/{id}` - Remove domain

**Database Schema:**
```
custom_domains:
  PK: USER#{userId}
  SK: DOMAIN#{domainId}
  domain, status (pending/verified/active/failed), 
  acmCertArn, cloudfrontDistId, createdAt
```

**UI Changes:**
- New "Domains" section in dashboard
- Domain verification wizard (CNAME records)
- Domain status indicators
- Link creation: domain selector

**Estimate:** 5-7 days

---

### 5. Team Management (Business+)
**Complexity:** Large

**Required AWS Services:**
- DynamoDB (teams, team_members tables)
- Cognito (user groups optional)
- SES (team invites)

**Endpoints to Add:**
- `POST /teams` - Create team
- `GET /teams` - List user's teams
- `POST /teams/{id}/members` - Invite member
- `DELETE /teams/{id}/members/{userId}` - Remove member
- `PUT /teams/{id}/members/{userId}/role` - Change role

**Database Schema:**
```
teams:
  PK: TEAM#{teamId}
  SK: METADATA
  name, ownerId, createdAt, plan
  
team_members:
  PK: TEAM#{teamId}
  SK: MEMBER#{userId}
  role (owner/admin/member), joinedAt
  
  GSI1PK: USER#{userId}
  GSI1SK: TEAM#{teamId}
```

**UI Changes:**
- Team management page
- Member invite flow
- Role assignment
- Team-scoped links view

**Estimate:** 5-7 days

---

## Phase 3: Enterprise Features (Later)

### 1. Webhooks
**Complexity:** Medium

Send HTTP callbacks on events (link clicked, link created, etc.).

**Endpoints:**
- `POST /webhooks` - Create webhook
- `GET /webhooks` - List webhooks
- `DELETE /webhooks/{id}` - Remove webhook
- `POST /webhooks/{id}/test` - Send test event

**Estimate:** 3-4 days

---

### 2. Data Exports
**Complexity:** Small

Export links and analytics as CSV/JSON.

**Endpoints:**
- `POST /exports` - Request export
- `GET /exports/{id}` - Download export

**Estimate:** 1-2 days

---

### 3. SSO/SAML (Enterprise)
**Complexity:** Large

**Required AWS Services:**
- Cognito (SAML identity provider configuration)

**Estimate:** 5-7 days

---

### 4. SLA Credits (Enterprise)
**Complexity:** Small

Automated credit calculation based on uptime.

**Estimate:** 2-3 days

---

### 5. Dedicated Infrastructure
**Complexity:** Large

Isolated DynamoDB tables, dedicated CloudFront distributions.

**Estimate:** 1-2 weeks

---

## Summary

| Phase | Feature | Complexity | Estimate |
|-------|---------|------------|----------|
| 1 | Core MVP | - | ✅ Done |
| 1 | Stripe Billing | M | 3-4 days |
| 2 | Email Notifications | M | 2-3 days |
| 2 | MFA | M | 2-3 days |
| 2 | API Tokens | M | 3-4 days |
| 2 | Custom Domains | L | 5-7 days |
| 2 | Team Management | L | 5-7 days |
| 3 | Webhooks | M | 3-4 days |
| 3 | Exports | S | 1-2 days |
| 3 | SSO/SAML | L | 5-7 days |
| 3 | SLA Credits | S | 2-3 days |

---

## Implementation Notes

### Backend Patterns
- All new endpoints follow existing Lambda structure
- Use single-table design in DynamoDB where possible
- Validate plan entitlements at API layer, not just UI

### Security Checklist
- [ ] API tokens are hashed, never logged
- [ ] Team permissions checked on every request
- [ ] Custom domains verified before activation
- [ ] Webhook secrets signed with HMAC
- [ ] SSO sessions have appropriate timeouts

### Testing Requirements
- Integration tests for each new endpoint
- Load testing for high-traffic features (redirects, analytics)
- Security review for authentication changes
