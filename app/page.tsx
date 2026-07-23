
"use client";

import { FormEvent, useMemo, useState } from "react";

type AppointmentForm = {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  reason: string;
  date: string;
  time: string;
};

const initialForm: AppointmentForm = {
  customerName: "",
  customerEmail: "",
  customerAddress: "",
  reason: "",
  date: "",
  time: "",
};

export default function Home() {
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [googleSynced, setGoogleSynced] = useState<boolean | null>(null);

  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleSynced(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload: {
        message?: string;
        errors?: string[];
        googleSynced?: boolean;
      } = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.errors?.join(" ") || payload.message || "Er ging iets mis.");
        return;
      }

      setSuccessMessage(
        payload.message || "Afspraak is opgeslagen, klantmail is verstuurd en agenda is verwerkt."
      );
      setGoogleSynced(payload.googleSynced ?? null);
      setForm(initialForm);
    } catch {
      setErrorMessage("Kan de server niet bereiken. Probeer opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(250,204,21,0.24),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.22),transparent_40%),linear-gradient(130deg,#fef9c3_0%,#f8fafc_40%,#ecfeff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-[0_25px_80px_-38px_rgba(2,6,23,0.45)] backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr] md:p-8">
        <aside className="rounded-2xl bg-slate-900 p-6 text-slate-100 md:p-8">
          <p className="text-xs font-semibold tracking-[0.28em] text-teal-300">LADECO IT ADMIN</p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight md:text-5xl">
            Plan een afspraak
            <br />
            voor de klant
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-300">
            Vul klantgegevens in, kies datum en uur, en laat het systeem automatisch de
            bevestiging verzenden met kalenderuitnodiging.
          </p>

          <div className="mt-8 grid gap-3 text-xs text-slate-200/90">
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              E-mailbevestiging wordt naar de klant gestuurd met reden, datum en uur.
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              Google Agenda sync gebeurt automatisch wanneer service credentials zijn ingesteld.
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              Apple Agenda kan direct importeren via de .ics uitnodiging uit de mail.
            </div>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl bg-white p-4 md:p-6">
          <label className="grid gap-1 text-sm text-slate-700">
            Naam klant
            <input
              required
              value={form.customerName}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerName: event.target.value }))
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              placeholder="Bijv. Jan Peeters"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            E-mailadres
            <input
              required
              type="email"
              value={form.customerEmail}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerEmail: event.target.value }))
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              placeholder="naam@domein.be"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Adres
            <input
              required
              value={form.customerAddress}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerAddress: event.target.value }))
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              placeholder="Straat + nummer, postcode + gemeente"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Reden van afspraak
            <textarea
              required
              rows={4}
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              placeholder="Bijv. netwerkcontrole en migratie mailbox"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-slate-700">
              Datum
              <input
                required
                type="date"
                min={minDate}
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Uur
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              />
            </label>
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {successMessage}
              {googleSynced === false && (
                <span className="block pt-1 text-emerald-700">
                  Google sync is overgeslagen omdat de credentials niet volledig zijn ingesteld.
                </span>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting ? "Bezig met plannen..." : "Afspraak aanmaken"}
          </button>
        </form>
      </section>
    </main>
  );
}
