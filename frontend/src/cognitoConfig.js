const COGNITO_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN, 
  redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  scopes: ["email", "openid", "phone"],
};

export default COGNITO_CONFIG;
