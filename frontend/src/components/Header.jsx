import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { logout } from "../api/authApi";

const links = [
  { to: "/", label: "Home" },
  { to: "/rental", label: "Rental" },
  { to: "/gallery", label: "Gallery" },
  { to: "/classes", label: "Classes" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user, logout: contextLogout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileInitial = (user?.name || "U").trim().charAt(0).toUpperCase();
  const isAdminPage = location.pathname === "/admin";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    // Call logout API first so the current access token can be revoked server-side.
    try {
      await logout();
    } catch {
      // Ignore network failures and continue with local logout.
    }

    contextLogout();
    navigate("/", { replace: true });
  }

  function handleBrandClick() {
    // Navigate to admin dashboard if user is admin, otherwise go to home
    if (user?.role === "ROLE_ADMIN") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#3a3a3a] bg-[#0a0a0a]/95 backdrop-blur">
      <nav className="flex w-full items-center justify-between gap-4 pl-4 pr-2 py-3 md:pr-4">
        <button
          onClick={handleBrandClick}
          className="flex items-center gap-3 text-xl font-bold tracking-[0.15em] text-[#d4af37] transition hover:text-[#e8c458] cursor-pointer bg-none border-none p-0"
        >
          <img
            src="/owner-pranjal.png"
            alt="Pranjal Boutique Logo"
            className="h-8 w-8 rounded-full border border-[#d4af37] object-cover"
          />
          <span>PRANJAL'S</span>
        </button>

        <div className="ml-auto flex items-center gap-6 md:gap-8">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#3a3a3a] text-[#d4af37] transition hover:border-[#d4af37] md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="text-lg leading-none">
              {isMobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>

          <div className="hidden items-center gap-8 text-sm font-semibold text-gray-300 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `transition hover:text-[#d4af37] ${isActive ? "text-[#d4af37]" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {user && (
              <button
                onClick={() =>
                  user?.role === "ROLE_ADMIN" && navigate("/admin")
                }
                className="hidden items-center gap-2 rounded-full border border-[#3a3a3a] bg-[#111111] px-3 py-1.5 md:flex transition hover:border-[#d4af37] hover:bg-[#1a1a1a] cursor-pointer"
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="User profile"
                    className="h-7 w-7 rounded-full border border-[#d4af37] object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-black">
                    {profileInitial}
                  </span>
                )}
                <span className="max-w-[100px] truncate text-xs font-medium text-gray-300">
                  {user?.name}
                </span>
              </button>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-500 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Logout
              </button>
            ) : isAdminPage ? (
              <NavLink
                to="/login"
                className="rounded-full border border-[#d4af37] px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
              >
                Login
              </NavLink>
            ) : null}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#d4af37]/15 text-[#d4af37]"
                      : "text-gray-200 hover:bg-[#1a1a1a] hover:text-[#d4af37]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
