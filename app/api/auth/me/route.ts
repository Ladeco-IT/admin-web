import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Niet aangemeld.",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      username: user.username,
      role: user.role,
    },
  });
}
