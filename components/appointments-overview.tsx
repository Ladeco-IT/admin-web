"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AppointmentRecord = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  reason: string;
  date: string;
  time: string;
  createdAt: string;
  status: "scheduled" | "completed";
  googleSynced: boolean;
  googleEventId?: string;
};

type SessionUser = {
  username: string;
  role: "admin" | "manager" | "technician" | "sales";
};

type AppointmentsOverviewProps = {
  currentUser: SessionUser;
};

function canManageUsers(role: string): boolean {
  return role === "admin" || role === "manager";
}

function canManageCustomers(role: string): boolean {
  return role === "admin" || role === "manager" || role === "sales" || role === "technician";
}

export function AppointmentsOverview({ currentUser }: AppointmentsOverviewProps) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(250,204,21,0.24),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.22),transparent_40%),linear-gradient(130deg,#fef9c3_0%,#f8fafc_40%,#ecfeff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-[0_25px_80px_-38px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-teal-700">LADECO IT ADMIN</p>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              Overzicht afspraken
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Ingelogd als <strong>{currentUser.username}</strong> ({currentUser.role})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/interne-tools"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Interne tools
            </Link>
            {canManageCustomers(currentUser.role) ? (
              <Link
                href="/klanten"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Klantenbeheer
              </Link>
            ) : null}
            {canManageUsers(currentUser.role) ? (
              <Link
                href="/team"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Accountbeheer
              </Link>
            ) : null}
            <Link
              href="/afspraak-maken"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              + Afspraak maken
            </Link>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isLoggingOut ? "Afmelden..." : "Afmelden"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="block text-slate-500">Gepland</span>
            <strong className="text-2xl text-slate-900">{scheduledCount}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="block text-slate-500">Voltooid</span>
            <strong className="text-2xl text-slate-900">{completedCount}</strong>
          </div>
        </div>

        {errorMessage && (
          <p className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errorMessage}
          </p>
        )}

        <div className="rounded-2xl bg-slate-950 p-4 md:p-6">
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
        </div>
      </section>
    </main>
  );
}
