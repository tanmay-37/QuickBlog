import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import COGNITO_CONFIG from "../cognitoConfig";
import {
  getCurrentUserSession,
  signOut,
  handleAuthRedirect
} from "../cognitoAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const {domain, clientId, redirectUri, scopes} = COGNITO_CONFIG;
  const scopeStr = scopes.join("+");
  const loginUrl = `https://${domain}/login?client_id=${clientId}&response_type=token&scope=${scopeStr}&redirect_uri=${redirectUri}`;
  const logoutUrl = `https://${domain}/logout?client_id=${clientId}&logout_uri=${redirectUri}`;

  // Effect to check the user's session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await handleAuthRedirect();
        if (userData) {
          setUser({ email: userData.email, name: userData.name || userData.nickname || 'User' });
        } else {
          const session = await getCurrentUserSession();
          const payload = session.getIdToken().payload;
          setUser({ email: payload.email, name: payload.name || payload.nickname || 'User' });
        }
      } catch (error) {
        setUser(null);
      }
    };
    checkSession();
  }, []);

  // Effect to close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    setIsProfileOpen(false);
    window.location.href = logoutUrl;
  };

  const handleCreateBlog = () => {
    navigate('/blogs/create');
  };

  return (
    // ✨ Updated Navbar Style: Glass effect with purple tint ✨
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg border-b border-purple-200/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo (Ensure your logo looks good on the lighter background) */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <img src="/logo.svg" alt="logo" className="h-8 w-auto" />
            </a>
          </div>

          {/* Auth Section */}
          <div className="ml-4 flex items-center space-x-4">

            {/* ✨ Create Blog Button: Purple Glass Style ✨ */}
            {user && (
              <button
                onClick={handleCreateBlog}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                             bg-indigo-600/80 backdrop-blur-sm border border-indigo-400/50 text-white
                             rounded-lg shadow-md hover:bg-indigo-700/90 transition-all
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Blog
              </button>
            )}

            {user ? (
              // --- Logged-in state ---
              <div className="relative" ref={profileMenuRef}>
                {/* ✨ Profile Icon Button: Subtle Glass Style ✨ */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-9 w-9 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full text-gray-600 border border-gray-300/50 shadow-sm hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all"
                  id="user-menu-button"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* ✨ Dropdown Menu: Glass Style ✨ */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 origin-top-right bg-white/80 backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-black/5 border border-white/30 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-1" role="none">
                        {/* Header within Dropdown */}
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>

                        {/* My Blogs Link - Adjusted hover */}
                      <button
                        onClick={() => {
                          navigate('/my-blogs');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-100/50 hover:text-gray-900 transition-colors"
                        role="menuitem"
                    >
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        My Blogs
                    </button>

                        {/* Logout Button - Adjusted hover */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-100/50 hover:text-gray-900 transition-colors"
                        role="menuitem"
                    >
                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
                // ✨ Login Button: Gray Glass Style ✨
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium
                             bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-white
                             rounded-lg shadow-md hover:bg-gray-900/90 transition-all
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;