import { createContext, useEffect, useMemo, useState } from "react";

export const AppContext = createContext(null);

const THEME_KEY = "boutique-theme";
const TOKEN_KEY = "boutique-token";
const USER_KEY = "boutique-user";
const LANGUAGE_KEY = "boutique-language";

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem(THEME_KEY) || "royal",
  );
  const [token, setToken] = useState(
    sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "",
  );
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [language, setLanguage] = useState(
    localStorage.getItem(LANGUAGE_KEY) || "en",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    const handleLogout = () => {
      setToken("");
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      language,
      setLanguage,
      token,
      user,
      login: (authPayload) => {
        setToken(authPayload.token || "");
        setUser({
          id: authPayload.userId,
          name: authPayload.name,
          email: authPayload.email,
          role: authPayload.role,
          profilePic: authPayload.profilePic,
        });
      },
      logout: () => {
        setToken("");
        setUser(null);
      },
    }),
    [theme, language, token, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
