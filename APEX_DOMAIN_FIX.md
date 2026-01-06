# Apex Domain Fix: linkharbour.io → app.linkharbour.io

## Problem
Visiting `https://linkharbour.io` shows an S3 XML AccessDenied error because the apex domain is incorrectly pointing to an S3 bucket endpoint.

## Solution
Configure DNS so the apex domain (`linkharbour.io`) and `www.linkharbour.io` redirect to `app.linkharbour.io`.

### Option 1: CloudFront Redirect Distribution (Recommended)

1. **Create a new CloudFront distribution** for redirects:
   - Origin: Use a simple S3 bucket with static website hosting enabled
   - Create an S3 bucket (e.g., `linkharbour-redirect`) with:
     ```json
     {
       "RedirectAllRequestsTo": {
         "HostName": "app.linkharbour.io",
         "Protocol": "https"
       }
     }
     ```
   - Or use CloudFront Functions to redirect:
     ```javascript
     function handler(event) {
       return {
         statusCode: 301,
         statusDescription: 'Moved Permanently',
         headers: {
           'location': { value: 'https://app.linkharbour.io' + event.request.uri }
         }
       };
     }
     ```

2. **Request ACM Certificate** (in us-east-1):
   - Add SANs: `linkharbour.io`, `www.linkharbour.io`

3. **Configure Route53**:
   ```terraform
   resource "aws_route53_record" "apex" {
     zone_id = aws_route53_zone.main.zone_id
     name    = "linkharbour.io"
     type    = "A"
     alias {
       name                   = aws_cloudfront_distribution.redirect.domain_name
       zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
       evaluate_target_health = false
     }
   }

   resource "aws_route53_record" "www" {
     zone_id = aws_route53_zone.main.zone_id
     name    = "www.linkharbour.io"
     type    = "A"
     alias {
       name                   = aws_cloudfront_distribution.redirect.domain_name
       zone_id                = aws_cloudfront_distribution.redirect.hosted_zone_id
       evaluate_target_health = false
     }
   }
   ```

### Option 2: Use Existing CloudFront + Lambda@Edge

If you want to use the existing CloudFront distribution:

1. Add `linkharbour.io` and `www.linkharbour.io` as alternate domain names (CNAMEs)
2. Update ACM certificate to include these domains
3. Add Lambda@Edge viewer-request function:
   ```javascript
   exports.handler = async (event) => {
     const request = event.Records[0].cf.request;
     const host = request.headers.host[0].value;
     
     // Redirect apex and www to app subdomain
     if (host === 'linkharbour.io' || host === 'www.linkharbour.io') {
       return {
         status: '301',
         statusDescription: 'Moved Permanently',
         headers: {
           location: [{ key: 'Location', value: `https://app.linkharbour.io${request.uri}` }]
         }
       };
     }
     
     return request;
   };
   ```

### Terraform Changes Required

Add to `infra/cloudfront.tf`:

```terraform
# Certificate for apex domain
resource "aws_acm_certificate" "apex" {
  provider          = aws.us_east_1
  domain_name       = "linkharbour.io"
  subject_alternative_names = ["www.linkharbour.io"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Redirect bucket
resource "aws_s3_bucket" "redirect" {
  bucket = "linkharbour-apex-redirect"
}

resource "aws_s3_bucket_website_configuration" "redirect" {
  bucket = aws_s3_bucket.redirect.id

  redirect_all_requests_to {
    host_name = "app.linkharbour.io"
    protocol  = "https"
  }
}

# CloudFront for redirects
resource "aws_cloudfront_distribution" "redirect" {
  enabled = true
  aliases = ["linkharbour.io", "www.linkharbour.io"]

  origin {
    domain_name = aws_s3_bucket_website_configuration.redirect.website_endpoint
    origin_id   = "S3-redirect"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "S3-redirect"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.apex.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
```

## Verification

After applying changes:

```bash
# Test apex domain redirect
curl -I https://linkharbour.io
# Expected: 301 → https://app.linkharbour.io

# Test www redirect  
curl -I https://www.linkharbour.io
# Expected: 301 → https://app.linkharbour.io
```

## Important Notes

- ACM certificate MUST be in `us-east-1` for CloudFront
- Keep S3 bucket private behind CloudFront (use OAC, not public access)
- DNS propagation can take up to 48 hours
- The existing `app.linkharbour.io` and `lh.linkharbour.io` configurations remain unchanged
