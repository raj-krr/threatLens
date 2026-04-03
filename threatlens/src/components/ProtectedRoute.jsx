import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const projectId = localStorage.getItem("projectId");

  if (!projectId) {
    console.log("No projectId → redirecting ❌");
    return <Navigate to="/" />;
  }

  return children;
}