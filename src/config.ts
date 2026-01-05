// Frontend configuration - populated from Terraform outputs
// For local dev, copy .env.example to .env.local and fill in values

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
  cognitoRegion: import.meta.env.VITE_COGNITO_REGION || 'us-east-1',
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  shortDomain: import.meta.env.VITE_SHORT_DOMAIN || 's.example.com',
};
