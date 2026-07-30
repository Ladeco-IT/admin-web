import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { fetchAddressSuggestions } from "@/lib/places";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  try {
    const suggestions = await fetchAddressSuggestions(query);
    return NextResponse.json({ ok: true, suggestions });
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
