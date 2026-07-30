import Link from "next/link";

type AdminShellProps = {
  title: string;
  subtitle?: string;
  username: string;
  role: string;
  children: React.ReactNode;
};

function canManageUsers(role: string): boolean {
  return role === "admin" || role === "manager";
}

function canManageCustomers(role: string): boolean {
  return role === "admin" || role === "manager" || role === "sales" || role === "technician";
}

export function AdminShell({ title, subtitle, username, role, children }: AdminShellProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-6 py-10 md:px-12">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(250,204,21,0.24),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.22),transparent_40%),linear-gradient(130deg,#fef9c3_0%,#f8fafc_40%,#ecfeff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-900/10 bg-white/75 p-5 shadow-[0_25px_80px_-38px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-teal-700">LADECO IT ADMIN</p>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-700">{subtitle}</p> : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            Ingelogd als <strong>{username}</strong> ({role})
          </div>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Afspraken
          </Link>
          <Link
            href="/afspraak-maken"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Nieuwe afspraak
          </Link>
          {canManageCustomers(role) ? (
            <Link
              href="/klanten"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Klantenbeheer
            </Link>
          ) : null}
          {canManageUsers(role) ? (
            <Link
              href="/team"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Accountbeheer
            </Link>
          ) : null}
          <Link
            href="/interne-tools"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Interne tools
          </Link>
        </nav>

        {children}
      </section>
    </main>
  );
}
