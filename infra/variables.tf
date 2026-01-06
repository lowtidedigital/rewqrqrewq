# LinkHarbour Infrastructure Variables
# These must be provided via terraform.tfvars or environment variables

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "shortfuse"
}

variable "domain_name" {
  description = "Root domain name (e.g., example.com)"
  type        = string
}

variable "app_subdomain" {
  description = "Subdomain for the web app (e.g., app)"
  type        = string
  default     = "app"
}

variable "short_subdomain" {
  description = "Subdomain for short links (e.g., s)"
  type        = string
  default     = "s"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for the domain"
  type        = string
}

variable "cognito_callback_urls" {
  description = "Allowed callback URLs for Cognito"
  type        = list(string)
  default     = []
}

variable "cognito_logout_urls" {
  description = "Allowed logout URLs for Cognito"
  type        = list(string)
  default     = []
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for DynamoDB tables"
  type        = bool
  default     = true
}

variable "lambda_memory_size" {
  description = "Memory size for Lambda functions in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Timeout for Lambda functions in seconds"
  type        = number
  default     = 10
}

variable "redirect_lambda_timeout" {
  description = "Timeout for redirect Lambda (should be fast)"
  type        = number
  default     = 3
}

variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "stripe_secret_key" {
  type      = string
  sensitive = true
}

variable "stripe_pro_price_id" {
  description = "Stripe Price ID for the paid plan (Starter/Pro)"
  type        = string
  sensitive   = true
}


variable "stripe_webhook_secret" {
  type      = string
  sensitive = true
}

variable "app_url" {
  type    = string
  default = "https://app.linkharbour.io"
}


locals {
  app_domain   = "${var.app_subdomain}.${var.domain_name}"
  short_domain = "${var.short_subdomain}.${var.domain_name}"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  })
}
