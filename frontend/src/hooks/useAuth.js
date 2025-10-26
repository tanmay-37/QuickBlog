import { useState, useEffect } from "react";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import COGNITO_CONFIG from '../cognitoConfig.js';

const poolData = {
  UserPoolId: COGNITO_CONFIG.userPoolId,
  ClientId: COGNITO_CONFIG.clientId,
};

const userPool = new CognitoUserPool(poolData);

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- important

  useEffect(() => {
    const checkSession = () => {
      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      });
    };

    checkSession();
  }, []);

  return { isAuthenticated, isLoading };
};
