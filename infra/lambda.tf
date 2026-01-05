# LinkHarbour Lambda Functions
# All Lambda functions with IAM roles and permissions

# =============================================================================
# LAMBDA EXECUTION ROLE
# =============================================================================

resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Logs policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb"
  role = aws_iam_role.lambda_exec.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.links.arn,
          "${aws_dynamodb_table.links.arn}/index/*",
          aws_dynamodb_table.analytics.arn,
          "${aws_dynamodb_table.analytics.arn}/index/*",
          aws_dynamodb_table.aggregates.arn,
          "${aws_dynamodb_table.aggregates.arn}/index/*"
        ]
      }
    ]
  })
}

# S3 access policy for QR assets
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.project_name}-lambda-s3"
  role = aws_iam_role.lambda_exec.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.qr_assets.arn}/*"
      }
    ]
  })
}

# =============================================================================
# LAMBDA FUNCTIONS
# =============================================================================

# Lambda layer for shared dependencies (optional, for larger projects)
# resource "aws_lambda_layer_version" "deps" {
#   filename            = "${path.module}/../backend/dist/layer.zip"
#   layer_name          = "${var.project_name}-deps"
#   compatible_runtimes = ["nodejs20.x"]
# }

# Redirect Handler - Public, must be FAST
resource "aws_lambda_function" "redirect" {
  function_name = "${var.project_name}-redirect-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "redirect.handler"
  runtime       = "nodejs20.x"
  
  filename         = "${path.module}/../backend/dist/redirect.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/dist/redirect.zip")
  
  memory_size = 128  # Keep low for fast cold starts
  timeout     = var.redirect_lambda_timeout
  
  environment {
    variables = {
      LINKS_TABLE = aws_dynamodb_table.links.name
      ANALYTICS_TABLE = aws_dynamodb_table.analytics.name
      ENVIRONMENT = var.environment
    }
  }
  
  tags = {
    Name = "${var.project_name}-redirect-lambda"
  }
}

# Links API Handler - Authenticated CRUD operations
resource "aws_lambda_function" "links_api" {
  function_name = "${var.project_name}-links-api-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "links.handler"
  runtime       = "nodejs20.x"
  
  filename         = "${path.module}/../backend/dist/links.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/dist/links.zip")
  
  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout
  
  environment {
    variables = {
      LINKS_TABLE      = aws_dynamodb_table.links.name
      ANALYTICS_TABLE  = aws_dynamodb_table.analytics.name
      AGGREGATES_TABLE = aws_dynamodb_table.aggregates.name
      QR_BUCKET        = aws_s3_bucket.qr_assets.id
      SHORT_DOMAIN     = local.short_domain
      ENVIRONMENT      = var.environment
    }
  }
  
  tags = {
    Name = "${var.project_name}-links-api-lambda"
  }
}

# Analytics Handler - Authenticated analytics queries
resource "aws_lambda_function" "analytics_api" {
  function_name = "${var.project_name}-analytics-api-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "analytics.handler"
  runtime       = "nodejs20.x"
  
  filename         = "${path.module}/../backend/dist/analytics.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/dist/analytics.zip")
  
  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout
  
  environment {
    variables = {
      LINKS_TABLE      = aws_dynamodb_table.links.name
      ANALYTICS_TABLE  = aws_dynamodb_table.analytics.name
      AGGREGATES_TABLE = aws_dynamodb_table.aggregates.name
      ENVIRONMENT      = var.environment
    }
  }
  
  tags = {
    Name = "${var.project_name}-analytics-api-lambda"
  }
}

# =============================================================================
# CLOUDWATCH LOG GROUPS
# =============================================================================

resource "aws_cloudwatch_log_group" "redirect" {
  name              = "/aws/lambda/${aws_lambda_function.redirect.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "links_api" {
  name              = "/aws/lambda/${aws_lambda_function.links_api.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "analytics_api" {
  name              = "/aws/lambda/${aws_lambda_function.analytics_api.function_name}"
  retention_in_days = 14
}
