// Links CRUD Handler - Authenticated endpoints for link management
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { 
  getLinkById, 
  listLinksByUser, 
  createLink, 
  updateLink, 
  softDeleteLink,
  checkSlugAvailable 
} from '../lib/dynamodb.js';
import { generateQRCode, getQRCodeUrls, getQRCodeThumbnailUrl } from '../lib/qrcode.js';
import { 
  generateSlug, 
  isValidSlug, 
  validateUrl, 
  getUserIdFromEvent, 
  parseBody,
  apiResponse, 
  errorResponse,
  logger 
} from '../lib/utils.js';
import type { Link, CreateLinkRequest, UpdateLinkRequest } from '../types/index.js';

const SHORT_DOMAIN = process.env.SHORT_DOMAIN || 's.example.com';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;
  const linkId = event.pathParameters?.id;

  // Get authenticated user
  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return errorResponse(401, 'UNAUTHORIZED', 'Authentication required');
  }

  logger.info('Links API request', { method, path, userId, linkId });

  try {
    // Route to appropriate handler
    switch (method) {
      case 'POST':
        return await handleCreate(event, userId);
      case 'GET':
        if (linkId) {
          return await handleGet(linkId, userId);
        }
        return await handleList(event, userId);
      case 'PUT':
        if (!linkId) {
          return errorResponse(400, 'BAD_REQUEST', 'Link ID required');
        }
        return await handleUpdate(event, linkId, userId);
      case 'DELETE':
        if (!linkId) {
          return errorResponse(400, 'BAD_REQUEST', 'Link ID required');
        }
        return await handleDelete(linkId, userId);
      default:
        return errorResponse(405, 'METHOD_NOT_ALLOWED', `Method ${method} not allowed`);
    }
  } catch (error) {
    logger.error('Links API error', error as Error, { method, path, userId });
    return errorResponse(500, 'INTERNAL_ERROR', 'An error occurred processing your request');
  }
}

// =============================================================================
// CREATE LINK
// =============================================================================

async function handleCreate(event: APIGatewayProxyEventV2, userId: string): Promise<APIGatewayProxyResultV2> {
  const body = parseBody<CreateLinkRequest>(event.body);
  
  if (!body) {
    return errorResponse(400, 'BAD_REQUEST', 'Request body is required');
  }

  // Validate long URL
  const urlValidation = validateUrl(body.longUrl);
  if (!urlValidation.valid) {
    return errorResponse(400, 'INVALID_URL', urlValidation.error!);
  }

  // Generate or validate slug
  let slug: string;
  if (body.customSlug) {
    if (!isValidSlug(body.customSlug)) {
      return errorResponse(400, 'INVALID_SLUG', 'Slug must be 1-50 alphanumeric characters or hyphens');
    }
    
    const available = await checkSlugAvailable(body.customSlug);
    if (!available) {
      return errorResponse(409, 'SLUG_TAKEN', 'This custom slug is already in use');
    }
    
    slug = body.customSlug;
  } else {
    // Generate unique slug with collision check
    let attempts = 0;
    do {
      slug = generateSlug();
      const available = await checkSlugAvailable(slug);
      if (available) break;
      attempts++;
    } while (attempts < 5);
    
    if (attempts >= 5) {
      return errorResponse(500, 'SLUG_GENERATION_FAILED', 'Failed to generate unique slug');
    }
  }

  // Parse expiration date
  let expiresAt: number | undefined;
  if (body.expiresAt) {
    const parsed = new Date(body.expiresAt).getTime();
    if (isNaN(parsed) || parsed < Date.now()) {
      return errorResponse(400, 'INVALID_EXPIRATION', 'Expiration date must be in the future');
    }
    expiresAt = parsed;
  }

  const now = Date.now();
  const linkId = uuidv4();

  // Generate QR code
  const qrAssets = await generateQRCode(linkId, slug);

  const link: Link = {
    id: linkId,
    userId,
    slug,
    longUrl: body.longUrl,
    title: body.title?.substring(0, 200),
    tags: body.tags?.slice(0, 10).map(t => t.substring(0, 50)),
    notes: body.notes?.substring(0, 1000),
    enabled: body.enabled ?? true,
    privacyMode: body.privacyMode ?? false,
    redirectType: body.redirectType ?? 302,
    expiresAt,
    createdAt: now,
    updatedAt: now,
    clickCount: 0,
    qrPngKey: qrAssets.pngKey,
    qrSvgKey: qrAssets.svgKey,
    qrUpdatedAt: now,
  };

  await createLink(link);

  // Get QR URLs for response
  const qrUrls = await getQRCodeUrls(qrAssets.pngKey, qrAssets.svgKey);

  logger.info('Link created', { linkId, slug, userId });

  return apiResponse(201, {
    ...link,
    shortUrl: `https://${SHORT_DOMAIN}/${slug}`,
    qrPngUrl: qrUrls.pngUrl,
    qrSvgUrl: qrUrls.svgUrl,
  });
}

// =============================================================================
// GET LINK
// =============================================================================

async function handleGet(linkId: string, userId: string): Promise<APIGatewayProxyResultV2> {
  const link = await getLinkById(userId, linkId);
  
  if (!link) {
    return errorResponse(404, 'NOT_FOUND', 'Link not found');
  }

  // Get QR URLs
  let qrPngUrl: string | undefined;
  let qrSvgUrl: string | undefined;
  
  if (link.qrPngKey && link.qrSvgKey) {
    const qrUrls = await getQRCodeUrls(link.qrPngKey, link.qrSvgKey);
    qrPngUrl = qrUrls.pngUrl;
    qrSvgUrl = qrUrls.svgUrl;
  }

  return apiResponse(200, {
    ...link,
    shortUrl: `https://${SHORT_DOMAIN}/${link.slug}`,
    qrPngUrl,
    qrSvgUrl,
  });
}

// =============================================================================
// LIST LINKS
// =============================================================================

async function handleList(event: APIGatewayProxyEventV2, userId: string): Promise<APIGatewayProxyResultV2> {
  const params = event.queryStringParameters || {};
  const limit = Math.min(parseInt(params.limit || '50'), 100);
  const nextToken = params.nextToken;
  const search = params.search;

  const result = await listLinksByUser(userId, { limit, nextToken, search });

  // Get QR thumbnail URLs for each link
  const linksWithQr = await Promise.all(
    result.links.map(async (link) => {
      let qrThumbnailUrl: string | undefined;
      if (link.qrPngKey) {
        try {
          qrThumbnailUrl = await getQRCodeThumbnailUrl(link.qrPngKey);
        } catch {
          // Ignore QR URL errors
        }
      }
      return {
        ...link,
        shortUrl: `https://${SHORT_DOMAIN}/${link.slug}`,
        qrThumbnailUrl,
      };
    })
  );

  return apiResponse(200, {
    items: linksWithQr,
    nextToken: result.nextToken,
  });
}

// =============================================================================
// UPDATE LINK
// =============================================================================

async function handleUpdate(
  event: APIGatewayProxyEventV2, 
  linkId: string, 
  userId: string
): Promise<APIGatewayProxyResultV2> {
  const body = parseBody<UpdateLinkRequest>(event.body);
  
  if (!body) {
    return errorResponse(400, 'BAD_REQUEST', 'Request body is required');
  }

  // Get existing link
  const existingLink = await getLinkById(userId, linkId);
  if (!existingLink) {
    return errorResponse(404, 'NOT_FOUND', 'Link not found');
  }

  // Validate new long URL if provided
  if (body.longUrl) {
    const urlValidation = validateUrl(body.longUrl);
    if (!urlValidation.valid) {
      return errorResponse(400, 'INVALID_URL', urlValidation.error!);
    }
  }

  // Handle slug change
  let newSlug = existingLink.slug;
  let slugChanged = false;
  
  if (body.slug && body.slug !== existingLink.slug) {
    if (!isValidSlug(body.slug)) {
      return errorResponse(400, 'INVALID_SLUG', 'Slug must be 1-50 alphanumeric characters or hyphens');
    }
    
    const available = await checkSlugAvailable(body.slug);
    if (!available) {
      return errorResponse(409, 'SLUG_TAKEN', 'This slug is already in use');
    }
    
    newSlug = body.slug;
    slugChanged = true;
  }

  // Parse expiration date
  let expiresAt = existingLink.expiresAt;
  if (body.expiresAt === null) {
    expiresAt = undefined;
  } else if (body.expiresAt) {
    const parsed = new Date(body.expiresAt).getTime();
    if (isNaN(parsed) || parsed < Date.now()) {
      return errorResponse(400, 'INVALID_EXPIRATION', 'Expiration date must be in the future');
    }
    expiresAt = parsed;
  }

  const now = Date.now();

  // Regenerate QR if slug changed
  let qrPngKey = existingLink.qrPngKey;
  let qrSvgKey = existingLink.qrSvgKey;
  let qrUpdatedAt = existingLink.qrUpdatedAt;

  if (slugChanged) {
    const qrAssets = await generateQRCode(linkId, newSlug);
    qrPngKey = qrAssets.pngKey;
    qrSvgKey = qrAssets.svgKey;
    qrUpdatedAt = now;
  }

  const updatedLink: Link = {
    ...existingLink,
    slug: newSlug,
    longUrl: body.longUrl ?? existingLink.longUrl,
    title: body.title !== undefined ? body.title?.substring(0, 200) : existingLink.title,
    tags: body.tags !== undefined ? body.tags?.slice(0, 10).map(t => t.substring(0, 50)) : existingLink.tags,
    notes: body.notes !== undefined ? body.notes?.substring(0, 1000) : existingLink.notes,
    enabled: body.enabled ?? existingLink.enabled,
    privacyMode: body.privacyMode ?? existingLink.privacyMode,
    redirectType: body.redirectType ?? existingLink.redirectType,
    expiresAt,
    updatedAt: now,
    qrPngKey,
    qrSvgKey,
    qrUpdatedAt,
  };

  await updateLink(updatedLink, slugChanged ? existingLink.slug : undefined);

  // Get QR URLs for response
  const qrUrls = await getQRCodeUrls(qrPngKey!, qrSvgKey!);

  logger.info('Link updated', { linkId, userId, slugChanged });

  return apiResponse(200, {
    ...updatedLink,
    shortUrl: `https://${SHORT_DOMAIN}/${newSlug}`,
    qrPngUrl: qrUrls.pngUrl,
    qrSvgUrl: qrUrls.svgUrl,
  });
}

// =============================================================================
// DELETE LINK
// =============================================================================

async function handleDelete(linkId: string, userId: string): Promise<APIGatewayProxyResultV2> {
  const existingLink = await getLinkById(userId, linkId);
  if (!existingLink) {
    return errorResponse(404, 'NOT_FOUND', 'Link not found');
  }

  await softDeleteLink(userId, linkId);

  logger.info('Link deleted', { linkId, userId });

  return apiResponse(200, { success: true, message: 'Link deleted successfully' });
}
