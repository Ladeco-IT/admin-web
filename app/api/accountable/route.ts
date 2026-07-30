import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { fetchInvoices, fetchQuotes } from "@/lib/accountable";

export async function GET() {
  // We controleren eerst of de admin nog netjes ingelogd is
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  try {
    const invoices = await fetchInvoices();
    const quotes = await fetchQuotes();

    return NextResponse.json({
      ok: true,
      invoices,
      quotes
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Fout met ophalen uit Accountable" },
      { status: 500 }
    );
  }
}
