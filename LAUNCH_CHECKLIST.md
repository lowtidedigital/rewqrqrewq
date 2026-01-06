# Link Harbour Production Launch Checklist

## Pre-Launch: Backend & Infrastructure

### 1. Build Backend Packages
```bash
cd backend
npm run build
npm run package
# Outputs:
#   dist/redirect.zip
#   dist/links.zip
#   dist/analytics.zip
#   dist/billing_api.zip
#   dist/stripe_webhook.zip
```

### 2. Terraform Apply
```bash
cd infra

# Ensure terraform.tfvars has:
# - stripe_secret_key (live key)
# - stripe_webhook_secret (live webhook secret)
# - stripe_pro_price_id = "price_1SmQWQRd9hGS6kHhuXA5XkpL"
# - app_url = "https://app.linkharbour.io"

terraform init
terraform plan
terraform apply
```

### 3. Verify API Gateway Routes
```bash
# List all routes
aws apigatewayv2 get-routes --api-id <API_ID> --query 'Items[*].[RouteKey]'

# Expected routes:
# POST /billing/checkout
# POST /billing/portal
# POST /billing/webhook
# GET /billing/status
# (plus existing links, analytics routes)
```

### 4. Verify Lambda Environment Variables
```bash
# Check billing_api Lambda
aws lambda get-function-configuration --function-name shortfuse-billing-api-prod \
  --query 'Environment.Variables'

# Should include:
# STRIPE_SECRET_KEY
# STRIPE_PRICE_ID_STARTER
# APP_URL
```

---

## Pre-Launch: Stripe Setup

### 5. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://iq0f9fazt9.execute-api.us-east-1.amazonaws.com/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `terraform.tfvars`

### 6. Test Webhook
```bash
# Send test event from Stripe Dashboard
# OR use Stripe CLI:
stripe trigger checkout.session.completed

# Check CloudWatch logs for billing_webhook Lambda
aws logs tail /aws/lambda/shortfuse-stripe-webhook-prod --follow
```

### 7. Test Checkout Flow (Stripe Test Mode First)
1. Sign in to app
2. Go to /dashboard/billing
3. Click "Upgrade to Starter"
4. Complete Stripe checkout with test card (4242 4242 4242 4242)
5. Verify webhook fires and user plan updates

---

## Pre-Launch: Frontend

### 8. Build Frontend
```bash
npm run build
# Output: dist/
```

### 9. Deploy to S3 + CloudFront
```bash
# Sync to S3
aws s3 sync dist/ s3://app.linkharbour.io --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

### 10. Verify Environment Config
Check `src/config.ts` defaults match production:
- `apiUrl`: `https://iq0f9fazt9.execute-api.us-east-1.amazonaws.com`
- `shortDomain`: `lh.linkharbour.io`
- `appDomain`: `app.linkharbour.io`

---

## Post-Deploy Verification

### 11. End-to-End Tests
- [ ] Sign up new user
- [ ] Create a link
- [ ] Click link → verify redirect
- [ ] View analytics
- [ ] Upgrade to Starter (use test card first, then live)
- [ ] Verify plan shows "Starter" in dashboard
- [ ] Open billing portal → verify subscription visible
- [ ] Cancel subscription → verify downgrade to Free

### 12. Verify Plan Gating
- [ ] Free user: API Access shows "Starter+ Required"
- [ ] Starter user: API Access shows "Enabled"
- [ ] Free user: Cannot exceed 50 links
- [ ] Starter user: Can create up to 500 links

### 13. Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Verify sidebar/navigation works
- [ ] Verify billing page is usable

---

## Security Checklist

### 14. Secrets Verification
```bash
# Verify no secrets in git
git log --all --full-history -- "**/terraform.tfvars"
git log --all --full-history -- "**/.env*"

# Should return empty or only .example files
```

### 15. .gitignore Verification
Ensure these are ignored:
- `infra/terraform.tfvars`
- `infra/terraform.tfstate*`
- `infra/.terraform/`
- `.env*` (except `.env.example`)

---

## Monitoring Setup

### 16. CloudWatch Alarms (Optional but Recommended)
```bash
# Lambda errors alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "BillingApiErrors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=shortfuse-billing-api-prod \
  --evaluation-periods 1
```

---

## Go Live

### 17. Switch Stripe to Live Mode
1. Update `terraform.tfvars` with live Stripe keys
2. Run `terraform apply`
3. Update Stripe webhook to use live endpoint
4. Test with real card (small amount, refund immediately)

### 18. Announce Launch 🚀
- [ ] Update landing page
- [ ] Send announcement emails
- [ ] Post on social media

---

## Rollback Plan

If issues occur:
1. **Frontend rollback**: Restore previous S3 version
   ```bash
   aws s3 sync s3://app.linkharbour.io-backup s3://app.linkharbour.io
   ```

2. **Lambda rollback**: Use Lambda version aliases or re-deploy previous zip
   ```bash
   aws lambda update-function-code --function-name shortfuse-billing-api-prod \
     --s3-bucket <BUCKET> --s3-key previous-billing_api.zip
   ```

3. **Terraform rollback**: Restore from `terraform.tfstate.backup`
