// QR Code generation and S3 storage
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import QRCode from 'qrcode';

const s3Client = new S3Client({});
const QR_BUCKET = process.env.QR_BUCKET!;
const SHORT_DOMAIN = process.env.SHORT_DOMAIN || 's.example.com';

export interface QRAssets {
  pngKey: string;
  svgKey: string;
  pngUrl?: string;
  svgUrl?: string;
}

/**
 * Generate QR code for a short link and upload to S3
 */
export async function generateQRCode(linkId: string, slug: string): Promise<QRAssets> {
  const shortUrl = `https://${SHORT_DOMAIN}/${slug}`;
  const timestamp = Date.now();

  // Generate PNG
  const pngBuffer = await QRCode.toBuffer(shortUrl, {
    type: 'png',
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  // Generate SVG
  const svgString = await QRCode.toString(shortUrl, {
    type: 'svg',
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  const pngKey = `qr/${linkId}/${timestamp}.png`;
  const svgKey = `qr/${linkId}/${timestamp}.svg`;

  // Upload to S3
  await Promise.all([
    s3Client.send(new PutObjectCommand({
      Bucket: QR_BUCKET,
      Key: pngKey,
      Body: pngBuffer,
      ContentType: 'image/png',
      CacheControl: 'max-age=31536000', // 1 year (immutable content-addressed)
    })),
    s3Client.send(new PutObjectCommand({
      Bucket: QR_BUCKET,
      Key: svgKey,
      Body: svgString,
      ContentType: 'image/svg+xml',
      CacheControl: 'max-age=31536000',
    })),
  ]);

  return { pngKey, svgKey };
}

/**
 * Get presigned URLs for QR code downloads
 */
export async function getQRCodeUrls(pngKey: string, svgKey: string): Promise<{
  pngUrl: string;
  svgUrl: string;
}> {
  const expiresIn = 3600; // 1 hour

  const [pngUrl, svgUrl] = await Promise.all([
    getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: QR_BUCKET,
      Key: pngKey,
      ResponseContentDisposition: 'attachment; filename="qrcode.png"',
    }), { expiresIn }),
    getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: QR_BUCKET,
      Key: svgKey,
      ResponseContentDisposition: 'attachment; filename="qrcode.svg"',
    }), { expiresIn }),
  ]);

  return { pngUrl, svgUrl };
}

/**
 * Get presigned URL for QR code thumbnail (inline display)
 */
export async function getQRCodeThumbnailUrl(pngKey: string): Promise<string> {
  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: QR_BUCKET,
    Key: pngKey,
  }), { expiresIn: 3600 });
}
