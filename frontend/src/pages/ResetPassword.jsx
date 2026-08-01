import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import AuthCard from "../components/AuthCard.jsx";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setStatus({ loading: false, error: "", success: data.message });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || "Reset failed", success: "" });
    }
  };

  return (
    <AuthCard
      title="Set a new password"
      footer={<>Back to <Link to="/login" className="text-tomato font-medium">login</Link></>}
    >
      {status.success ? (
        <p className="text-basil bg-basil/10 rounded-lg p-4 text-sm">{status.success} Redirecting to login…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
              placeholder="At least 6 characters"
            />
          </div>
          {status.error && <p className="text-tomato text-sm">{status.error}</p>}
          <button
            type="submit" disabled={status.loading}
            className="w-full bg-tomato text-cream font-semibold rounded-lg py-2.5 hover:bg-tomato/90 transition-colors disabled:opacity-60"
          >
            {status.loading ? "Saving..." : "Save new password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
