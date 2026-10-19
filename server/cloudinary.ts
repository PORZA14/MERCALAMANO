import crypto from 'crypto';

const ROOT_FOLDER = 'mercalamano';
const ALLOWED_FOLDERS = ['avatars', 'featured-members', 'videos', 'documents', 'general'] as const;
export type CloudinaryFolder = (typeof ALLOWED_FOLDERS)[number];

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

/**
 * Creates a short-lived signature so the browser can upload directly to Cloudinary
 * (avoids the serverless request body limit for large videos/documents) without
 * ever exposing the API secret.
 */
export function createUploadSignature(folder: string) {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const safeFolder: CloudinaryFolder = (ALLOWED_FOLDERS as readonly string[]).includes(folder)
    ? (folder as CloudinaryFolder)
    : 'general';

  const params = {
    folder: `${ROOT_FOLDER}/${safeFolder}`,
    timestamp: Math.floor(Date.now() / 1000),
  };

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder: params.folder,
    timestamp: params.timestamp,
    signature: sign(params, config.apiSecret),
  };
}
