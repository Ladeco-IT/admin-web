import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { fetchInvoices, fetchQuotes, createInvoice, createQuote } from "@/lib/accountable";

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

export async function POST(req: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { type, clientName, clientEmail, clientAddress } = body;

        let result;
        if (type === 'invoice') {
            result = await createInvoice({ clientName, clientEmail, clientAddress });
        } else if (type === 'quote') {
            result = await createQuote({ clientName, clientEmail, clientAddress });
        } else {
             return NextResponse.json({ ok: false, message: "Ongeldig type document." }, { status: 400 });
        }

        return NextResponse.json({
          ok: true,
          document: result
        });
    } catch (error) {
        return NextResponse.json(
          { ok: false, message: "Fout bij aanmaken document in Accountable" },
          { status: 500 }
        );
    }
}
