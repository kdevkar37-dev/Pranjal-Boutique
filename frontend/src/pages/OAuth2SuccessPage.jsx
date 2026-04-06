import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { useAppContext } from "../hooks/useAppContext";

export default function OAuth2SuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAppContext();

  useEffect(() => {
    async function finalizeLogin() {
      const token = params.get("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      sessionStorage.setItem("boutique-token", token);
      localStorage.removeItem("boutique-token");
      try {
        const profile = await getCurrentUser();
        login({ ...profile, token });
        navigate(profile.role === "ROLE_ADMIN" ? "/admin" : "/", {
          replace: true,
        });
      } catch {
        sessionStorage.removeItem("boutique-token");
        localStorage.removeItem("boutique-token");
        navigate("/login", { replace: true });
      }
    }

    finalizeLogin();
  }, [params, navigate, login]);

  return (
    <p className="text-sm text-[color:var(--text-secondary)]">
      Signing you in with Google...
    </p>
  );
}
