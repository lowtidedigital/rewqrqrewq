# Analytics QA Checklist

This document provides step-by-step verification that analytics are working end-to-end in production.

## Prerequisites

```bash
# Set your variables
export API_URL="https://iq0f9fazt9.execute-api.us-east-1.amazonaws.com"
export SHORT_DOMAIN="lh.linkharbour.io"
export JWT="<your-cognito-access-token>"

# To get a JWT, sign in to the app and extract from browser DevTools:
# Network tab → any authenticated request → Authorization header
```

---

## 1. Create a Test Link

If you don't have a link yet, create one:

```bash
curl -X POST "$API_URL/links" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://example.com/analytics-test",
    "title": "Analytics Test Link"
  }'
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "slug": "abc123",
  "longUrl": "https://example.com/analytics-test",
  ...
}
```

Save the `id` and `slug`:
```bash
export LINK_ID="<id-from-response>"
export SLUG="<slug-from-response>"
```

---

## 2. Confirm Redirect is Working

```bash
# HEAD request (doesn't follow redirect)
curl -I "https://$SHORT_DOMAIN/r/$SLUG"
```

**Expected Response:**
```
HTTP/2 302
location: https://example.com/analytics-test
cache-control: no-cache, no-store, must-revalidate
```

- Status should be `301` or `302`
- `location` header should contain your destination URL
- If you get `404`: slug doesn't exist
- If you get `410`: link is disabled or expired

---

## 3. Generate Test Clicks

Hit the redirect endpoint multiple times to generate analytics:

```bash
# Generate 5 test clicks
for i in {1..5}; do
  curl -I "https://$SHORT_DOMAIN/r/$SLUG" \
    -H "Referer: https://google.com" \
    -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
  sleep 1
done
```

**Note:** Each request should return a 301/302 redirect.

---

## 4. Verify Link Analytics (Wait 5-10 seconds)

```bash
curl -s "$API_URL/links/$LINK_ID/analytics" \
  -H "Authorization: Bearer $JWT" | jq .
```

**Expected Response:**
```json
{
  "linkId": "uuid-here",
  "totalClicks": 5,
  "last7Days": [
    { "date": "2026-01-01", "clicks": 0 },
    { "date": "2026-01-02", "clicks": 0 },
    ...
    { "date": "2026-01-06", "clicks": 5 }
  ],
  "referrers": [
    { "referrer": "google.com", "clicks": 5 }
  ],
  "devices": [
    { "device": "mobile", "clicks": 5 }
  ],
  "countries": [
    { "country": "unknown", "clicks": 5 }
  ],
  "summary": { ... },
  "recentEvents": [ ... ]
}
```

**What to check:**
- `totalClicks` should match number of requests
- `last7Days` should show today's clicks
- `referrers` should show "google.com" (from our Referer header)
- `devices` should show "mobile" (from our User-Agent)

---

## 5. Verify Dashboard Analytics

```bash
curl -s "$API_URL/analytics" \
  -H "Authorization: Bearer $JWT" | jq .
```

**Alternative endpoint (same result):**
```bash
curl -s "$API_URL/analytics/dashboard" \
  -H "Authorization: Bearer $JWT" | jq .
```

**Expected Response:**
```json
{
  "totalLinks": 1,
  "activeLinks": 1,
  "totalClicks": 5,
  "clicksToday": 5,
  "clicksThisWeek": 5,
  "topLinks": [
    {
      "id": "uuid-here",
      "slug": "abc123",
      "title": "Analytics Test Link",
      "clicks": 5
    }
  ],
  "topReferrers": [...],
  "topCountries": [...],
  "deviceBreakdown": [...],
  "clicksOverTime": [...]
}
```

---

## 6. Verify CloudWatch Logs

### Redirect Lambda Logs

```bash
aws logs tail /aws/lambda/shortfuse-redirect-prod --follow
```

**Look for:**
```json
{"level":"INFO","message":"Redirect request","slug":"abc123",...}
{"level":"INFO","message":"Click event recorded successfully","eventId":"...","linkId":"..."}
{"level":"INFO","message":"Redirect successful","slug":"abc123","statusCode":302}
```

### Analytics Lambda Logs

```bash
aws logs tail /aws/lambda/shortfuse-analytics-prod --follow
```

**Look for:**
```json
{"level":"INFO","message":"Analytics API request","path":"/links/.../analytics","userId":"..."}
{"level":"INFO","message":"Link analytics response","totalClicks":5,"clicksToday":5}
```

### Enable Debug Logging (Optional)

To get more detailed logs, update the Lambda environment variable:

```bash
aws lambda update-function-configuration \
  --function-name shortfuse-redirect-prod \
  --environment "Variables={LINKS_TABLE=shortfuse-links-prod,ANALYTICS_TABLE=shortfuse-analytics-prod,AGGREGATES_TABLE=shortfuse-aggregates-prod,LOG_LEVEL=debug}"
```

---

## 7. Verify DynamoDB Data

### Check Analytics Table

```bash
aws dynamodb query \
  --table-name shortfuse-analytics-prod \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk":{"S":"LINK#'"$LINK_ID"'#2026-01"}}' \
  --limit 5
```

**Expected:** Returns click events with `PK`, `SK`, `timestamp`, `device`, etc.

### Check Aggregates Table

```bash
aws dynamodb query \
  --table-name shortfuse-aggregates-prod \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk":{"S":"LINK#'"$LINK_ID"'"}}' 
```

**Expected:**
```json
{
  "Items": [
    { "PK": "LINK#uuid", "SK": "AGG#daily#2026-01-06", "clicks": 5 },
    { "PK": "LINK#uuid", "SK": "AGG#total", "clicks": 5 }
  ]
}
```

### Check Link Click Count

```bash
aws dynamodb get-item \
  --table-name shortfuse-links-prod \
  --key '{"PK":{"S":"USER#'"$USER_ID"'"},"SK":{"S":"LINK#'"$LINK_ID"'"}}' \
  --projection-expression "clickCount"
```

**Expected:** `"clickCount": { "N": "5" }`

---

## 8. Test Empty State

Create a new link and immediately check analytics (before any clicks):

```bash
# Create link
RESPONSE=$(curl -s -X POST "$API_URL/links" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com/empty-test"}')

NEW_LINK_ID=$(echo $RESPONSE | jq -r '.id')

# Check analytics immediately
curl -s "$API_URL/links/$NEW_LINK_ID/analytics" \
  -H "Authorization: Bearer $JWT" | jq .
```

**Expected:**
```json
{
  "linkId": "...",
  "totalClicks": 0,
  "last7Days": [
    { "date": "2026-01-01", "clicks": 0 },
    ...
  ],
  "referrers": [],
  "devices": [],
  "countries": []
}
```

---

## 9. Test Authorization

Try to access another user's link analytics:

```bash
# This should fail with 404 (not found, not 403)
# because you shouldn't even know the link exists
curl -s "$API_URL/links/fake-link-id-12345/analytics" \
  -H "Authorization: Bearer $JWT" | jq .
```

**Expected:**
```json
{
  "error": "NOT_FOUND",
  "message": "Link not found",
  "statusCode": 404
}
```

---

## 10. Test Disabled Link

```bash
# Disable the link
curl -X PUT "$API_URL/links/$LINK_ID" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Try to access redirect
curl -I "https://$SHORT_DOMAIN/r/$SLUG"
```

**Expected:**
```
HTTP/2 410
content-type: text/html; charset=utf-8
```

The body should contain "Link Disabled" and **NO** analytics should be recorded.

---

## Success Criteria Checklist

- [ ] ✅ Clicking a short link returns 301/302 redirect
- [ ] ✅ Analytics data appears within 5-10 seconds
- [ ] ✅ Dashboard summary loads without errors
- [ ] ✅ Link analytics page shows real stats
- [ ] ✅ Empty state shows zeros (not errors)
- [ ] ✅ Disabled links return 410 and don't record analytics
- [ ] ✅ Users can only see their own link analytics
- [ ] ✅ CloudWatch logs show write/read operations

---

## Troubleshooting

### Analytics Always Show Zero

1. Check redirect handler is deployed with latest code
2. Check `ANALYTICS_TABLE` and `AGGREGATES_TABLE` env vars are set
3. Check CloudWatch logs for errors during `writeClickEvent`
4. Verify DynamoDB tables exist with correct key schema

### 403 Unauthorized on Analytics Endpoints

1. Verify JWT is valid and not expired
2. Check Cognito user pool configuration
3. Check API Gateway authorizer is configured correctly

### 500 Internal Server Error

1. Check CloudWatch logs for stack trace
2. Common issues:
   - Missing environment variables
   - DynamoDB table doesn't exist
   - IAM permissions missing

### Redirect Works but No Analytics

1. Enable `LOG_LEVEL=debug` on redirect Lambda
2. Check for "Click event recorded successfully" in logs
3. If missing, check for error logs during `writeClickEvent`
4. Verify Lambda has write permissions to all 3 tables
