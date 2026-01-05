# LinkHarbour - AWS Serverless URL Shortener

**Fast short links. Trusted tracking.**

A production-ready URL shortening SaaS built with React + TypeScript frontend and AWS serverless backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CloudFront                                  │
│  ┌─────────────────────┐              ┌─────────────────────┐           │
│  │   app.example.com   │              │   lh.io             │           │
│  │   (SPA Distribution)│              │ (Redirect Dist)     │           │
│  └──────────┬──────────┘              └──────────┬──────────┘           │
└─────────────┼────────────────────────────────────┼──────────────────────┘
              │                                    │
              ▼                                    ▼
       ┌──────────────┐                    ┌──────────────┐
       │  S3 Bucket   │                    │ API Gateway  │
       │  (SPA Files) │                    │  (HTTP API)  │
       └──────────────┘                    └──────┬───────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────┐
                    │                             │                     │
                    ▼                             ▼                     ▼
             ┌────────────┐              ┌────────────┐          ┌────────────┐
             │  Redirect  │              │ Links API  │          │ Analytics  │
             │  Lambda    │              │  Lambda    │          │  Lambda    │
             └─────┬──────┘              └─────┬──────┘          └─────┬──────┘
                   │                           │                       │
                   └───────────────────────────┴───────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌────────────┐             ┌────────────┐             ┌────────────┐
             │  DynamoDB  │             │  DynamoDB  │             │  DynamoDB  │
             │   Links    │             │ Analytics  │             │ Aggregates │
             └────────────┘             └────────────┘             └────────────┘
                    
                    ┌──────────────┐     ┌──────────────┐
                    │   Cognito    │     │  S3 (QR)     │
                    │  User Pool   │     │   Assets     │
                    └──────────────┘     └──────────────┘
```

## DynamoDB Schema

### Links Table
| PK | SK | Attributes |
|----|----|------------|
| `USER#{userId}` | `LINK#{linkId}` | Link data, QR keys, click count |
| `SLUG#{slug}` | `METADATA` | linkId, userId (for fast redirect lookup) |

**GSI1**: `GSI1PK` (USER#{userId}) + `GSI1SK` (CREATED#{timestamp}) - List by date

### Analytics Table  
| PK | SK | Attributes |
|----|----|------------|
| `LINK#{linkId}#YYYY-MM` | `TS#{timestamp}#{eventId}` | Click event data |

**GSI1**: `GSI1PK` (USER#{userId}#YYYY-MM) - User aggregations

## Local Development

### Frontend
```bash
cd /  # project root
npm install
cp .env.example .env.local  # Fill in values
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run build  # Compiles + packages Lambda zips
```

## Deployment

### Prerequisites
- AWS CLI configured with credentials
- Terraform >= 1.5.0
- Node.js >= 20
- A Route53 hosted zone for your domain

### Steps

1. **Build backend:**
```bash
cd backend && npm install && npm run build
```

2. **Configure Terraform:**
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your domain, hosted_zone_id, etc.
```

3. **Deploy infrastructure:**
```bash
terraform init
terraform plan
terraform apply
```

4. **Get outputs for frontend:**
```bash
terraform output frontend_config
# Copy values to .env.local
```

5. **Build and deploy frontend:**
```bash
cd ..
npm run build
aws s3 sync dist/ s3://$(terraform -chdir=infra output -raw spa_bucket_name)
aws cloudfront create-invalidation --distribution-id $(terraform -chdir=infra output -raw cloudfront_distribution_id) --paths "/*"
```

## Cost Estimates (Monthly)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Lambda | 1M requests | ~$0.20/1M requests |
| DynamoDB | 25GB + 25 WCU/RCU | Pay-per-request: ~$1.25/1M writes |
| CloudFront | 1TB transfer | ~$0.085/GB |
| S3 | 5GB | ~$0.023/GB |
| Cognito | 50K MAU | ~$0.0055/MAU |

**Estimated cost for 10K links, 100K redirects/month: ~$5-15/month**

## Security

- Cognito JWT authentication for all management APIs
- URL validation (HTTP/HTTPS only)
- IP hashing for privacy-preserving analytics
- S3 buckets private with OAC/presigned URLs
- TLS everywhere
- Rate limiting via API Gateway throttling

## Scaling

- DynamoDB on-demand scales automatically
- Lambda concurrent executions (default 1000, increasable)
- CloudFront caches redirects (60s-300s TTL)
- Analytics partitioned by month for efficient queries

---

© 2025 LinkHarbour. Built with ❤️ on AWS.
