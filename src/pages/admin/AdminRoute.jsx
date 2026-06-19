// src/pages/admin/AdminRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for auth restore

  if (!user) {
    return <Navigate to="/demo" replace />;
  }

  if (user.role !== "ROLE_ADMIN") {
    return <Navigate to="/demo" replace />;
  }

  return children;
};

export default AdminRoute;
