import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import AuthCard from "../components/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || "Login failed" });
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to order your next pizza"
      footer={
        <div className="space-y-1">
          <div><Link to="/forgot-password" className="text-tomato font-medium">Forgot your password?</Link></div>
          <div>New here? <Link to="/register" className="text-tomato font-medium">Create an account</Link></div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            name="email" type="email" required value={form.email} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            name="password" type="password" required value={form.password} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
            placeholder="••••••••"
          />
        </div>
        {status.error && <p className="text-tomato text-sm">{status.error}</p>}
        <button
          type="submit" disabled={status.loading}
          className="w-full bg-tomato text-cream font-semibold rounded-lg py-2.5 hover:bg-tomato/90 transition-colors disabled:opacity-60"
        >
          {status.loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}
