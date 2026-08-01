import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import AuthCard from "../components/AuthCard.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: "" });
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setStatus({ loading: false, message: data.message, error: "" });
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.response?.data?.message || "Request failed" });
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to set a new password"
      footer={<>Remembered it? <Link to="/login" className="text-tomato font-medium">Back to login</Link></>}
    >
      {status.message ? (
        <p className="text-basil bg-basil/10 rounded-lg p-4 text-sm">{status.message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 focus-ring outline-none"
              placeholder="you@example.com"
            />
          </div>
          {status.error && <p className="text-tomato text-sm">{status.error}</p>}
          <button
            type="submit" disabled={status.loading}
            className="w-full bg-tomato text-cream font-semibold rounded-lg py-2.5 hover:bg-tomato/90 transition-colors disabled:opacity-60"
          >
            {status.loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
