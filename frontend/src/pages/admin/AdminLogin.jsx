import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import AuthCard from "../../components/AuthCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const { data } = await api.post("/auth/admin-login", form);
      login(data.token, data.user);
      navigate("/admin");
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || "Login failed" });
    }
  };

  return (
    <AuthCard title="Admin sign in" subtitle="Restricted to Pizza Palace staff">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Admin email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
          />
        </div>
        {status.error && <p className="text-tomato text-sm">{status.error}</p>}
        <button
          type="submit" disabled={status.loading}
          className="w-full bg-crust text-cream font-semibold rounded-lg py-2.5 hover:bg-crust/90 transition-colors disabled:opacity-60"
        >
          {status.loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
