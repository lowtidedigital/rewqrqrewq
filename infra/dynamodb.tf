# LinkHarbour DynamoDB Tables
# Single-table design for links + analytics with GSIs for efficient queries

# =============================================================================
# MAIN TABLE: Links + Slug Mappings
# =============================================================================
# Key Design:
# - PK: USER#{userId} for user-owned items, SLUG#{slug} for slug lookups
# - SK: LINK#{linkId} for links, METADATA for slug->link mapping
#
# Access Patterns:
# 1. Get link by ID: PK=USER#{userId}, SK=LINK#{linkId}
# 2. List links by user: PK=USER#{userId}, SK begins_with LINK#
# 3. Fast slug lookup: PK=SLUG#{slug}, SK=METADATA
# 4. Get links by creation date: GSI1 (userId-createdAt-index)

resource "aws_dynamodb_table" "links" {
  name         = "${var.project_name}-links-${var.environment}"
  billing_mode = var.dynamodb_billing_mode

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  # GSI1: Query links by user sorted by created date
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  # TTL for expired links cleanup
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  deletion_protection_enabled = var.enable_deletion_protection

  tags = {
    Name = "${var.project_name}-links-table"
  }
}

# =============================================================================
# ANALYTICS TABLE: Click Events
# =============================================================================
# Key Design:
# - PK: LINK#{linkId}#YYYY-MM (partition by link + month for scalability)
# - SK: TS#{timestamp}#{eventId} for time-ordered events
#
# Access Patterns:
# 1. Get events for a link in time range: PK=LINK#{linkId}#YYYY-MM, SK between
# 2. Aggregate by link owner: GSI (owner-month-index)

resource "aws_dynamodb_table" "analytics" {
  name         = "${var.project_name}-analytics-${var.environment}"
  billing_mode = var.dynamodb_billing_mode

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  # GSI1: Query analytics by owner for dashboard aggregations
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  # TTL for analytics data retention (e.g., 2 years)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  deletion_protection_enabled = var.enable_deletion_protection

  tags = {
    Name = "${var.project_name}-analytics-table"
  }
}

# =============================================================================
# AGGREGATES TABLE: Pre-computed analytics summaries
# =============================================================================
# Key Design:
# - PK: LINK#{linkId} or USER#{userId}
# - SK: AGG#daily#YYYY-MM-DD, AGG#monthly#YYYY-MM, AGG#total
#
# Used for fast dashboard queries without scanning events

resource "aws_dynamodb_table" "aggregates" {
  name         = "${var.project_name}-aggregates-${var.environment}"
  billing_mode = var.dynamodb_billing_mode

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  deletion_protection_enabled = var.enable_deletion_protection

  tags = {
    Name = "${var.project_name}-aggregates-table"
  }
}

# =============================================================================
# BILLING TABLE
# =============================================================================

resource "aws_dynamodb_table" "billing" {
  name         = "${var.project_name}-billing-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userSub"

  attribute {
    name = "userSub"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-billing"
  }
}
