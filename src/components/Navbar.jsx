import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Navbar({ isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const navigate = useNavigate();

  const applyTheme = (newTheme) => {
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowProfileMenu(false);
    navigate("/");
  };

  const handleProfileMenuClick = (path) => {
    navigate(path);
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-10">
        
        {/* Logo */}
        <Link to="/" className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
          Service Management System
        </Link>

        {/* Center Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex flex-1 justify-center gap-8">
          {["Home", "Services", "About", "Contact", "Dashboard"].map((item) => (
            <Link
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="relative px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-lg
                         hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Theme Toggle */}
          <button
            onClick={() => applyTheme(theme === "light" ? "dark" : "light")}
            className="border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400
                       p-2 rounded-lg text-lg hover:bg-blue-600 hover:text-white transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {!isLoggedIn ? (
            <Link
              to="/login"
              className="px-4 sm:px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm
                         shadow-md hover:bg-blue-700 transition whitespace-nowrap"
            >
              Login
            </Link>
          ) : (
            <div className="relative">
              {/* Profile Button */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl border-2
                           border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800
                           text-xs sm:text-sm font-bold hover:border-blue-500 hover:text-blue-600 transition"
              >
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs sm:text-sm">
                  {currentUser?.avatar}
                </div>
                <span className="hidden sm:inline">{currentUser?.name || "User"}</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-[280px] bg-white dark:bg-gray-900
                                border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">

                  {/* Header */}
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg">
                        {currentUser?.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  {[
                    { label: "View Profile", path: "/profilepage" },
                    { label: "My Activity", path: "/activity" },
                    { label: "History", path: "/history" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleProfileMenuClick(item.path)}
                      className="w-full text-left px-4 py-3 text-sm font-semibold
                                 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition"
                    >
                      {item.label}
                    </button>
                  ))}

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600
                               hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {["Home", "Services", "About", "Contact", "Dashboard"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-lg
                           hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
