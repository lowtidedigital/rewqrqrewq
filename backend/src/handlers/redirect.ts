import type { APIGatewayProxyEventHeaders } from "aws-lambda";

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const LINKS_TABLE = process.env.LINKS_TABLE!;
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE!;
const AGGREGATES_TABLE = process.env.AGGREGATES_TABLE!;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Structured logger
const logger = {
  debug: (msg: string, data?: Record<string, any>) => {
    if (LOG_LEVEL === 'debug') {
      console.log(JSON.stringify({ level: 'DEBUG', message: msg, ...data, timestamp: new Date().toISOString() }));
    }
  },
  info: (msg: string, data?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'INFO', message: msg, ...data, timestamp: new Date().toISOString() }));
  },
  warn: (msg: string, data?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'WARN', message: msg, ...data, timestamp: new Date().toISOString() }));
  },
  error: (msg: string, error?: Error, data?: Record<string, any>) => {
    console.error(JSON.stringify({ 
      level: 'ERROR', message: msg, error: error?.message, stack: error?.stack, 
      ...data, timestamp: new Date().toISOString() 
    }));
  },
};

function html(statusCode: number, title: string, message: string) {
  return {
    statusCode,
    headers: { "content-type": "text/html; charset=utf-8" },
    body: `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:system-ui;padding:40px;max-width:720px;margin:auto">
      <h1>${title}</h1><p>${message}</p></body></html>`,
  };
}

function isExpired(expiresAt?: string | number | null) {
  if (!expiresAt) return false;
  const ts =
    typeof expiresAt === "number"
      ? expiresAt
      : Number.isFinite(Number(expiresAt))
      ? Number(expiresAt)
      : Date.parse(String(expiresAt));
  if (!Number.isFinite(ts)) return false;
  return Date.now() > ts;
}

function parseDevice(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'mobile';
  }
  if (/bot|crawler|spider|slurp|googlebot|bingbot/i.test(ua)) {
    return 'bot';
  }
  return 'desktop';
}

function parseCountry(headers: APIGatewayProxyEventHeaders = {}): string {
  const get = (k: string) => {
    const v = headers[k] ?? headers[k.toLowerCase()] ?? headers[k.toUpperCase()];
    return typeof v === "string" ? v : "";
  };

  // keep/expand keys based on what your infra sets
  const country =
    get("cloudfront-viewer-country") ||
    get("CloudFront-Viewer-Country") ||
    get("x-country") ||
    get("x-vercel-ip-country") ||
    "";

  return country ? country.toUpperCase() : "US"; // choose your default
}


// Get link by slug using the single-table design
// PK: SLUG#{slug}, SK: METADATA -> returns linkId + userId
// Then fetch full link from PK: USER#{userId}, SK: LINK#{linkId}
async function getLinkBySlug(slug: string) {
  logger.debug('Looking up slug', { slug, table: LINKS_TABLE });

  // First: Get slug mapping
  const slugResult = await ddb.send(
    new GetCommand({
      TableName: LINKS_TABLE,
      Key: {
        PK: `SLUG#${slug}`,
        SK: 'METADATA',
      },
    })
  );

  if (!slugResult.Item) {
    logger.debug('Slug not found in mapping', { slug });
    return null;
  }

  const { linkId, userId } = slugResult.Item;
  logger.debug('Slug mapping found', { slug, linkId, userId });

  // Second: Get full link data
  const linkResult = await ddb.send(
    new GetCommand({
      TableName: LINKS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `LINK#${linkId}`,
      },
    })
  );

  if (!linkResult.Item) {
    logger.warn('Link not found after slug mapping', { slug, linkId, userId });
    return null;
  }

  return linkResult.Item;
}

// Write click event with proper composite keys matching analytics handler expectations
async function writeClickEvent(params: {
  slug: string;
  linkId: string;
  userId: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
}) {
  const now = Date.now();
  const eventId = randomUUID();
  const date = new Date(now);
  const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  const dayKey = date.toISOString().split('T')[0];
  const device = parseDevice(params.userAgent);

  logger.debug('Writing click event', { 
    linkId: params.linkId, 
    slug: params.slug,
    userId: params.userId,
    eventId,
    monthKey,
    dayKey,
  });

  try {
    // 1. Write raw event to analytics table with proper keys
    await ddb.send(
      new PutCommand({
        TableName: ANALYTICS_TABLE,
        Item: {
          PK: `LINK#${params.linkId}#${monthKey}`,
          SK: `TS#${now}#${eventId}`,
          GSI1PK: `USER#${params.userId}#${monthKey}`,
          GSI1SK: `TS#${now}`,
          eventId,
          linkId: params.linkId,
          slug: params.slug,
          userId: params.userId,
          timestamp: now,
          referrer: params.referrer || null,
          userAgent: params.userAgent || null,
          country: params.country || null,
          device,
          ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60 * 2), // 2 years
        },
      })
    );
    logger.debug('Click event written to analytics table', { eventId });

    // 2. Update daily aggregate
    await ddb.send(
      new UpdateCommand({
        TableName: AGGREGATES_TABLE,
        Key: {
          PK: `LINK#${params.linkId}`,
          SK: `AGG#daily#${dayKey}`,
        },
        UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
          ':now': now,
        },
      })
    );
    logger.debug('Daily aggregate updated', { linkId: params.linkId, dayKey });

    // 3. Update total aggregate
    await ddb.send(
      new UpdateCommand({
        TableName: AGGREGATES_TABLE,
        Key: {
          PK: `LINK#${params.linkId}`,
          SK: 'AGG#total',
        },
        UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
          ':now': now,
        },
      })
    );
    logger.debug('Total aggregate updated', { linkId: params.linkId });

    // 4. Update user monthly aggregate
    await ddb.send(
      new UpdateCommand({
        TableName: AGGREGATES_TABLE,
        Key: {
          PK: `USER#${params.userId}`,
          SK: `AGG#monthly#${monthKey}`,
        },
        UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
          ':now': now,
        },
      })
    );
    logger.debug('User monthly aggregate updated', { userId: params.userId, monthKey });

    // 5. Update click count on link record
    await ddb.send(
      new UpdateCommand({
        TableName: LINKS_TABLE,
        Key: {
          PK: `USER#${params.userId}`,
          SK: `LINK#${params.linkId}`,
        },
        UpdateExpression: 'SET clickCount = if_not_exists(clickCount, :zero) + :inc',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
        },
      })
    );
    logger.debug('Link clickCount incremented', { linkId: params.linkId });

    logger.info('Click event recorded successfully', { 
      eventId, 
      linkId: params.linkId, 
      slug: params.slug 
    });

  } catch (err) {
    logger.error('Failed to write click event', err as Error, { 
      linkId: params.linkId, 
      slug: params.slug 
    });
    // Don't throw - redirect should still work even if analytics fails
  }
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const requestId = event.requestContext?.requestId || randomUUID();
  const slug = event.pathParameters?.slug;

  logger.info('Redirect request', { requestId, slug, method: event.requestContext?.http?.method });

  if (!slug) {
    logger.warn('Missing slug', { requestId });
    return html(400, "Bad Request", "Missing slug.");
  }

  const link = await getLinkBySlug(slug);

  if (!link) {
    logger.info('Link not found', { requestId, slug });
    return html(404, "Not Found", `Short link "${slug}" does not exist.`);
  }

  const linkId = link.id || link.linkId;
  const userId = link.userId || link.owner_user_id;
  const longUrl = link.longUrl || link.long_url || link.destination || link.url;
  const enabled = link.enabled === undefined || link.enabled === null ? true : !!link.enabled;
  const expiresAt = link.expiresAt ?? link.expires_at ?? null;

  logger.debug('Link resolved', { 
    requestId, 
    slug, 
    linkId, 
    userId, 
    enabled, 
    hasDestination: !!longUrl,
  });

  if (!longUrl) {
    logger.error('Link missing destination URL', undefined, { requestId, linkId });
    return html(500, "Server Error", "Link record is missing destination URL.");
  }

  // Disabled links: 410 Gone, NO analytics
  if (!enabled) {
    logger.info('Link disabled', { requestId, slug, linkId });
    return html(410, "Link Disabled", "This short link has been disabled.");
  }

  // Expired links: 410 Gone, NO analytics
  if (isExpired(expiresAt)) {
    logger.info('Link expired', { requestId, slug, linkId, expiresAt });
    return html(410, "Link Expired", "This short link has expired.");
  }

  const redirectType = Number(link.redirectType || link.redirect_type || 302);
  const statusCode = redirectType === 301 ? 301 : 302;
  const headers = event.headers || {};
  const privacyMode = link.privacyMode ?? link.privacy_mode ?? false;

  // Record analytics (async, don't block redirect) - skip if privacy mode is enabled
  if (!privacyMode) {
    writeClickEvent({
      slug,
      linkId,
      userId,
      referrer: headers['referer'] || headers['referrer'],
      userAgent: headers['user-agent'],
      country: parseCountry(headers),
    });
  } else {
    logger.debug('Privacy mode enabled, skipping analytics', { linkId, slug });
  }

  logger.info('Redirect successful', { requestId, slug, linkId, statusCode, destination: longUrl });

  return {
    statusCode,
    headers: {
      Location: longUrl,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
    body: "",
  };
}
