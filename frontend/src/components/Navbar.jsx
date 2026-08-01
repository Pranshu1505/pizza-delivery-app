import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? "/admin/login" : "/login");
  };

  return (
    <header className="border-b border-crust/40 bg-char/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="font-display text-xl font-bold text-cream tracking-tight">
          🍕 Pizza <span className="text-tomato">Palace</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-cream/70">
              {isAdmin ? "Admin" : user.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-1.5 rounded-md border border-crust/50 text-cream/80 hover:text-cream hover:border-tomato transition-colors focus-ring"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
