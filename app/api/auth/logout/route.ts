import { NextResponse } from "next/server";

import { getSessionCookieSettings } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    ...getSessionCookieSettings(),
    value: "",
    maxAge: 0,
  });

  return response;
}