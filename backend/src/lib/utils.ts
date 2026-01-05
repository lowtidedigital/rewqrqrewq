// Utility functions for Lambda handlers

import { createHash, randomBytes } from 'crypto';

// Base62 characters for slug generation
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a random base62 slug
 */
export function generateSlug(length: number = 7): string {
  const bytes = randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i] % 62];
  }
  
  return result;
}

/**
 * Validate a custom slug format
 */
export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric and hyphens, 3-50 chars
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,48}[a-zA-Z0-9]$/.test(slug) || 
         /^[a-zA-Z0-9]{1,50}$/.test(slug);
}

/**
 * Validate URL format and safety
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  // Check basic format
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Max length check
  if (url.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters)' };
  }

  // Parse URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Only allow http/https schemes
  const allowedSchemes = ['http:', 'https:'];
  if (!allowedSchemes.includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
  }

  // Block dangerous patterns
  const dangerousPatterns = [
    /^javascript:/i,
    /^data:/i,
    /^file:/i,
    /^vbscript:/i,
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(url))) {
    return { valid: false, error: 'URL contains disallowed scheme' };
  }

  return { valid: true };
}

/**
 * Hash an IP address for privacy-preserving analytics
 */
export function hashIP(ip: string, salt: string = 'shortfuse'): string {
  return createHash('sha256')
    .update(`${ip}:${salt}:${new Date().toISOString().split('T')[0]}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Parse device type from user agent
 */
export function parseDevice(userAgent: string): string {
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

/**
 * Extract country from CloudFront headers
 */
export function parseCountry(headers: Record<string, string>): string {
  // CloudFront adds this header
  return headers['cloudfront-viewer-country'] || 
         headers['cf-ipcountry'] || 
         'unknown';
}

/**
 * Create API response helper
 */
export function apiResponse(statusCode: number, body: any, headers: Record<string, string> = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Create redirect response
 */
export function redirectResponse(url: string, statusCode: 301 | 302 = 302, cacheSeconds: number = 60) {
  return {
    statusCode,
    headers: {
      'Location': url,
      'Cache-Control': `public, max-age=${cacheSeconds}`,
      'X-Robots-Tag': 'noindex',
    },
    body: '',
  };
}

/**
 * Create error response
 */
export function errorResponse(statusCode: number, error: string, message: string) {
  return apiResponse(statusCode, { error, message, statusCode });
}

/**
 * Extract user ID from Cognito JWT claims
 */
export function getUserIdFromEvent(event: any): string | null {
  try {
    // API Gateway HTTP API v2 format
    const claims = event.requestContext?.authorizer?.jwt?.claims;
    if (claims?.sub) {
      return claims.sub;
    }

    // Fallback to v1 format
    const authorizerClaims = event.requestContext?.authorizer?.claims;
    if (authorizerClaims?.sub) {
      return authorizerClaims.sub;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse request body safely
 */
export function parseBody<T>(body: string | null | undefined): T | null {
  if (!body) return null;
  
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

/**
 * Structured logger
 */
export const logger = {
  info: (message: string, data?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'INFO', message, ...data, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, data?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'WARN', message, ...data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, data?: Record<string, any>) => {
    console.error(JSON.stringify({ 
      level: 'ERROR', 
      message, 
      error: error?.message, 
      stack: error?.stack,
      ...data, 
      timestamp: new Date().toISOString() 
    }));
  },
};
