"use client";

import { useEffect, useState } from "react";

type InternalStats = {
  users: number;
  customers: number;
  appointments: number;
  openAppointments: number;
  completedAppointments: number;
};

type InternalTool = {
  key: string;
  title: string;
  description: string;
};

export function InternalToolsPanel() {
  const [stats, setStats] = useState<InternalStats | null>(null);
  const [tools, setTools] = useState<InternalTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOverview = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/internal-tools/overview", { cache: "no-store" });
      const payload: {
        stats?: InternalStats;
        tools?: InternalTool[];
        message?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Kon interne tools niet laden.");
      }

      setStats(payload.stats || null);
      setTools(payload.tools || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon interne tools niet laden.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Users" value={stats?.users ?? 0} />
        <StatCard label="Klanten" value={stats?.customers ?? 0} />
        <StatCard label="Afspraken" value={stats?.appointments ?? 0} />
        <StatCard label="Open" value={stats?.openAppointments ?? 0} />
        <StatCard label="Voltooid" value={stats?.completedAppointments ?? 0} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Interne hulpmiddelen</h2>
          <button
            type="button"
            onClick={loadOverview}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
          >
            Vernieuwen
          </button>
        </div>

        {errorMessage ? (
          <p className="mb-4 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-300">Interne tools laden...</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tools.map((tool) => (
              <article key={tool.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-base font-semibold text-white">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{tool.description}</p>
              </article>
            ))}

            {tools.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-4 text-sm text-slate-300">
                Er zijn nog geen interne tools gedefinieerd.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</span>
      <strong className="text-2xl text-slate-900">{value}</strong>
    </div>
  );
}
