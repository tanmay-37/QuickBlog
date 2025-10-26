import { CognitoUserPool } from 'amazon-cognito-identity-js';
import COGNITO_CONFIG from './cognitoConfig';

const poolData = {
  UserPoolId: COGNITO_CONFIG.userPoolId,
  ClientId: COGNITO_CONFIG.clientId,
};

const userPool = new CognitoUserPool(poolData);

/**
 * Helper function to parse a JWT token.
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Manually saves tokens from Hosted UI redirect into localStorage
 * in the format that amazon-cognito-identity-js expects.
 */
export const handleAuthRedirect = () => {
  return new Promise((resolve, reject) => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const idToken = params.get("id_token");
    const accessToken = params.get("access_token");
    // Note: Hosted UI with 'token' response_type doesn't provide a refresh token.
    // This is a limitation. For refresh tokens, you must use the 'code' response_type.

    if (idToken && accessToken) {
      const userData = parseJwt(idToken);
      if (!userData) {
        return reject(new Error("Could not parse user token."));
      }

      // Get the username from the token payload
      const username = userData['cognito:username'];
      if (!username) {
        return reject(new Error("Token is missing username."));
      }

      // Manually set the keys as the library expects
      const keyPrefix = `CognitoIdentityServiceProvider.${COGNITO_CONFIG.clientId}`;
      localStorage.setItem(`${keyPrefix}.${username}.idToken`, idToken);
      localStorage.setItem(`${keyPrefix}.${username}.accessToken`, accessToken);
      localStorage.setItem(`${keyPrefix}.LastAuthUser`, username);
      
      // Clear the hash from the URL
      window.location.hash = "";
      resolve(userData); // Return user data (like email)
    } else {
      // No tokens in hash, this is not a redirect
      resolve(null);
    }
  });
};

/**
 * Gets the current user's session from Cognito.
 * This will also refresh the token if it's expired.
 */
export const getCurrentUserSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      reject(new Error("No user found. Please log in again."));
      return;
    }
    
    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
      } else if (!session.isValid()) {
        reject(new Error("Session is invalid. Please log in again."));
      } else {
        resolve(session);
      }
    });
  });
};

/**
 * Signs the current user out.
 * This clears the tokens managed by the library from localStorage.
 */
export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};