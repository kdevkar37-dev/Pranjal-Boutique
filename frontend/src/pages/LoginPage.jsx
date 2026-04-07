import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api/authApi";
import { useAppContext } from "../hooks/useAppContext";
import PageTransition from "../components/PageTransition";
import StatusToast from "../components/StatusToast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAppContext();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");

  // Reset form when mode changes
  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
  }, [mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Please wait...");

    try {
      const payload =
        mode === "register"
          ? await register({
              name: form.name,
              email: form.email,
              password: form.password,
            })
          : await login({ email: form.email, password: form.password });
      setAuth(payload);
      setForm({ name: "", email: "", password: "" }); // Clear form after successful login
      setStatus("Authenticated successfully.");
      navigate(payload.role === "ROLE_ADMIN" ? "/admin" : "/");
    } catch (err) {
      setStatus(err.response?.data?.error || "Authentication failed");
      // Keep form data for retry
    }
  }

  return (
    <PageTransition>
      <StatusToast message={status} onClose={() => setStatus("")} />
      <section className="mx-auto max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <h2 className="font-heading text-4xl">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === "register" && (
            <input
              className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-contrast)]"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
          <button
            type="button"
            className="ml-3 text-sm text-[color:var(--text-secondary)]"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login"
              ? "Need an account? Register"
              : "Already registered? Login"}
          </button>
        </form>
      </section>
    </PageTransition>
  );
}
