import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRoles } from "@/lib/auth";
import { createCustomer, listCustomers } from "@/lib/customerStore";

const schema = z.object({
  name: z.string().trim().min(2, "Naam is verplicht."),
  email: z.string().email("E-mailadres is ongeldig."),
  phone: z.string().trim().min(6, "Telefoonnummer is verplicht."),
  address: z.string().trim().min(5, "Adres is verplicht."),
  notes: z.string().trim().optional().default(""),
});

export async function GET() {
  const session = await requireRoles(["admin", "manager", "sales", "technician"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  const customers = await listCustomers();
  return NextResponse.json({ ok: true, customers });
}

export async function POST(request: Request) {
  const session = await requireRoles(["admin", "manager", "sales"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  try {
    const payload = schema.parse(await request.json());
    const customer = await createCustomer(payload);

    return NextResponse.json({ ok: true, customer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.issues.map((issue) => issue.message).join(" "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Onbekende serverfout." },
      { status: 500 }
    );
  }
}
