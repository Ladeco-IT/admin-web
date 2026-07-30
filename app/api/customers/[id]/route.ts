import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRoles } from "@/lib/auth";
import { deleteCustomer, updateCustomer } from "@/lib/customerStore";

const schema = z.object({
  name: z.string().trim().min(2, "Naam is verplicht."),
  email: z.string().email("E-mailadres is ongeldig."),
  phone: z.string().trim().min(6, "Telefoonnummer is verplicht."),
  address: z.string().trim().min(5, "Adres is verplicht."),
  notes: z.string().trim().optional().default(""),
});

export async function PUT(request: Request, context: RouteContext<"/api/customers/[id]">) {
  const session = await requireRoles(["admin", "manager", "sales"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = schema.parse(await request.json());
    const customer = await updateCustomer(id, payload);

    if (!customer) {
      return NextResponse.json({ ok: false, message: "Klant niet gevonden." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, customer });
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

export async function DELETE(_request: Request, context: RouteContext<"/api/customers/[id]">) {
  const session = await requireRoles(["admin", "manager"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;
  const deleted = await deleteCustomer(id);

  if (!deleted) {
    return NextResponse.json({ ok: false, message: "Klant niet gevonden." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
