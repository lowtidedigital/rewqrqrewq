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
} from '../lib/utils.js';
import type { AnalyticsSummary } from '../types/index.js';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Structured logger with debug control
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

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const requestId = event.requestContext?.requestId || 'unknown';
  const path = event.rawPath;
  const linkId = event.pathParameters?.id;

  // Get authenticated user
  const userId = getUserIdFromEvent(event);
  if (!userId) {
    logger.warn('Unauthorized analytics request', { requestId, path });
    return errorResponse(401, 'UNAUTHORIZED', 'Authentication required');
  }

  logger.info('Analytics API request', { requestId, path, userId, linkId });

  try {
    if (linkId) {
      // Link-specific analytics: GET /links/{id}/analytics
      return await handleLinkAnalytics(linkId, userId, event, requestId);
    } else {
      // Dashboard analytics: GET /analytics or GET /analytics/dashboard
      return await handleDashboardAnalytics(userId, event, requestId);
    }
  } catch (error) {
    logger.error('Analytics API error', error as Error, { requestId, path, userId });
    return errorResponse(500, 'INTERNAL_ERROR', 'An error occurred processing your request');
  }
}

// =============================================================================
// LINK ANALYTICS
// =============================================================================

async function handleLinkAnalytics(
  linkId: string, 
  userId: string,
  event: APIGatewayProxyEventV2,
  requestId: string
): Promise<APIGatewayProxyResultV2> {
  logger.debug('Fetching link analytics', { requestId, linkId, userId });

  // Verify ownership
  const link = await getLinkById(userId, linkId);
  if (!link) {
    logger.info('Link not found or not owned by user', { requestId, linkId, userId });
    return errorResponse(404, 'NOT_FOUND', 'Link not found');
  }

  const params = event.queryStringParameters || {};
  const days = Math.min(parseInt(params.days || '30'), 365);
  const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

  logger.debug('Querying analytics data', { requestId, linkId, days, startDate });

  // Get aggregates and recent events in parallel
  const [aggregates, recentEvents] = await Promise.all([
    getLinkAggregates(linkId),
    getClickEvents(linkId, { startDate, limit: 100 }),
  ]);

  logger.debug('Analytics data fetched', { 
    requestId, 
    linkId, 
    aggregateTotal: aggregates.total,
    dailyCount: aggregates.daily.length,
    recentEventsCount: recentEvents.length,
  });

  // Process events for analytics breakdown
  const referrerCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};

  for (const evt of recentEvents) {
    // Referrers
    let referrer = 'direct';
    if (evt.referrer) {
      try {
        referrer = new URL(evt.referrer).hostname;
      } catch {
        referrer = 'direct';
      }
    }
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

    // Countries
    const country = evt.country || 'unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;

    // Devices
    const device = evt.device || 'unknown';
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  }

  // Calculate time-based stats from events
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - (7 * 24 * 60 * 60 * 1000);
  const monthStart = now - (30 * 24 * 60 * 60 * 1000);

  let clicksToday = 0;
  let clicksThisWeek = 0;
  let clicksThisMonth = 0;

  for (const evt of recentEvents) {
    const ts = evt.timestamp || 0;
    if (ts >= todayStart) clicksToday++;
    if (ts >= weekStart) clicksThisWeek++;
    if (ts >= monthStart) clicksThisMonth++;
  }

  // Build last 7 days array for chart
  const last7Days: { date: string; clicks: number }[] = [];
  const dailyMap = new Map(aggregates.daily.map(d => [d.date, d.clicks]));
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    last7Days.push({
      date: dateStr,
      clicks: dailyMap.get(dateStr) || 0,
    });
  }

  // Compute effective total with fallbacks
  const effectiveTotal = aggregates.total > 0 
    ? aggregates.total 
    : Math.max(clicksToday, clicksThisWeek, clicksThisMonth, recentEvents.length);

  const summary: AnalyticsSummary = {
    totalClicks: effectiveTotal,
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
    // Ensure clicksOverTime is populated, fallback to last7Days format
    clicksOverTime: last7Days.map(d => ({ date: d.date, count: d.clicks })),
  };

  logger.info('Link analytics response', { 
    requestId, 
    linkId, 
    totalClicks: effectiveTotal,
    clicksToday,
  });

  return apiResponse(200, {
    linkId: link.id,
    totalClicks: effectiveTotal,
    last7Days,
    referrers: summary.topReferrers,
    devices: summary.deviceBreakdown,
    countries: summary.topCountries,
    // Include full summary for frontend normalization
    link: {
      id: link.id,
      slug: link.slug,
      title: link.title,
      longUrl: link.longUrl,
    },
    summary,
    recentEvents: recentEvents.slice(0, 50).map(e => ({
      eventId: e.eventId,
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
  event: APIGatewayProxyEventV2,
  requestId: string
): Promise<APIGatewayProxyResultV2> {
  logger.debug('Fetching dashboard analytics', { requestId, userId });

  const params = event.queryStringParameters || {};
  const days = Math.min(parseInt(params.days || '30'), 365);

  // Get user's links
  const { links } = await listLinksByUser(userId, { limit: 100 });
  
  logger.debug('User links fetched', { requestId, userId, linkCount: links.length });

  // Aggregate stats across all links
  let totalClicks = 0;
  const totalLinks = links.length;
  let activeLinks = 0;

  const referrerCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};
  const dailyClicks: Record<string, number> = {};

  // Get aggregates for each link
  const now = Date.now();
  const startDate = now - (days * 24 * 60 * 60 * 1000);
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - (7 * 24 * 60 * 60 * 1000);

  let clicksToday = 0;
  let clicksThisWeek = 0;

  for (const link of links) {
    totalClicks += link.clickCount || 0;
    if (link.enabled) activeLinks++;

    // Get click events for breakdown (limit per link to avoid timeouts)
    try {
      const events = await getClickEvents(link.id, { startDate, limit: 50 });
      
      for (const evt of events) {
        // Time-based
        const ts = evt.timestamp || 0;
        if (ts >= todayStart) clicksToday++;
        if (ts >= weekStart) clicksThisWeek++;

        // Referrers
        let referrer = 'direct';
        if (evt.referrer) {
          try { referrer = new URL(evt.referrer).hostname; } catch { /* keep direct */ }
        }
        referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

        // Countries
        const country = evt.country || 'unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;

        // Devices
        const device = evt.device || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;

        // Daily
        const date = new Date(ts).toISOString().split('T')[0];
        dailyClicks[date] = (dailyClicks[date] || 0) + 1;
      }
    } catch (err) {
      logger.warn('Failed to fetch events for link', { requestId, linkId: link.id });
    }
  }

  // Top performing links
  const topLinks = [...links]
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      longUrl: l.longUrl,
      clicks: l.clickCount || 0,
      clickCount: l.clickCount || 0,
    }));

  logger.info('Dashboard analytics response', { 
    requestId, 
    userId,
    totalLinks,
    activeLinks,
    totalClicks,
    clicksToday,
  });

  return apiResponse(200, {
    // New format for frontend
    totalLinks,
    activeLinks,
    totalClicks,
    clicksToday,
    clicksThisWeek,
    topLinks,
    // Legacy format for backwards compatibility
    overview: {
      totalLinks,
      activeLinks,
      totalClicks,
      clicksToday,
    },
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
