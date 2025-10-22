// components/Navbar.jsx
import { useState, useEffect } from "react";
import COGNITO_CONFIG from "../cognitoConfig";

const Navbar = () => {
  const [user, setUser] = useState(null);

  const {domain, clientId, redirectUri, scopes} = COGNITO_CONFIG;

  const scopeStr = scopes.join("+");

  const loginUrl = `https://${domain}/login?client_id=${clientId}&response_type=token&scope=${scopeStr}&redirect_uri=${redirectUri}`;
  const logoutUrl = `https://${domain}/logout?client_id=${clientId}&logout_uri=${redirectUri}`;

  // Parse tokens from redirect after login
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get("id_token");

    if (idToken) {
      localStorage.setItem("idToken", idToken);
      setUser({ token: idToken });
      window.location.hash = ""; // clean URL
    } else {
      const savedToken = localStorage.getItem("idToken");
      if (savedToken) setUser({ token: savedToken });
    }
  }, []);

  const handleLogin = () => window.location.href = loginUrl;
  const handleLogout = () => {
    localStorage.removeItem("idToken");
    window.location.href = logoutUrl;
  };

  return (
    <nav className="font-sans">
      <div className="flex justify-between items-center md:px-15 px-5 py-5">
        <a href="/"><img src="/logo.svg" alt="logo" /></a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* <a href="/admin">
            <button className="bg-brand-purple text-white flex items-center justify-center gap-1 text-sm font-medium px-6 py-2 rounded-4xl cursor-pointer hover:transform hover:-translate-y-0.5 shadow-lg">
              Admin Login
              <img src="/lock.svg" className="h-5 pb-1" alt="lock" />
            </button>
          </a> */}

          {user ? (
            <>
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
          <a href="/admin">
            
          </a>

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
