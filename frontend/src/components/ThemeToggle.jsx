import { useAppContext } from "../hooks/useAppContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useAppContext();
  return (
    <button
      type="button"
      className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--text-primary)]"
      onClick={() => setTheme(theme === "royal" ? "blossom" : "royal")}
    >
      {theme === "royal" ? "Soft Blossom" : "Royal Maroon"}
    </button>
  );
}
