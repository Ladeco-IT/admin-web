"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload: { message?: string } = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.message || "Aanmelden mislukt.");
        return;
      }

      window.location.href = "/";
    } catch {
      setErrorMessage("Kan de server niet bereiken. Probeer opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-slate-900/10 bg-white/85 p-6 shadow-[0_25px_80px_-38px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Ladeco IT Admin</p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-slate-900">
          Aanmelden
        </h1>
      </div>

      <label className="grid gap-1 text-sm text-slate-700">
        Gebruikersnaam
        <input
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
        />
      </label>

      <label className="grid gap-1 text-sm text-slate-700">
        Wachtwoord
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
        />
      </label>

      {errorMessage && (
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting ? "Aanmelden..." : "Inloggen"}
      </button>
    </form>
  );
}