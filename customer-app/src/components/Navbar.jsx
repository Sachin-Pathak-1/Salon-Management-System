import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({
  isLoggedIn = false,
  currentUser = null,
  setIsLoggedIn,
  setCurrentUser,
  setActiveSalon
}) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    if (typeof setIsLoggedIn === "function") setIsLoggedIn(false);
    if (typeof setCurrentUser === "function") setCurrentUser(null);
    if (typeof setActiveSalon === "function") setActiveSalon("");

    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("activeSalon");
    navigate("/");
  };

  const menuItemClass =
    "rounded-md px-3 py-2 text-sm font-semibold tracking-wide text-(--gray-700) transition hover:bg-(--hover-bg) hover:text-(--primary)";
  const textLinkClass =
    "rounded-md px-2 py-1 text-sm font-medium text-(--gray-700) transition hover:bg-(--hover-bg) hover:text-(--primary)";

  const handleCreateAppointment = () => {
    if (!isLoggedIn || currentUser?.role !== "customer") {
      navigate("/login", {
        state: { redirectTo: "/customer/appointments/new" }
      });
      return;
    }
    navigate("/customer/appointments/new");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-(--border-light) bg-(--background) text-(--text) shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur transition-colors duration-300">
      <div className="mx-auto flex h-17.5 w-full max-w-350 items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-baseline text-lg font-extrabold tracking-tight sm:text-xl"
          >
            <span className="text-(--text)">Blissful</span>
            <span className="text-(--accent)">Beauty Salon</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-(--gray-700) transition hover:bg-(--hover-bg) max-[520px]:hidden"
          >
            <span>📍</span>
            <span>Mumbai</span>
            <span>▾</span>
          </button>
        </div>

        <div className="flex-1 items-center justify-center gap-2 flex max-[520px]:hidden">
          <button type="button" onClick={() => navigate("/")} className={menuItemClass}>HOME</button>
          <button type="button" onClick={() => navigate("/salons")} className={menuItemClass}>SALONS</button>
          <button type="button" onClick={() => navigate("/spas")} className={menuItemClass}>SPAS</button>
          <button type="button" onClick={() => navigate("/offers")} className={menuItemClass}>OFFERS</button>
          <button type="button" onClick={() => navigate("/trends")} className={menuItemClass}>TRENDS</button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-(--gray-700) transition hover:bg-(--hover-bg) inline-flex max-[520px]:hidden"
          >
            🌐 EN
          </button>

          <button
            type="button"
            className="rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-white transition hover:bg-(--secondary) inline-flex max-[520px]:hidden"
            onClick={handleCreateAppointment}
          >
            📅 Appointment
          </button>

          {!isLoggedIn && (
            <button
              type="button"
              className={textLinkClass}
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          )}

          {!isLoggedIn && (
            <button
              type="button"
              className="border-2 bg-(--primary) text-white border-(--primary) rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition hover:bg-(--hover-bg) hover:text-(--primary)"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          )}

          {isLoggedIn && currentUser?.role === "customer" && (
            <button
              type="button"
              className={textLinkClass}
              onClick={() => navigate("/customer/profile")}
            >
              Profile
            </button>
          )}

          {isLoggedIn && (
            <button
              type="button"
              className="rounded-md border border-(--primary) px-3 py-2 text-sm font-semibold text-(--primary) transition hover:bg-(--primary) hover:text-(--background)"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--primary) text-base text-(--primary) transition hover:bg-(--primary) hover:text-(--background)"
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
