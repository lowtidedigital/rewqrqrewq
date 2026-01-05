// Analytics Handler - Authenticated endpoints for analytics data
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { 
  getLinkById, 
  getClickEvents, 
  getLinkAggregates,
  listLinksByUser 
} from '../lib/dynamodb.js';
import { 
  getUserIdFromEvent, 
  apiResponse, 
  errorResponse,
  logger 
} from '../lib/utils.js';
import type { AnalyticsSummary } from '../types/index.js';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const path = event.rawPath;
  const linkId = event.pathParameters?.id;

  // Get authenticated user
  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return errorResponse(401, 'UNAUTHORIZED', 'Authentication required');
  }

  logger.info('Analytics API request', { path, userId, linkId });

  try {
    if (linkId) {
      // Link-specific analytics: GET /links/{id}/analytics
      return await handleLinkAnalytics(linkId, userId, event);
    } else {
      // Dashboard analytics: GET /analytics
      return await handleDashboardAnalytics(userId, event);
    }
  } catch (error) {
    logger.error('Analytics API error', error as Error, { path, userId });
    return errorResponse(500, 'INTERNAL_ERROR', 'An error occurred processing your request');
  }
}

// =============================================================================
// LINK ANALYTICS
// =============================================================================

async function handleLinkAnalytics(
  linkId: string, 
  userId: string,
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  // Verify ownership
  const link = await getLinkById(userId, linkId);
  if (!link) {
    return errorResponse(404, 'NOT_FOUND', 'Link not found');
  }

  const params = event.queryStringParameters || {};
  const days = Math.min(parseInt(params.days || '30'), 365);
  const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

  // Get aggregates and recent events in parallel
  const [aggregates, recentEvents] = await Promise.all([
    getLinkAggregates(linkId),
    getClickEvents(linkId, { startDate, limit: 100 }),
  ]);

  // Process events for analytics breakdown
  const referrerCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};

  for (const event of recentEvents) {
    // Referrers
    const referrer = event.referrer ? new URL(event.referrer).hostname : 'direct';
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

    // Countries
    const country = event.country || 'unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;

    // Devices
    const device = event.device || 'unknown';
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  }

  // Calculate time-based stats
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - (7 * 24 * 60 * 60 * 1000);
  const monthStart = now - (30 * 24 * 60 * 60 * 1000);

  let clicksToday = 0;
  let clicksThisWeek = 0;
  let clicksThisMonth = 0;

  for (const event of recentEvents) {
    if (event.timestamp >= todayStart) clicksToday++;
    if (event.timestamp >= weekStart) clicksThisWeek++;
    if (event.timestamp >= monthStart) clicksThisMonth++;
  }

  const summary: AnalyticsSummary = {
    totalClicks: aggregates.total,
    clicksToday,
    clicksThisWeek,
    clicksThisMonth,
    topReferrers: Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count })),
    topCountries: Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count })),
    deviceBreakdown: Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([device, count]) => ({ device, count })),
    clicksOverTime: aggregates.daily
  .slice(-days)
  .map(d => ({ date: d.date, count: d.clicks })),

  };

  return apiResponse(200, {
    link: {
      id: link.id,
      slug: link.slug,
      title: link.title,
      longUrl: link.longUrl,
    },
    summary,
    recentEvents: recentEvents.slice(0, 50).map(e => ({
      timestamp: e.timestamp,
      referrer: e.referrer,
      country: e.country,
      device: e.device,
    })),
  });
}

// =============================================================================
// DASHBOARD ANALYTICS
// =============================================================================

async function handleDashboardAnalytics(
  userId: string,
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const params = event.queryStringParameters || {};
  const days = Math.min(parseInt(params.days || '30'), 365);

  // Get user's links
  const { links } = await listLinksByUser(userId, { limit: 100 });

  // Aggregate stats across all links
  let totalClicks = 0;
  let totalLinks = links.length;
  let activeLinks = 0;

  const referrerCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};
  const dailyClicks: Record<string, number> = {};

  // Get aggregates for each link
  const now = Date.now();
  const startDate = now - (days * 24 * 60 * 60 * 1000);

  for (const link of links) {
    totalClicks += link.clickCount;
    if (link.enabled) activeLinks++;

    // Get click events for breakdown
    const events = await getClickEvents(link.id, { startDate, limit: 50 });
    
    for (const event of events) {
      // Referrers
      const referrer = event.referrer ? 
        (() => { try { return new URL(event.referrer).hostname; } catch { return 'direct'; } })() 
        : 'direct';
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

      // Countries
      const country = event.country || 'unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      // Devices
      const device = event.device || 'unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;

      // Daily
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;
    }
  }

  // Calculate time-based stats
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - (7 * 24 * 60 * 60 * 1000);
  const monthStart = now - (30 * 24 * 60 * 60 * 1000);

  const today = new Date(todayStart).toISOString().split('T')[0];
  const clicksToday = dailyClicks[today] || 0;

  // Top performing links
  const topLinks = [...links]
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      clicks: l.clickCount,
    }));

  return apiResponse(200, {
    overview: {
      totalLinks,
      activeLinks,
      totalClicks,
      clicksToday,
    },
    topLinks,
    topReferrers: Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count })),
    topCountries: Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count })),
    deviceBreakdown: Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([device, count]) => ({ device, count })),
    clicksOverTime: Object.entries(dailyClicks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count })),
  });
}
