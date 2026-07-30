import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createSessionToken,
  getSessionCookieSettings,
  isValidCredentials,
  loginSchema,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const validation = await isValidCredentials(username, password);

    if (!validation.ok || !validation.role) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ongeldige logingegevens.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        username,
        role: validation.role,
      },
    });
    response.cookies.set({
      ...getSessionCookieSettings(),
      value: createSessionToken({
        username,
        role: validation.role,
      }),
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.issues.map((issue) => issue.message).join(" "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Onbekende serverfout.",
      },
      { status: 500 }
    );
  }
}