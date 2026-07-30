"use client";

import { useMemo, useState } from "react";

type PcPlatform = "all" | "amd" | "intel";
type PcBrand = "amd" | "intel" | "nvidia" | "other";

type ManagedPcOption = {
  id: string;
  label: string;
  price: number;
  helper: string;
  imageUrl?: string;
  imageAlt?: string;
  brand?: PcBrand;
  platform?: PcPlatform;
  retailer?: string;
  productUrl?: string;
};

type ManagedPcGroup = {
  id: string;
  label: string;
  helper: string;
  defaultOptionId: string;
  options: ManagedPcOption[];
};

type ManagedUpgrade = {
  id: string;
  label: string;
  price: number;
  helper: string;
};

type ManagedPcCatalog = {
  updatedAt: string;
  note: string;
  groups: ManagedPcGroup[];
  upgrades: ManagedUpgrade[];
};

type PcCatalogPanelProps = {
  initialCatalog: ManagedPcCatalog;
};

export function PcCatalogPanel({ initialCatalog }: PcCatalogPanelProps) {
  const [catalog, setCatalog] = useState<ManagedPcCatalog | null>(initialCatalog);
  const [groupId, setGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCatalog() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pc-catalog", { cache: "no-store" });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        catalog?: ManagedPcCatalog;
      };

      if (!response.ok || !payload.ok || !payload.catalog) {
        throw new Error(payload.message || "Catalogus laden mislukt.");
      }

      setCatalog(payload.catalog);
      setGroupId((current) => current || payload.catalog?.groups[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Catalogus laden mislukt.");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedGroup = useMemo(() => {
    if (!catalog) {
      return null;
    }

    return catalog.groups.find((group) => group.id === groupId) || catalog.groups[0] || null;
  }, [catalog, groupId]);

  function updateCatalog(mutator: (prev: ManagedPcCatalog) => ManagedPcCatalog) {
    setCatalog((current) => {
      if (!current) {
        return current;
      }
      return mutator(current);
    });
  }

  function updateUpgrade(index: number, patch: Partial<ManagedUpgrade>) {
    updateCatalog((prev) => ({
      ...prev,
      upgrades: prev.upgrades.map((upgrade, currentIndex) =>
        currentIndex === index
          ? {
              ...upgrade,
              ...patch,
            }
          : upgrade
      ),
    }));
  }

  function addUpgrade() {
    updateCatalog((prev) => ({
      ...prev,
      upgrades: [
        ...prev.upgrades,
        {
          id: `upgrade-${Date.now()}`,
          label: "Nieuwe upgrade",
          price: 0,
          helper: "Omschrijving",
        },
      ],
    }));
  }

  function removeUpgrade(index: number) {
    updateCatalog((prev) => ({
      ...prev,
      upgrades: prev.upgrades.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateGroupField(field: "label" | "helper" | "defaultOptionId", value: string) {
    if (!selectedGroup) {
      return;
    }

    updateCatalog((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              [field]: value,
            }
          : group
      ),
    }));
  }

  function updateOption(optionId: string, patch: Partial<ManagedPcOption>) {
    if (!selectedGroup) {
      return;
    }

    updateCatalog((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              options: group.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      ...patch,
                    }
                  : option
              ),
            }
          : group
      ),
    }));
  }

  function addOption() {
    if (!selectedGroup) {
      return;
    }

    const newId = `new-option-${Date.now()}`;

    updateCatalog((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              options: [
                ...group.options,
                {
                  id: newId,
                  label: "Nieuw onderdeel",
                  price: 0,
                  helper: "Omschrijving",
                  imageUrl: "",
                  imageAlt: "",
                  brand: "other",
                  platform: "all",
                  retailer: "",
                  productUrl: "",
                },
              ],
              defaultOptionId: group.defaultOptionId || newId,
            }
          : group
      ),
    }));
  }

  function removeOption(optionId: string) {
    if (!selectedGroup) {
      return;
    }

    updateCatalog((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id !== selectedGroup.id) {
          return group;
        }

        const options = group.options.filter((option) => option.id !== optionId);
        const defaultOptionId = group.defaultOptionId === optionId
          ? (options[0]?.id || "")
          : group.defaultOptionId;

        return {
          ...group,
          options,
          defaultOptionId,
        };
      }),
    }));
  }

  async function saveCatalog() {
    if (!catalog) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/pc-catalog", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(catalog),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        catalog?: ManagedPcCatalog;
      };

      if (!response.ok || !payload.ok || !payload.catalog) {
        throw new Error(payload.message || "Opslaan mislukt.");
      }

      setCatalog(payload.catalog);
      setMessage("Catalogus opgeslagen op de server.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Opslaan mislukt.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-700">Catalogus laden...</p>;
  }

  if (!catalog || !selectedGroup) {
    return <p className="text-sm text-rose-700">Geen catalogus gevonden.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">PC Catalogus</p>
        <p className="mt-2 text-sm text-slate-700">Pas onderdelen, prijzen en productfoto-links aan. Wijzigingen worden bewaard in data/pc-catalog.json op de server.</p>

        <label className="mt-3 block text-sm font-semibold text-slate-800">
          Notitie
          <input
            value={catalog.note}
            onChange={(event) => setCatalog((current) => current ? { ...current, note: event.target.value } : current)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring-2"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {catalog.groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setGroupId(group.id)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${group.id === selectedGroup.id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Groepinstellingen</h2>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm text-slate-700">
              Groep ID
              <input value={selectedGroup.id} readOnly className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2" />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Label
              <input
                value={selectedGroup.label}
                onChange={(event) => updateGroupField("label", event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Helper tekst
              <textarea
                value={selectedGroup.helper}
                onChange={(event) => updateGroupField("helper", event.target.value)}
                rows={3}
                className="rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-slate-700">
              Standaard optie ID
              <select
                value={selectedGroup.defaultOptionId}
                onChange={(event) => updateGroupField("defaultOptionId", event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring-2"
              >
                {selectedGroup.options.map((option) => (
                  <option key={option.id} value={option.id}>{option.id}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Opties in {selectedGroup.label}</h2>
            <button
              type="button"
              onClick={addOption}
              className="rounded-lg border border-teal-300/35 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-100 hover:bg-teal-400/20"
            >
              Optie toevoegen
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {selectedGroup.options.map((option) => (
              <article key={option.id} className="rounded-2xl border border-white/15 bg-white/5 p-3">
                <div className="grid gap-2">
                  <label className="text-xs text-slate-300">ID
                    <input
                      value={option.id}
                      onChange={(event) => updateOption(option.id, { id: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <label className="text-xs text-slate-300">Label
                    <input
                      value={option.label}
                      onChange={(event) => updateOption(option.id, { label: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <label className="text-xs text-slate-300">Prijs (EUR)
                    <input
                      type="number"
                      step="0.01"
                      value={option.price}
                      onChange={(event) => updateOption(option.id, { price: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <label className="text-xs text-slate-300">Helper
                    <textarea
                      rows={2}
                      value={option.helper}
                      onChange={(event) => updateOption(option.id, { helper: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-slate-300">Merk
                      <select
                        value={option.brand || "other"}
                        onChange={(event) => updateOption(option.id, { brand: event.target.value as PcBrand })}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                      >
                        <option value="amd">AMD</option>
                        <option value="intel">Intel</option>
                        <option value="nvidia">NVIDIA</option>
                        <option value="other">Overig</option>
                      </select>
                    </label>

                    <label className="text-xs text-slate-300">Platform
                      <select
                        value={option.platform || "all"}
                        onChange={(event) => updateOption(option.id, { platform: event.target.value as PcPlatform })}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                      >
                        <option value="all">All</option>
                        <option value="amd">AMD</option>
                        <option value="intel">Intel</option>
                      </select>
                    </label>
                  </div>

                  <label className="text-xs text-slate-300">Afbeelding URL (liefst productfoto)
                    <input
                      value={option.imageUrl || ""}
                      onChange={(event) => updateOption(option.id, { imageUrl: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <label className="text-xs text-slate-300">Afbeelding alt
                    <input
                      value={option.imageAlt || ""}
                      onChange={(event) => updateOption(option.id, { imageAlt: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <label className="text-xs text-slate-300">Retailer
                    <input
                      value={option.retailer || ""}
                      onChange={(event) => updateOption(option.id, { retailer: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>

                  <label className="text-xs text-slate-300">Product URL
                    <input
                      value={option.productUrl || ""}
                      onChange={(event) => updateOption(option.id, { productUrl: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-slate-100"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="mt-3 rounded-lg border border-rose-300/35 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20"
                >
                  Verwijderen
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveCatalog}
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Opslaan..." : "Catalogus opslaan"}
        </button>
        <button
          type="button"
          onClick={() => void loadCatalog()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Herladen
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Extra upgrades</h2>
          <button
            type="button"
            onClick={addUpgrade}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Upgrade toevoegen
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {catalog.upgrades.map((upgrade, index) => (
            <article key={`${upgrade.id}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <label className="text-xs text-slate-700">ID
                  <input
                    value={upgrade.id}
                    onChange={(event) => updateUpgrade(index, { id: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-700">Label
                  <input
                    value={upgrade.label}
                    onChange={(event) => updateUpgrade(index, { label: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-700">Prijs (EUR)
                  <input
                    type="number"
                    step="0.01"
                    value={upgrade.price}
                    onChange={(event) => updateUpgrade(index, { price: Number(event.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-700">Helper
                  <input
                    value={upgrade.helper}
                    onChange={(event) => updateUpgrade(index, { helper: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeUpgrade(index)}
                className="mt-3 rounded-lg border border-rose-300/50 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-200"
              >
                Verwijderen
              </button>
            </article>
          ))}
        </div>
      </section>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <details className="rounded-2xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">JSON preview</summary>
        <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(catalog, null, 2)}</pre>
      </details>
    </div>
  );
}
