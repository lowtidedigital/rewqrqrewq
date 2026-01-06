// Frontend configuration - populated from environment variables
// For local dev, copy .env.example to .env.local

export const config = {
  // API URL - no /prod suffix, API Gateway uses $default stage
  apiUrl: import.meta.env.VITE_API_URL || 'https://iq0f9fazt9.execute-api.us-east-1.amazonaws.com',
  cognitoRegion: import.meta.env.VITE_COGNITO_REGION || 'us-east-1',
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_OK4RL4aI1',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '64rars8ja9q3sbgc8a12ock8fk',
  // Short domain for redirect URLs (NOT the app domain)
  shortDomain: import.meta.env.VITE_SHORT_DOMAIN || 'lh.linkharbour.io',
  // App domain for the main application
  appDomain: import.meta.env.VITE_APP_DOMAIN || 'app.linkharbour.io',
};

/**
 * Build a short URL from a slug.
 * Always uses the short domain (lh.linkharbour.io) with /r/ prefix.
 * @param slug - The link slug
 * @returns Full short URL like https://lh.linkharbour.io/r/{slug}
 */
export const buildShortUrl = (slug: string): string => {
  return `https://${config.shortDomain}/r/${slug}`;
};

/**
 * Build the app URL for the main application.
 * @param path - Optional path to append
 * @returns Full app URL like https://app.linkharbour.io{path}
 */
export const buildAppUrl = (path: string = ''): string => {
  return `https://${config.appDomain}${path}`;
};
