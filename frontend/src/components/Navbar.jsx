// components/Navbar.jsx
import { useState, useEffect } from "react";
import COGNITO_CONFIG from "../cognitoConfig";

// 1. Import all new auth functions
import { getCurrentUserSession, signOut, handleAuthRedirect } from "../cognitoAuth"; 

const Navbar = () => {
  const [user, setUser] = useState(null);

  const {domain, clientId, redirectUri, scopes} = COGNITO_CONFIG;
  const scopeStr = scopes.join("+");

  const loginUrl = `https://${domain}/login?client_id=${clientId}&response_type=token&scope=${scopeStr}&redirect_uri=${redirectUri}`;
  const logoutUrl = `https://${domain}/logout?client_id=${clientId}&logout_uri=${redirectUri}`;

  // 2. This useEffect hook is now correct
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. First, check if this is a redirect from login
        // This will parse the hash and save tokens to localStorage
        const userData = await handleAuthRedirect();
        
        if (userData) {
          // We just logged in. Set user from the parsed token.
          setUser({ email: userData.email });
          console.log("User successfully logged in. Email:", userData.email);
        } else {
          // This is not a redirect. Check for an existing session.
          const session = await getCurrentUserSession();
          const userEmail = session.getIdToken().payload.email;
          setUser({ email: userEmail });
          console.log("Found existing session for:", userEmail);
        }
      } catch (error) {
        // This is normal if you are logged out
        console.log("No active user session found.", error.message);
        setUser(null);
      }
    };
    checkSession();
  }, []); // Runs once on component mount

  const handleLogin = () => window.location.href = loginUrl;

  // 3. This logout function is also correct
  const handleLogout = () => {
    signOut(); // Clears library's tokens
    setUser(null);
    window.location.href = logoutUrl;
  };

  return (
    <nav className="font-sans">
      <div className="flex justify-between items-center md:px-15 px-5 py-5">
        <a href="/"><img src="/logo.svg" alt="logo" /></a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <a 
              href="/blogs/create"
              className="bg-gray-100 px-4 py-2 rounded-2xl"
              >
              Create
              </a>
              <span className="text-sm text-gray-800 font-medium">
                {user.email} 
              </span>
              <button
                onClick={handleLogout}
                className="bg-brand-purple text-white px-4 py-2 rounded-2xl cursor-pointer hover:opacity-90"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-brand-purple text-white px-4 py-2 rounded-2xl cursor-pointer hover:opacity-90"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <button className="bg-brand-purple py-2 px-4 rounded-2xl"
            onClick={handleLogout}>
              <img src="/lock.svg" className="h-5 pb-1" alt="lock" />
            </button>
          ) : (
            <button className="bg-brand-purple py-2 px-4 rounded-2xl"
            onClick={handleLogin}>
              <img src="/locked-lock.png" className="h-5 pb-1" alt="lock" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;