import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const LINKS_TABLE = process.env.LINKS_TABLE!;
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE!;
const SLUG_GSI = process.env.SLUG_GSI || "slug-index"; // only used if your table uses a GSI

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

// Try to resolve a link by slug using either:
// A) PK = slug (GetItem)
// B) PK = link_id with GSI on slug (Query on SLUG_GSI)
async function getLinkBySlug(slug: string) {
  // A) Try GetItem where the partition key is "slug"
  try {
    const r = await ddb.send(
      new GetCommand({
        TableName: LINKS_TABLE,
        Key: { slug },
      })
    );
    if (r.Item) return r.Item;
  } catch {
    // ignore; table might not have pk=slug
  }

  // B) Try GSI query (common: slug-index with pk=slug)
  try {
    const q = await ddb.send(
      new QueryCommand({
        TableName: LINKS_TABLE,
        IndexName: SLUG_GSI,
        KeyConditionExpression: "#s = :slug",
        ExpressionAttributeNames: { "#s": "slug" },
        ExpressionAttributeValues: { ":slug": slug },
        Limit: 1,
      })
    );
    if (q.Items && q.Items.length > 0) return q.Items[0];
  } catch {
    // ignore; index may not exist or named differently
  }

  return null;
}

async function writeClickEvent(params: {
  slug: string;
  link_id?: string;
  owner_user_id?: string;
  referrer?: string;
  user_agent?: string;
}) {
  // Best-effort click logging (don’t block redirect if this fails)
  try {
    const now = Date.now();
    const item = {
      event_id: randomUUID(),
      ts: now,
      slug: params.slug,
      link_id: params.link_id || null,
      owner_user_id: params.owner_user_id || null,
      referrer: params.referrer || null,
      ua: params.user_agent || null,
    };

    await ddb.send(
      new PutCommand({
        TableName: ANALYTICS_TABLE,
        Item: item,
      })
    );
  } catch {
    // swallow
  }
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const slug = event.pathParameters?.slug;

  if (!slug) {
    return html(400, "Bad Request", "Missing slug.");
  }

  const link = await getLinkBySlug(slug);

  if (!link) {
    return html(404, "Not Found", `Short link "${slug}" does not exist.`);
  }

  // support a few field name variants (depending on your write handler)
  const longUrl: string | undefined =
    link.long_url || link.longUrl || link.destination || link.url;

  if (!longUrl) {
    return html(500, "Server Error", "Link record is missing destination URL.");
  }

  const enabled =
    link.enabled === undefined || link.enabled === null ? true : !!link.enabled;

  if (!enabled) {
    return html(410, "Link Disabled", "This short link has been disabled.");
  }

  if (isExpired(link.expires_at ?? link.expiresAt ?? null)) {
    return html(410, "Link Expired", "This short link has expired.");
  }

  const redirectType = Number(link.redirect_type || link.redirectType || 302);
  const statusCode = redirectType === 301 ? 301 : 302;

  // Best-effort analytics
  await writeClickEvent({
    slug,
    link_id: link.link_id || link.linkId,
    owner_user_id: link.owner_user_id || link.ownerUserId,
    referrer: event.headers?.referer || event.headers?.referrer,
    user_agent: event.headers?.["user-agent"],
  });

  return {
    statusCode,
    headers: {
      Location: longUrl,
      "Cache-Control": "no-cache",
    },
    body: "",
  };
}
