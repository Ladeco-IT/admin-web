import { NextResponse } from "next/server";

import { requireRoles } from "@/lib/auth";
import { buildInternalOverview } from "@/lib/internalTools";

export async function GET() {
  const session = await requireRoles(["admin", "manager", "sales", "technician"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  try {
    const overview = await buildInternalOverview();
    return NextResponse.json(overview);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Onbekende serverfout.",
      },
      { status: 500 }
    );
  }
}
