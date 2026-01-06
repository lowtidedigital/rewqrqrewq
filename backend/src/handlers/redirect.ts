// Redirect Handler - Public, must be FAST
// This Lambda handles the public redirect endpoint for short links

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getLinkBySlug, recordClickEvent, incrementClickCount } from '../lib/dynamodb.js';
import {
  redirectResponse,
  errorResponse,
  hashIP,
  parseDevice,
  parseCountry,
  logger
} from '../lib/utils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * API Gateway headers are typed as Record<string, string | undefined>.
 * Some utils expect Record<string, string>, so we normalize by dropping undefined values.
 */
function normalizeHeaders(
  headers: APIGatewayProxyEventV2['headers'] | undefined
): Record<string, string> {
  if (!headers) return {};
  const entries = Object.entries(headers).filter(([, v]) => typeof v === 'string');
  return Object.fromEntries(entries) as Record<string, string>;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> { ... }
  const startTime = Date.now();
  const slug = event.pathParameters?.slug;

  logger.info('Redirect request', { slug, path: event.rawPath });

  if (!slug) {
    return errorResponse(400, 'BAD_REQUEST', 'Slug is required');
  }

  try {
    // Get link from DynamoDB
    const link = await getLinkBySlug(slug);

    if (!link) {
      logger.warn('Link not found', { slug });
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Not Found - LinkHarbour</title>
              <meta name="robots" content="noindex">
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 4rem; margin: 0; color: #f97316; }
                p { font-size: 1.25rem; color: #94a3b8; }
                a { color: #f97316; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>404</h1>
                <p>This short link doesn't exist.</p>
                <p><a href="https://${process.env.APP_DOMAIN || 'app.linkharbour.io'}">Create your own short links →</a></p>
              </div>
            </body>
          </html>
        `,
      };
    }

    // Check if link is enabled
    if (!link.enabled) {
      logger.warn('Link disabled', { slug, linkId: link.id });
      return {
        statusCode: 410,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Disabled - LinkHarbour</title>
              <meta name="robots" content="noindex">
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 2rem; margin: 0 0 1rem; color: #f97316; }
                p { color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Link Disabled</h1>
                <p>This short link has been disabled by its owner.</p>
              </div>
            </body>
          </html>
        `,
      };
    }

    // Check if link is expired
    if (link.expiresAt && link.expiresAt < Date.now()) {
      logger.warn('Link expired', { slug, linkId: link.id, expiresAt: link.expiresAt });
      return {
        statusCode: 410,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Expired - LinkHarbour</title>
              <meta name="robots" content="noindex">
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 2rem; margin: 0 0 1rem; color: #f97316; }
                p { color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Link Expired</h1>
                <p>This short link has expired.</p>
              </div>
            </body>
          </html>
        `,
      };
    }

    // Record analytics asynchronously (don't wait for it)
    if (!link.privacyMode) {
      const headers = normalizeHeaders(event.headers);

      // Fire and forget - don't block the redirect
      Promise.all([
        recordClickEvent({
          eventId: uuidv4(),
          linkId: link.id,
          slug: link.slug,
          userId: link.userId,
          timestamp: Date.now(),
          referrer: headers['referer'] || headers['Referer'],
          userAgent: headers['user-agent'] || headers['User-Agent'],
          country: parseCountry(headers),
          device: parseDevice(headers['user-agent'] || headers['User-Agent'] || ''),
          ipHash: hashIP(event.requestContext?.http?.sourceIp || ''),
        }),
        incrementClickCount(link.userId, link.id),
      ]).catch((err) => {
        logger.error('Failed to record analytics', err);
      });
    }

    const duration = Date.now() - startTime;
    logger.info('Redirect successful', {
      slug,
      linkId: link.id,
      redirectType: link.redirectType,
      duration
    });

    // Return redirect response
    // Use shorter cache for 302 (temporary), longer for 301 (permanent)
    const cacheSeconds = link.redirectType === 301 ? 300 : 60;

    return redirectResponse(link.longUrl, link.redirectType, cacheSeconds);
  } catch (error) {
    logger.error('Redirect error', error as Error, { slug });
    return errorResponse(500, 'INTERNAL_ERROR', 'An error occurred processing your request');
  }
}
