// lib/accountable.ts

// Haalt de API key uit je .env of .env.local bestand
const API_KEY = process.env.ACCOUNTABLE_API_KEY;

// Opmerking: Accountable's werkelijke API url en structuur kan afwijken van hun publieke documentatie.
// Base URL als placeholder, aan te passen met de officiële Accountable API base path.
const BASE_URL = "https://api.accountable.eu/v1"; 

export async function fetchInvoices() {
  if (!API_KEY) {
    console.warn("Let op: ACCOUNTABLE_API_KEY ontbreekt in je .env.local");
    // Placeholder data totdat we de API sleutel instellen
    return [
      { id: "F2026-001", client: "Sander Peeters", amount: 150.00, status: "betaald", date: "2026-07-28" },
      { id: "F2026-002", client: "Lisa Jansen", amount: 420.50, status: "openstaand", date: "2026-07-30" }
    ];
  }

  // Dit is de call die we doen zodra we een API KEY hebben:
  /*
  const response = await fetch(`${BASE_URL}/invoices`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Fout bij ophalen van facturen uit Accountable');
  }

  const data = await response.json();
  return data;
  */

  return [];
}

export async function fetchQuotes() {
  if (!API_KEY) {
    // Placeholder offertes (quotes)
    return [
      { id: "OFF2026-001", client: "Bakkerij Smulders", amount: 1200.00, status: "geaccepteerd", date: "2026-07-25" },
      { id: "OFF2026-002", client: "Loodgieter De Vos", amount: 850.00, status: "ontwerp", date: "2026-07-29" }
    ];
  }

  // Echte call later
  return [];
}
