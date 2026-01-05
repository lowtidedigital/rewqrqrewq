# LinkHarbour Terraform Outputs
# These values are needed for frontend configuration and deployment

output "app_url" {
  description = "URL for the web application"
  value       = "https://${local.app_domain}"
}

output "short_url" {
  description = "Base URL for short links"
  value       = "https://${local.short_domain}"
}

output "api_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = aws_cognito_user_pool_client.web.id
}

output "cognito_domain" {
  description = "Cognito hosted UI domain"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "spa_bucket_name" {
  description = "S3 bucket name for SPA deployment"
  value       = aws_s3_bucket.spa.id
}

output "qr_bucket_name" {
  description = "S3 bucket name for QR assets"
  value       = aws_s3_bucket.qr_assets.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for SPA (for cache invalidation)"
  value       = aws_cloudfront_distribution.spa.id
}

output "dynamodb_links_table" {
  description = "DynamoDB Links table name"
  value       = aws_dynamodb_table.links.name
}

output "dynamodb_analytics_table" {
  description = "DynamoDB Analytics table name"
  value       = aws_dynamodb_table.analytics.name
}

output "dynamodb_aggregates_table" {
  description = "DynamoDB Aggregates table name"
  value       = aws_dynamodb_table.aggregates.name
}

# Output as JSON for easy consumption by scripts
output "frontend_config" {
  description = "Frontend configuration as JSON"
  value = jsonencode({
    VITE_API_URL           = aws_apigatewayv2_api.main.api_endpoint
    VITE_COGNITO_REGION    = var.aws_region
    VITE_COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
    VITE_COGNITO_CLIENT_ID = aws_cognito_user_pool_client.web.id
    VITE_SHORT_DOMAIN      = local.short_domain
  })
  sensitive = false
}
