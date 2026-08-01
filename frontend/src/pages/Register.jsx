import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import AuthCard from "../components/AuthCard.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });
    try {
      const { data } = await api.post("/auth/register", form);
      setStatus({ loading: false, error: "", success: data.message });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || "Registration failed", success: "" });
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join Pizza Palace to start ordering"
      footer={<>Already have an account? <Link to="/login" className="text-tomato font-medium">Log in</Link></>}
    >
      {status.success ? (
        <p className="text-basil bg-basil/10 rounded-lg p-4 text-sm">{status.success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              name="name" required value={form.name} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
              placeholder="Alex Rivera"
            />
          </div>
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
              name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
              placeholder="At least 6 characters"
            />
          </div>
          {status.error && <p className="text-tomato text-sm">{status.error}</p>}
          <button
            type="submit" disabled={status.loading}
            className="w-full bg-tomato text-cream font-semibold rounded-lg py-2.5 hover:bg-tomato/90 transition-colors disabled:opacity-60"
          >
            {status.loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
