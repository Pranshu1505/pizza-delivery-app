import React from "react";
import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-char">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-display text-2xl font-bold mb-8">
          🍕 Pizza <span className="text-tomato">Palace</span>
        </Link>
        <div className="bg-cream text-char rounded-2xl shadow-2xl p-8">
          <h1 className="font-display text-2xl font-bold mb-1">{title}</h1>
          {subtitle && <p className="text-char/60 text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="text-center mt-6 text-sm text-cream/70">{footer}</div>}
      </div>
    </div>
  );
}
