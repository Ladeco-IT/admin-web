import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRoles, roleSchema } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { createUser, listUsers } from "@/lib/userStore";

const createSchema = z.object({
  username: z.string().trim().min(3),
  displayName: z.string().trim().min(2),
  password: z.string().min(8),
  role: roleSchema,
});

export async function GET() {
  const session = await requireRoles(["admin", "manager"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  const users = await listUsers();

  return NextResponse.json({
    ok: true,
    users: users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireRoles(["admin", "manager"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const payload = createSchema.parse(body);

    if (session.role !== "admin" && payload.role === "admin") {
      return NextResponse.json(
        { ok: false, message: "Alleen admin kan een admin-account aanmaken." },
        { status: 403 }
      );
    }

    const user = await createUser({
      username: payload.username,
      displayName: payload.displayName,
      passwordHash: await hashPassword(payload.password),
      role: payload.role,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
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
      {
        ok: false,
        message: error instanceof Error ? error.message : "Onbekende serverfout.",
      },
      { status: 500 }
    );
  }
}
