# LinkHarbour CloudFront Distributions
# - SPA distribution for app.example.com
# - Redirect distribution for s.example.com (caching redirects)

# =============================================================================
# ACM CERTIFICATES (must be in us-east-1 for CloudFront)
# =============================================================================

resource "aws_acm_certificate" "spa" {
  provider = aws.us_east_1
  
  domain_name       = local.app_domain
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "${var.project_name}-spa-cert"
  }
}

resource "aws_acm_certificate" "short" {
  provider = aws.us_east_1
  
  domain_name       = local.short_domain
  validation_method = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "${var.project_name}-short-cert"
  }
}

# Certificate validation DNS records
resource "aws_route53_record" "spa_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.spa.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.hosted_zone_id
}

resource "aws_route53_record" "short_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.short.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.hosted_zone_id
}

resource "aws_acm_certificate_validation" "spa" {
  provider = aws.us_east_1
  
  certificate_arn         = aws_acm_certificate.spa.arn
  validation_record_fqdns = [for record in aws_route53_record.spa_cert_validation : record.fqdn]
}

resource "aws_acm_certificate_validation" "short" {
  provider = aws.us_east_1
  
  certificate_arn         = aws_acm_certificate.short.arn
  validation_record_fqdns = [for record in aws_route53_record.short_cert_validation : record.fqdn]
}

# =============================================================================
# SPA CLOUDFRONT DISTRIBUTION
# =============================================================================

resource "aws_cloudfront_distribution" "spa" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [local.app_domain]
  price_class         = "PriceClass_100" # US, Canada, Europe
  
  origin {
    domain_name              = aws_s3_bucket.spa.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.spa.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.spa.id
  }
  
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.spa.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    cache_policy_id          = aws_cloudfront_cache_policy.spa.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.spa.id
    
    # For SPA routing - serve index.html for all paths
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_router.arn
    }
  }
  
  # Cache static assets longer
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.spa.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    cache_policy_id = aws_cloudfront_cache_policy.static_assets.id
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.spa.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  tags = {
    Name = "${var.project_name}-spa-distribution"
  }
}

# CloudFront function for SPA routing
resource "aws_cloudfront_function" "spa_router" {
  name    = "${var.project_name}-spa-router"
  runtime = "cloudfront-js-2.0"
  code    = <<-EOF
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      
      // If URI has a file extension, serve the file
      if (uri.includes('.')) {
        return request;
      }
      
      // Otherwise, serve index.html for SPA routing
      request.uri = '/index.html';
      return request;
    }
  EOF
}

# Cache policies
resource "aws_cloudfront_cache_policy" "spa" {
  name        = "${var.project_name}-spa-cache"
  min_ttl     = 0
  default_ttl = 86400      # 1 day
  max_ttl     = 31536000   # 1 year
  
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.project_name}-static-assets-cache"
  min_ttl     = 86400      # 1 day
  default_ttl = 604800     # 7 days
  max_ttl     = 31536000   # 1 year
  
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_origin_request_policy" "spa" {
  name = "${var.project_name}-spa-origin-request"
  
  cookies_config {
    cookie_behavior = "none"
  }
  headers_config {
    header_behavior = "none"
  }
  query_strings_config {
    query_string_behavior = "none"
  }
}

# =============================================================================
# SHORT LINK CLOUDFRONT DISTRIBUTION
# =============================================================================

resource "aws_cloudfront_distribution" "short" {
  enabled         = true
  is_ipv6_enabled = true
  aliases         = [local.short_domain]
  price_class     = "PriceClass_100"
  
  origin {
    domain_name = replace(aws_apigatewayv2_api.main.api_endpoint, "https://", "")
    origin_id   = "APIGateway"
    origin_path = ""
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "APIGateway"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    # Use managed cache policy for API Gateway
    cache_policy_id          = aws_cloudfront_cache_policy.redirect.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.redirect.id
    
    # Rewrite path to add /r/ prefix
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect_router.arn
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.short.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = {
    Name = "${var.project_name}-short-distribution"
  }
}

# CloudFront function to add /r/ prefix for API Gateway
resource "aws_cloudfront_function" "redirect_router" {
  name    = "${var.project_name}-redirect-router"
  runtime = "cloudfront-js-2.0"
  code    = <<-EOF
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      
      // Add /r/ prefix for API Gateway routing
      if (!uri.startsWith('/r/')) {
        request.uri = '/r' + uri;
      }
      
      return request;
    }
  EOF
}

# Cache policy for redirects - cache successful redirects briefly
resource "aws_cloudfront_cache_policy" "redirect" {
  name        = "${var.project_name}-redirect-cache"
  min_ttl     = 0
  default_ttl = 60     # 1 minute - allows for quick link updates
  max_ttl     = 300    # 5 minutes max
  
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_origin_request_policy" "redirect" {
  name = "${var.project_name}-redirect-origin-request"
  
  cookies_config {
    cookie_behavior = "none"
  }
  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["User-Agent", "Referer"]
    }
  }
  query_strings_config {
    query_string_behavior = "none"
  }
}
