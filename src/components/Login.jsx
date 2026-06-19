import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (!userData || !userData.role) {
        setError("Login succeeded but role is missing in token.");
        return;
      }

      // Role-based secure navigation
      switch (userData.role) {
        case "ROLE_ADMIN":
          navigate("/admin/dashboard");
          break;
        case "ROLE_TEACHER":
          navigate("/teacher/dashboard");
          break;
        case "ROLE_STUDENT":
          navigate("/student/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
        
        <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm dark:text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm dark:text-gray-300">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow mt-3 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
