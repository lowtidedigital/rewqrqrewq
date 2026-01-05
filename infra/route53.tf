# LinkHarbour Route53 DNS Records

# =============================================================================
# DNS RECORDS
# =============================================================================

# App domain -> SPA CloudFront
resource "aws_route53_record" "app" {
  zone_id = var.hosted_zone_id
  name    = local.app_domain
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.spa.domain_name
    zone_id                = aws_cloudfront_distribution.spa.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "app_aaaa" {
  zone_id = var.hosted_zone_id
  name    = local.app_domain
  type    = "AAAA"
  
  alias {
    name                   = aws_cloudfront_distribution.spa.domain_name
    zone_id                = aws_cloudfront_distribution.spa.hosted_zone_id
    evaluate_target_health = false
  }
}

# Short domain -> Redirect CloudFront
resource "aws_route53_record" "short" {
  zone_id = var.hosted_zone_id
  name    = local.short_domain
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.short.domain_name
    zone_id                = aws_cloudfront_distribution.short.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "short_aaaa" {
  zone_id = var.hosted_zone_id
  name    = local.short_domain
  type    = "AAAA"
  
  alias {
    name                   = aws_cloudfront_distribution.short.domain_name
    zone_id                = aws_cloudfront_distribution.short.hosted_zone_id
    evaluate_target_health = false
  }
}
