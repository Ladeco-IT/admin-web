"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AppointmentForm = {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  reason: string;
  date: string;
  time: string;
};

type CreatedAppointment = {
  customerName: string;
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

export function AppointmentForm() {
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdIcsUrl, setCreatedIcsUrl] = useState("");
  const [createdGoogleCalendarUrl, setCreatedGoogleCalendarUrl] = useState("");

  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const query = form.customerAddress.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places/autocomplete?query=${encodeURIComponent(query)}`, {
          cache: "no-store",
        });

        const payload: {
          suggestions?: Array<{ description?: string }>;
        } = await response.json();

        if (!response.ok) {
          setAddressSuggestions([]);
          return;
        }

        const mapped = (payload.suggestions || [])
          .map((item) => item.description || "")
          .filter((item) => item.length > 0);

        setAddressSuggestions(mapped);
      } catch {
        setAddressSuggestions([]);
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [form.customerAddress]);

  const buildGoogleCalendarUrl = (appointment: CreatedAppointment) => {
    const startDate = new Date(`${appointment.date}T${appointment.time}:00`);
    if (Number.isNaN(startDate.getTime())) {
      return "";
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatUtc = (date: Date) => {
      const y = date.getUTCFullYear().toString().padStart(4, "0");
      const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
      const d = date.getUTCDate().toString().padStart(2, "0");
      const h = date.getUTCHours().toString().padStart(2, "0");
      const min = date.getUTCMinutes().toString().padStart(2, "0");
      const s = date.getUTCSeconds().toString().padStart(2, "0");
      return `${y}${m}${d}T${h}${min}${s}Z`;
    };

    const url = new URL("https://calendar.google.com/calendar/u/0/r/eventedit");
    url.searchParams.set("text", `Afspraak - ${appointment.customerName}`);
    url.searchParams.set("details", appointment.reason);
    url.searchParams.set("location", appointment.customerAddress);
    url.searchParams.set("dates", `${formatUtc(startDate)}/${formatUtc(endDate)}`);
    return url.toString();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setCreatedIcsUrl("");
    setCreatedGoogleCalendarUrl("");
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
        icsUrl?: string;
        appointment?: CreatedAppointment;
      } = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.errors?.join(" ") || payload.message || "Er ging iets mis.");
        return;
      }

      setSuccessMessage(
        payload.message || "Afspraak is opgeslagen, klantmail is verstuurd en agenda is verwerkt."
      );
      setCreatedIcsUrl(payload.icsUrl || "");
      setCreatedGoogleCalendarUrl(
        payload.appointment ? buildGoogleCalendarUrl(payload.appointment) : ""
      );
      setForm(initialForm);
      setAddressSuggestions([]);
    } catch {
      setErrorMessage("Kan de server niet bereiken. Probeer opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(250,204,21,0.24),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.22),transparent_40%),linear-gradient(130deg,#fef9c3_0%,#f8fafc_40%,#ecfeff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-[0_25px_80px_-38px_rgba(2,6,23,0.45)] backdrop-blur-xl md:grid-cols-[1fr_1.4fr] md:p-8">
        <aside className="rounded-2xl bg-slate-900 p-6 text-slate-100 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-teal-300">LADECO IT ADMIN</p>
              <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight md:text-4xl">
                Plan een afspraak
                <br />
                voor de klant
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-300">
            Vul klantgegevens in, kies datum en uur, en laat het systeem automatisch de
            bevestiging verzenden met kalenderuitnodiging.
          </p>

          <div className="mt-8 grid gap-3 text-xs text-slate-200/90">
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              E-mailbevestiging wordt naar de klant gestuurd met reden, datum en uur.
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              De admin kan elke afspraak ook handmatig in de eigen agenda zetten via een .ics download.
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300 transition hover:text-teal-100"
            >
              ← Terug naar overzicht
            </Link>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl bg-white p-4 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Nieuwe afspraak
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Aanmaken en versturen</h2>
          </div>

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
            {addressSuggestions.length > 0 ? (
              <div className="mt-2 max-h-44 overflow-auto rounded-xl border border-slate-200 bg-slate-50">
                {addressSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, customerAddress: item }));
                      setAddressSuggestions([]);
                    }}
                    className="w-full border-b border-slate-200 px-3 py-2 text-left text-sm text-slate-700 last:border-b-0 hover:bg-slate-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Reden van afspraak
            <textarea
              required
              rows={4}
              value={form.reason}
              onChange={(event) =>
                setForm((current) => ({ ...current, reason: event.target.value }))
              }
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
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Uur
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm((current) => ({ ...current, time: event.target.value }))
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2"
              />
            </label>
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {errorMessage}
            </p>
          )}

          {successMessage ? (
            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {successMessage}
            </p>
          ) : null}

          {successMessage && createdIcsUrl ? (
            <div className="flex flex-wrap gap-2">
              <a
                href={createdIcsUrl}
                className="inline-flex items-center justify-center rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
              >
                Zet deze afspraak in agenda (.ics)
              </a>
              {createdGoogleCalendarUrl ? (
                <a
                  href={createdGoogleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                >
                  Voeg toe aan Google Agenda
                </a>
              ) : null}
            </div>
          ) : null}

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
