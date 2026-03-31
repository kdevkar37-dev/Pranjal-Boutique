import { NavLink } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/classes", label: "Classes" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user } = useAppContext();
  const profileInitial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#3a3a3a] bg-[#0a0a0a]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <NavLink to="/" className="text-xl font-bold tracking-[0.15em] text-[#d4af37]">
          PRANJAL'S
        </NavLink>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-300 md:flex">
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
          <div className="hidden items-center gap-2 rounded-full border border-[#3a3a3a] bg-[#111111] px-3 py-1.5 md:flex">
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
              {user?.name || "Guest"}
            </span>
          </div>

          <NavLink
            to="/login"
            className="rounded-full border border-[#d4af37] px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            Login
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
