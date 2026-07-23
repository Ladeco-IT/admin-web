"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AppointmentForm = {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  reason: string;
  date: string;
  time: string;
};

type AppointmentRecord = AppointmentForm & {
  id: string;
  createdAt: string;
  status: "scheduled" | "completed";
  googleSynced: boolean;
  googleEventId?: string;
};

const initialForm: AppointmentForm = {
  customerName: "",
  customerEmail: "",
  customerAddress: "",
  reason: "",
  date: "",
  time: "",
};

export function AdminDashboard() {
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [googleSynced, setGoogleSynced] = useState<boolean | null>(null);

  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await fetch("/api/appointments", { cache: "no-store" });
        const payload: { appointments?: AppointmentRecord[]; message?: string } =
          await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Kon afspraken niet laden.");
        }

        setAppointments(payload.appointments || []);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Kon afspraken niet laden.");
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    void loadAppointments();
  }, []);

  const formatDateTime = (appointment: AppointmentRecord) => {
    return new Intl.DateTimeFormat("nl-BE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Brussels",
    }).format(new Date(`${appointment.date}T${appointment.time}:00`));
  };

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
        appointment?: AppointmentRecord;
      } = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.errors?.join(" ") || payload.message || "Er ging iets mis.");
        return;
      }

      setSuccessMessage(
        payload.message || "Afspraak is opgeslagen, klantmail is verstuurd en agenda is verwerkt."
      );
      setGoogleSynced(payload.googleSynced ?? null);
      if (payload.appointment) {
        setAppointments((current) => [payload.appointment!, ...current]);
      }
      setForm(initialForm);
    } catch {
      setErrorMessage("Kan de server niet bereiken. Probeer opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCompleted = async (appointmentId: string, nextStatus: AppointmentRecord["status"]) => {
    setActiveAppointmentId(appointmentId);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload: { appointment?: AppointmentRecord; message?: string } = await response.json();

      if (!response.ok || !payload.appointment) {
        throw new Error(payload.message || "Kon afspraakstatus niet aanpassen.");
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? payload.appointment! : appointment
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Kon afspraakstatus niet aanpassen."
      );
    } finally {
      setActiveAppointmentId(null);
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

  const scheduledCount = appointments.filter((appointment) => appointment.status === "scheduled").length;
  const completedCount = appointments.filter((appointment) => appointment.status === "completed").length;

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(250,204,21,0.24),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.22),transparent_40%),linear-gradient(130deg,#fef9c3_0%,#f8fafc_40%,#ecfeff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <section className="mx-auto grid w-full max-w-7xl gap-8 rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-[0_25px_80px_-38px_rgba(2,6,23,0.45)] backdrop-blur-xl xl:grid-cols-[0.82fr_1.18fr] md:p-8">
        <aside className="rounded-2xl bg-slate-900 p-6 text-slate-100 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-teal-300">LADECO IT ADMIN</p>
              <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight md:text-5xl">
                Plan een afspraak
                <br />
                voor de klant
              </h1>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              {isLoggingOut ? "Afmelden..." : "Afmelden"}
            </button>
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
              Google Agenda sync gebeurt automatisch wanneer de admin agenda als Google calendar is ingesteld.
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              De admin kan elke afspraak ook handmatig in de eigen agenda zetten via een .ics download.
            </div>
          </div>
        </aside>

        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
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

          <section className="grid gap-4 rounded-2xl bg-slate-950 p-4 text-white md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                  Overzicht afspraken
                </p>
                <h2 className="mt-2 text-2xl font-bold">Beheer en opvolging</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="block text-slate-300">Gepland</span>
                  <strong className="text-2xl text-white">{scheduledCount}</strong>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="block text-slate-300">Voltooid</span>
                  <strong className="text-2xl text-white">{completedCount}</strong>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {isLoadingAppointments && (
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
                  Afspraken worden geladen...
                </p>
              )}

              {!isLoadingAppointments && appointments.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-slate-300">
                  Er zijn nog geen afspraken opgeslagen.
                </p>
              )}

              {appointments.map((appointment) => {
                const isCompleted = appointment.status === "completed";
                const isUpdating = activeAppointmentId === appointment.id;

                return (
                  <article
                    key={appointment.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/8"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {appointment.customerName}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isCompleted
                                ? "bg-emerald-400/20 text-emerald-200"
                                : "bg-amber-300/20 text-amber-100"
                            }`}
                          >
                            {isCompleted ? "Voltooid" : "Gepland"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{appointment.customerEmail}</p>
                        <p className="text-sm text-slate-400">{appointment.customerAddress}</p>
                      </div>

                      <div className="text-left text-sm text-slate-300 md:text-right">
                        <p>{formatDateTime(appointment)}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Google sync: {appointment.googleSynced ? "ja" : "nee"}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 rounded-xl bg-black/15 px-3 py-3 text-sm leading-relaxed text-slate-200">
                      {appointment.reason}
                    </p>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <a
                        href={`/api/appointments/${appointment.id}/ics`}
                        className="inline-flex items-center justify-center rounded-xl border border-teal-300/35 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-400/20"
                      >
                        Zet in eigen agenda
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          toggleCompleted(
                            appointment.id,
                            isCompleted ? "scheduled" : "completed"
                          )
                        }
                        disabled={isUpdating}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isUpdating
                          ? "Bezig..."
                          : isCompleted
                            ? "Terug als gepland zetten"
                            : "Markeer als voltooid"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}