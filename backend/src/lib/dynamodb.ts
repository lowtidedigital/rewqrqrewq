// DynamoDB client and utility functions
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  QueryCommand, 
  DeleteCommand,
  TransactWriteCommand
} from '@aws-sdk/lib-dynamodb';
import type { Link, ClickEvent } from '../types/index.js';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const LINKS_TABLE = process.env.LINKS_TABLE!;
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE!;
const AGGREGATES_TABLE = process.env.AGGREGATES_TABLE!;

// =============================================================================
// LINK OPERATIONS
// =============================================================================

export async function getLinkBySlug(slug: string): Promise<Link | null> {
  // First get the slug mapping
  const slugResult = await docClient.send(new GetCommand({
    TableName: LINKS_TABLE,
    Key: {
      PK: `SLUG#${slug}`,
      SK: 'METADATA',
    },
  }));

  if (!slugResult.Item) {
    return null;
  }

  const { linkId, userId } = slugResult.Item;

  // Then get the full link data
  const linkResult = await docClient.send(new GetCommand({
    TableName: LINKS_TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `LINK#${linkId}`,
    },
  }));

  if (!linkResult.Item) {
    return null;
  }

  return itemToLink(linkResult.Item);
}

export async function getLinkById(userId: string, linkId: string): Promise<Link | null> {
  const result = await docClient.send(new GetCommand({
    TableName: LINKS_TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `LINK#${linkId}`,
    },
  }));

  if (!result.Item) {
    return null;
  }

  return itemToLink(result.Item);
}

export async function listLinksByUser(
  userId: string, 
  options: { limit?: number; nextToken?: string; search?: string } = {}
): Promise<{ links: Link[]; nextToken?: string }> {
  const { limit = 50, nextToken, search } = options;

  const result = await docClient.send(new QueryCommand({
    TableName: LINKS_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: search 
      ? 'contains(title, :search) OR contains(slug, :search) OR contains(longUrl, :search)'
      : undefined,
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':skPrefix': 'LINK#',
      ...(search ? { ':search': search } : {}),
    },
    Limit: limit,
    ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
    ScanIndexForward: false, // Most recent first
  }));

  return {
    links: (result.Items || [])
      .map(itemToLink)
      .filter((link: Link | null): link is Link => link !== null && !link.deletedAt),
    nextToken: result.LastEvaluatedKey 
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined,
  };
}

export async function createLink(link: Link): Promise<void> {
  // Use a transaction to create both the link and slug mapping atomically
  await docClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: LINKS_TABLE,
          Item: {
            PK: `USER#${link.userId}`,
            SK: `LINK#${link.id}`,
            GSI1PK: `USER#${link.userId}`,
            GSI1SK: `CREATED#${link.createdAt}`,
            ...linkToItem(link),
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        Put: {
          TableName: LINKS_TABLE,
          Item: {
            PK: `SLUG#${link.slug}`,
            SK: 'METADATA',
            linkId: link.id,
            userId: link.userId,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
    ],
  }));
}

export async function updateLink(link: Link, oldSlug?: string): Promise<void> {
  const transactItems: any[] = [
    {
      Put: {
        TableName: LINKS_TABLE,
        Item: {
          PK: `USER#${link.userId}`,
          SK: `LINK#${link.id}`,
          GSI1PK: `USER#${link.userId}`,
          GSI1SK: `CREATED#${link.createdAt}`,
          ...linkToItem(link),
        },
      },
    },
  ];

  // If slug changed, update the slug mapping
  if (oldSlug && oldSlug !== link.slug) {
    transactItems.push(
      {
        Delete: {
          TableName: LINKS_TABLE,
          Key: {
            PK: `SLUG#${oldSlug}`,
            SK: 'METADATA',
          },
        },
      },
      {
        Put: {
          TableName: LINKS_TABLE,
          Item: {
            PK: `SLUG#${link.slug}`,
            SK: 'METADATA',
            linkId: link.id,
            userId: link.userId,
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      }
    );
  }

  await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
}

export async function softDeleteLink(userId: string, linkId: string): Promise<void> {
  const link = await getLinkById(userId, linkId);
  if (!link) return;

  const now = Date.now();
  
  await docClient.send(new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: LINKS_TABLE,
          Key: {
            PK: `USER#${userId}`,
            SK: `LINK#${linkId}`,
          },
          UpdateExpression: 'SET deletedAt = :deletedAt, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':deletedAt': now,
            ':updatedAt': now,
          },
        },
      },
      {
        Delete: {
          TableName: LINKS_TABLE,
          Key: {
            PK: `SLUG#${link.slug}`,
            SK: 'METADATA',
          },
        },
      },
    ],
  }));
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const result = await docClient.send(new GetCommand({
    TableName: LINKS_TABLE,
    Key: {
      PK: `SLUG#${slug}`,
      SK: 'METADATA',
    },
  }));

  return !result.Item;
}

export async function incrementClickCount(userId: string, linkId: string): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: LINKS_TABLE,
    Key: {
      PK: `USER#${userId}`,
      SK: `LINK#${linkId}`,
    },
    UpdateExpression: 'SET clickCount = if_not_exists(clickCount, :zero) + :inc',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1,
    },
  }));
}

// =============================================================================
// ANALYTICS OPERATIONS
// =============================================================================

export async function recordClickEvent(event: ClickEvent): Promise<void> {
  const date = new Date(event.timestamp);
  const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

  await docClient.send(new PutCommand({
    TableName: ANALYTICS_TABLE,
    Item: {
      PK: `LINK#${event.linkId}#${monthKey}`,
      SK: `TS#${event.timestamp}#${event.eventId}`,
      GSI1PK: `USER#${event.userId}#${monthKey}`,
      GSI1SK: `TS#${event.timestamp}`,
      ...event,
      ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60 * 2), // 2 years
    },
  }));

  // Update aggregates
  await updateAggregates(event);
}

async function updateAggregates(event: ClickEvent): Promise<void> {
  const date = new Date(event.timestamp);
  const dayKey = date.toISOString().split('T')[0];
  const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

  // Update link daily aggregate
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: {
      PK: `LINK#${event.linkId}`,
      SK: `AGG#daily#${dayKey}`,
    },
    UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1,
      ':now': Date.now(),
    },
  }));

  // Update link total
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: {
      PK: `LINK#${event.linkId}`,
      SK: 'AGG#total',
    },
    UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1,
      ':now': Date.now(),
    },
  }));

  // Update user monthly aggregate
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: {
      PK: `USER#${event.userId}`,
      SK: `AGG#monthly#${monthKey}`,
    },
    UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1,
      ':now': Date.now(),
    },
  }));
}

export async function getClickEvents(
  linkId: string, 
  options: { startDate?: number; endDate?: number; limit?: number } = {}
): Promise<ClickEvent[]> {
  const { startDate, endDate = Date.now(), limit = 100 } = options;

  // Query across month partitions
  const now = new Date(endDate);
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const events: ClickEvent[] = [];
  let currentDate = new Date(start);

  while (currentDate <= now && events.length < limit) {
    const monthKey = `${currentDate.getUTCFullYear()}-${String(currentDate.getUTCMonth() + 1).padStart(2, '0')}`;

    const result = await docClient.send(new QueryCommand({
      TableName: ANALYTICS_TABLE,
      KeyConditionExpression: 'PK = :pk AND SK BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':pk': `LINK#${linkId}#${monthKey}`,
        ':start': `TS#${start.getTime()}`,
        ':end': `TS#${endDate}`,
      },
      Limit: limit - events.length,
      ScanIndexForward: false,
    }));

    events.push(...(result.Items || []).map((item: Record<string, any>) => ({
      eventId: item.eventId,
      linkId: item.linkId,
      slug: item.slug,
      userId: item.userId,
      timestamp: item.timestamp,
      referrer: item.referrer,
      userAgent: item.userAgent,
      country: item.country,
      device: item.device,
      ipHash: item.ipHash,
    })));

    // Move to next month
    currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    currentDate.setUTCDate(1);
  }

  return events.slice(0, limit);
}

export async function getLinkAggregates(linkId: string): Promise<{
  total: number;
  daily: { date: string; clicks: number }[];
}> {
  const result = await docClient.send(new QueryCommand({
    TableName: AGGREGATES_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `LINK#${linkId}`,
      ':prefix': 'AGG#',
    },
  }));

  let total = 0;
  const daily: { date: string; clicks: number }[] = [];

  for (const item of result.Items || []) {
    if (item.SK === 'AGG#total') {
      total = item.clicks || 0;
    } else if (item.SK.startsWith('AGG#daily#')) {
      daily.push({
        date: item.SK.replace('AGG#daily#', ''),
        clicks: item.clicks || 0,
      });
    }
  }

  return { total, daily: daily.sort((a, b) => a.date.localeCompare(b.date)) };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function linkToItem(link: Link): Record<string, any> {
  return {
    id: link.id,
    userId: link.userId,
    slug: link.slug,
    longUrl: link.longUrl,
    title: link.title,
    tags: link.tags,
    notes: link.notes,
    enabled: link.enabled,
    privacyMode: link.privacyMode,
    redirectType: link.redirectType,
    expiresAt: link.expiresAt,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
    deletedAt: link.deletedAt,
    clickCount: link.clickCount,
    qrPngKey: link.qrPngKey,
    qrSvgKey: link.qrSvgKey,
    qrUpdatedAt: link.qrUpdatedAt,
  };
}

function itemToLink(item: Record<string, any>): Link | null {
  if (!item) return null;

  return {
    id: item.id,
    userId: item.userId,
    slug: item.slug,
    longUrl: item.longUrl,
    title: item.title,
    tags: item.tags,
    notes: item.notes,
    enabled: item.enabled ?? true,
    privacyMode: item.privacyMode ?? false,
    redirectType: item.redirectType ?? 302,
    expiresAt: item.expiresAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    deletedAt: item.deletedAt,
    clickCount: item.clickCount ?? 0,
    qrPngKey: item.qrPngKey,
    qrSvgKey: item.qrSvgKey,
    qrUpdatedAt: item.qrUpdatedAt,
  };
}
