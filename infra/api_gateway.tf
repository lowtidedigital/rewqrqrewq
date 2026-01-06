# LinkHarbour API Gateway
# HTTP API with Cognito JWT authorizer

# =============================================================================
# HTTP API
# =============================================================================

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://${local.app_domain}",
      "http://localhost:5173",
      "http://localhost:3000"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"]
    allow_headers = ["Authorization", "Content-Type", "X-Amz-Date", "X-Api-Key"]
    max_age       = 300
  }

  tags = {
    Name = "${var.project_name}-http-api"
  }
}

# =============================================================================
# COGNITO JWT AUTHORIZER
# =============================================================================

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  name             = "cognito-authorizer"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

# =============================================================================
# LAMBDA INTEGRATIONS
# =============================================================================

resource "aws_apigatewayv2_integration" "redirect" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.redirect.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "links" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.links_api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "analytics" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.analytics_api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# NEW: Billing API Integration (checkout + portal) - AUTHENTICATED
resource "aws_apigatewayv2_integration" "billing" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.billing_api.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# NEW: Stripe Webhook Integration - PUBLIC
resource "aws_apigatewayv2_integration" "stripe_webhook" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.stripe_webhook.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# =============================================================================
# ROUTES
# =============================================================================

# Public redirect route (no auth)
resource "aws_apigatewayv2_route" "redirect" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /r/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.redirect.id}"
}

# Optional: support HEAD requests (useful for curl -I / link previews)
resource "aws_apigatewayv2_route" "redirect_head" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "HEAD /r/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.redirect.id}"
}

# Links CRUD routes (authenticated)
resource "aws_apigatewayv2_route" "links_create" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /links"
  target             = "integrations/${aws_apigatewayv2_integration.links.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "links_list" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /links"
  target             = "integrations/${aws_apigatewayv2_integration.links.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "links_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /links/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.links.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "links_update" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /links/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.links.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "links_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /links/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.links.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Analytics routes (authenticated)
resource "aws_apigatewayv2_route" "link_analytics" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /links/{id}/analytics"
  target             = "integrations/${aws_apigatewayv2_integration.analytics.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "dashboard_analytics" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /analytics"
  target             = "integrations/${aws_apigatewayv2_integration.analytics.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# =============================================================================
# BILLING ROUTES
# =============================================================================

resource "aws_apigatewayv2_route" "billing_checkout" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /billing/checkout"
  target             = "integrations/${aws_apigatewayv2_integration.billing.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "billing_portal" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /billing/portal"
  target             = "integrations/${aws_apigatewayv2_integration.billing.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Stripe calls this, no auth
resource "aws_apigatewayv2_route" "billing_webhook" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /billing/webhook"
  target    = "integrations/${aws_apigatewayv2_integration.stripe_webhook.id}"
}

# =============================================================================
# STAGE + LOGGING
# =============================================================================

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      protocol         = "$context.protocol"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }
}

# =============================================================================
# LAMBDA PERMISSIONS
# =============================================================================

resource "aws_lambda_permission" "redirect" {
  statement_id  = "AllowAPIGatewayRedirect"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.redirect.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "links_api" {
  statement_id  = "AllowAPIGatewayLinks"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.links_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "analytics_api" {
  statement_id  = "AllowAPIGatewayAnalytics"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analytics_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "billing_api" {
  statement_id  = "AllowAPIGatewayBilling"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.billing_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "stripe_webhook" {
  statement_id  = "AllowAPIGatewayStripeWebhook"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stripe_webhook.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
