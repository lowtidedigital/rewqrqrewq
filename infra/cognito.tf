# LinkHarbour Cognito User Pool and App Client
# Handles user authentication with email/password

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users-${var.environment}"

  # Username configuration
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # User verification
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "LinkHarbour - Verify your email"
    email_message        = "Your verification code is {####}"
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email configuration (use Cognito default for MVP, upgrade to SES for production)
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Schema attributes
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                     = "name"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # MFA configuration (optional for MVP)
  mfa_configuration = "OFF"

  # Advanced security (optional, increases cost)
  # user_pool_add_ons {
  #   advanced_security_mode = "ENFORCED"
  # }

  deletion_protection = var.enable_deletion_protection ? "ACTIVE" : "INACTIVE"

  tags = {
    Name = "${var.project_name}-user-pool"
  }
}

# App client for the web application
resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Token validity
  access_token_validity  = 1  # hours
  id_token_validity      = 1  # hours
  refresh_token_validity = 30 # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # OAuth configuration
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO"]

  # Callback URLs - will be updated with actual domain
  callback_urls = length(var.cognito_callback_urls) > 0 ? var.cognito_callback_urls : [
    "https://${local.app_domain}/",
    "https://${local.app_domain}/auth/callback",
    "http://localhost:5173/",
    "http://localhost:5173/auth/callback"
  ]

  logout_urls = length(var.cognito_logout_urls) > 0 ? var.cognito_logout_urls : [
    "https://${local.app_domain}/",
    "http://localhost:5173/"
  ]

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  # Security
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true

  # No client secret for SPA (public client)
  generate_secret = false

  # Read/write attributes
  read_attributes  = ["email", "name", "email_verified"]
  write_attributes = ["email", "name"]
}

# Cognito domain for hosted UI (optional)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${random_id.suffix.hex}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Custom domain for Cognito (optional, requires ACM certificate)
# resource "aws_cognito_user_pool_domain" "custom" {
#   domain          = "auth.${var.domain_name}"
#   certificate_arn = aws_acm_certificate.auth.arn
#   user_pool_id    = aws_cognito_user_pool.main.id
# }
