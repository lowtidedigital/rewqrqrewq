// Frontend configuration - populated from environment variables
// For local dev, copy .env.example to .env.local

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://iq0f9fazt9.execute-api.us-east-1.amazonaws.com',
  cognitoRegion: import.meta.env.VITE_COGNITO_REGION || 'us-east-1',
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_OK4RL4aI1',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '64rars8ja9q3sbgc8a12ock8fk',
  shortDomain: import.meta.env.VITE_SHORT_DOMAIN || 'lh.linkharbour.io',
};
