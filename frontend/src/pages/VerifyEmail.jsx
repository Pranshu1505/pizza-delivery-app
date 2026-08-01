import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import AuthCard from "../components/AuthCard.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState({ loading: true, error: "", message: "" });

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then(({ data }) => setStatus({ loading: false, error: "", message: data.message }))
      .catch((err) =>
        setStatus({ loading: false, error: err.response?.data?.message || "Verification failed", message: "" })
      );
  }, [token]);

  return (
    <AuthCard title="Email verification" footer={<Link to="/login" className="text-tomato font-medium">Go to login</Link>}>
      {status.loading && <p className="text-char/60 text-sm">Verifying your email…</p>}
      {status.message && <p className="text-basil bg-basil/10 rounded-lg p-4 text-sm">{status.message}</p>}
      {status.error && <p className="text-tomato bg-tomato/10 rounded-lg p-4 text-sm">{status.error}</p>}
    </AuthCard>
  );
}
