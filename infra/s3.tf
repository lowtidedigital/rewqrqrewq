# LinkHarbour S3 Buckets
# - SPA hosting bucket (private, served via CloudFront)
# - QR code assets bucket (private, accessed via presigned URLs)

# =============================================================================
# SPA HOSTING BUCKET
# =============================================================================

resource "aws_s3_bucket" "spa" {
  bucket = "${var.project_name}-spa-${random_id.suffix.hex}"
  
  tags = {
    Name = "${var.project_name}-spa-bucket"
  }
}

resource "aws_s3_bucket_versioning" "spa" {
  bucket = aws_s3_bucket.spa.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "spa" {
  bucket = aws_s3_bucket.spa.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "spa" {
  bucket = aws_s3_bucket.spa.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control for SPA bucket
resource "aws_cloudfront_origin_access_control" "spa" {
  name                              = "${var.project_name}-spa-oac"
  description                       = "OAC for LinkHarbour SPA bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "spa" {
  bucket = aws_s3_bucket.spa.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.spa.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.spa.arn
          }
        }
      }
    ]
  })
}

# =============================================================================
# QR CODE ASSETS BUCKET
# =============================================================================

resource "aws_s3_bucket" "qr_assets" {
  bucket = "${var.project_name}-qr-${random_id.suffix.hex}"
  
  tags = {
    Name = "${var.project_name}-qr-assets-bucket"
  }
}

resource "aws_s3_bucket_versioning" "qr_assets" {
  bucket = aws_s3_bucket.qr_assets.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "qr_assets" {
  bucket = aws_s3_bucket.qr_assets.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "qr_assets" {
  bucket = aws_s3_bucket.qr_assets.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rule to clean up old QR code versions
resource "aws_s3_bucket_lifecycle_configuration" "qr_assets" {
  bucket = aws_s3_bucket.qr_assets.id
  
  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"
    
    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# CORS configuration for presigned URL downloads
resource "aws_s3_bucket_cors_configuration" "qr_assets" {
  bucket = aws_s3_bucket.qr_assets.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = [
      "https://${local.app_domain}",
      "http://localhost:5173"
    ]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3600
  }
}
