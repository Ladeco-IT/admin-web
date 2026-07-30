"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export function CustomerManagementPanel() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const loadCustomers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/customers", { cache: "no-store" });
      const payload: { customers?: CustomerRecord[]; message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Kon klanten niet laden.");
      }

      setCustomers(payload.customers || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon klanten niet laden.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side hydration fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCustomers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload: { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Kon klant niet opslaan.");
      }

      resetForm();
      await loadCustomers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon klant niet opslaan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEdit = (customer: CustomerRecord) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
    });
  };

  const onDelete = async (customer: CustomerRecord) => {
    const confirmed = window.confirm(`Wil je ${customer.name} verwijderen?`);
    if (!confirmed) return;

    setErrorMessage("");

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });

      const payload: { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Kon klant niet verwijderen.");
      }

      await loadCustomers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Kon klant niet verwijderen.");
    }
  };

  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;

    return customers.filter((customer) => {
      const candidate = `${customer.name} ${customer.email} ${customer.phone} ${customer.address}`.toLowerCase();
      return candidate.includes(needle);
    });
  }, [customers, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.55fr]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Klant bewerken" : "Nieuwe klant"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">Beheer je klantenbestand en interne notities.</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm text-slate-700">
            Naam
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Telefoon
            <input
              required
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Adres
            <input
              required
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Notities
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 transition focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Opslaan..." : editingId ? "Wijzigingen opslaan" : "Klant aanmaken"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Annuleren
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Klantenbestand</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek klant"
            className="w-56 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-teal-400 transition focus:ring-2"
          />
        </div>

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-300">Klanten laden...</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {filteredCustomers.map((customer) => (
              <article key={customer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{customer.name}</h3>
                    <p className="text-sm text-slate-300">{customer.email}</p>
                    <p className="text-sm text-slate-400">{customer.phone}</p>
                    <p className="text-sm text-slate-400">{customer.address}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(customer)}
                      className="rounded-lg border border-teal-300/35 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-100 transition hover:bg-teal-400/20"
                    >
                      Bewerken
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(customer)}
                      className="rounded-lg border border-rose-300/35 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>

                {customer.notes ? (
                  <p className="mt-3 rounded-lg bg-black/15 px-3 py-2 text-sm text-slate-200">{customer.notes}</p>
                ) : null}
              </article>
            ))}

            {filteredCustomers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-4 text-sm text-slate-300">
                Geen klanten gevonden.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
