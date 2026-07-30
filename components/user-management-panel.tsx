"use client";

import { FormEvent, useEffect, useState } from "react";

type UserRecord = {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "manager" | "technician" | "sales";
  active: boolean;
  createdAt: string;
};

const roles: UserRecord["role"][] = ["admin", "manager", "technician", "sales"];

type UserManagementPanelProps = {
  currentRole: string;
};

export function UserManagementPanel({ currentRole }: UserManagementPanelProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRecord["role"]>("technician");

  const isAdmin = currentRole === "admin";

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const payload: { users?: UserRecord[]; message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Kon gebruikers niet laden.");
      }

      setUsers(payload.users || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon gebruikers niet laden.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side hydration fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, []);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          password,
          role,
        }),
      });

      const payload: { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Kon account niet aanmaken.");
      }

      setDisplayName("");
      setUsername("");
      setPassword("");
      setRole("technician");
      await loadUsers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon account niet aanmaken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (id: string, nextRole: UserRecord["role"]) => {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const payload: { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Kon rol niet aanpassen.");
      }

      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, role: nextRole } : user))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon rol niet aanpassen.");
    }
  };

  const updateActive = async (id: string, nextActive: boolean) => {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/users/${id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });

      const payload: { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Kon status niet aanpassen.");
      }

      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, active: nextActive } : user))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon status niet aanpassen.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.55fr]">
      <form onSubmit={onCreate} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Nieuw account</h2>
        <p className="mt-1 text-sm text-slate-600">Voeg een teamlid toe met passende rol.</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm text-slate-700">
            Naam
            <input
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Gebruikersnaam
            <input
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Wachtwoord
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Rol
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRecord["role"])}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            >
              {roles
                .filter((item) => isAdmin || item !== "admin")
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Aanmaken..." : "Account aanmaken"}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-white">Bestaande accounts</h2>

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-300">Accounts laden...</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{user.displayName}</h3>
                    <p className="text-sm text-slate-300">{user.username}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.active ? "bg-emerald-400/20 text-emerald-200" : "bg-slate-300/20 text-slate-200"
                    }`}
                  >
                    {user.active ? "Actief" : "Inactief"}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                    Rol
                    <select
                      value={user.role}
                      onChange={(event) => updateRole(user.id, event.target.value as UserRecord["role"])}
                      className="rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
                    >
                      {roles
                        .filter((item) => isAdmin || item !== "admin")
                        .map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                    Status
                    <select
                      value={user.active ? "active" : "inactive"}
                      onChange={(event) => updateActive(user.id, event.target.value === "active")}
                      className="rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
                    >
                      <option value="active">Actief</option>
                      <option value="inactive">Inactief</option>
                    </select>
                  </label>
                </div>
              </article>
            ))}

            {users.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-4 text-sm text-slate-300">
                Nog geen gebruikers gevonden.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
