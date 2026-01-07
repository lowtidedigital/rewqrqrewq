// Type stubs to prevent frontend TypeScript errors when root tsconfig includes backend folder
// The actual types are installed via backend/package.json and used during Lambda deployment

declare module 'aws-lambda' {
  export interface APIGatewayProxyEventV2 {
    rawPath: string;
    pathParameters?: Record<string, string | undefined>;
    queryStringParameters?: Record<string, string | undefined>;
    headers: Record<string, string | undefined>;
    body?: string;
    isBase64Encoded?: boolean;
    requestContext: {
      requestId?: string;
      http: {
        method: string;
        path: string;
        protocol: string;
        sourceIp: string;
        userAgent: string;
      };
      authorizer?: {
        jwt?: {
          claims?: Record<string, any>;
        };
      };
    };
  }

  export interface APIGatewayProxyEventHeaders {
    [key: string]: string | undefined;
  }

  export interface APIGatewayProxyResultV2 {
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
  }

  export type APIGatewayProxyHandlerV2 = (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>;
}

declare module '@aws-sdk/client-dynamodb' {
  export class DynamoDBClient {
    constructor(config?: any);
  }
}

declare module '@aws-sdk/lib-dynamodb' {
  export class DynamoDBDocumentClient {
    static from(client: any, options?: any): DynamoDBDocumentClient;
    send(command: any): Promise<any>;
  }
  export class GetCommand {
    constructor(input: any);
  }
  export class PutCommand {
    constructor(input: any);
  }
  export class UpdateCommand {
    constructor(input: any);
  }
  export class QueryCommand {
    constructor(input: any);
  }
  export class DeleteCommand {
    constructor(input: any);
  }
  export class TransactWriteCommand {
    constructor(input: any);
  }
}

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config?: any);
    send(command: any): Promise<any>;
  }
  export class GetObjectCommand {
    constructor(input: any);
  }
  export class PutObjectCommand {
    constructor(input: any);
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: any, command: any, options?: any): Promise<string>;
}

declare module 'uuid' {
  export function v4(): string;
}

declare module 'qrcode' {
  export function toBuffer(text: string, options?: any): Promise<Buffer>;
  export function toString(text: string, options?: any): Promise<string>;
}
