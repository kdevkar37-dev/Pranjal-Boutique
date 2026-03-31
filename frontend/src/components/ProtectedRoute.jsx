import { Navigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

export default function ProtectedRoute({ adminOnly = false, children }) {
  const { token, user } = useAppContext();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
