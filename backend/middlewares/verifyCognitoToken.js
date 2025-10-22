import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";

const region = process.env.AWS_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

/**
 * Middleware to verify Cognito token
 * Attaches decoded user info to req.user
 */
export const verifyCognitoToken = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Get Cognito public keys (used to verify JWT)
    const { data } = await axios.get(
      `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
    );

    const keys = data.keys;
    // Decode token header to find correct key ID
    const header = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString("utf8"));
    const key = keys.find(k => k.kid === header.kid);
    if (!key) throw new Error("Invalid token key");

    // Convert public key to PEM format
    const pem = jwkToPem(key);
    // Verify token
    const decoded = jwt.verify(token, pem, { algorithms: ["RS256"] });

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
