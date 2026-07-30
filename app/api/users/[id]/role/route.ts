import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRoles, roleSchema } from "@/lib/auth";
import { updateUserRole } from "@/lib/userStore";

const schema = z.object({
  role: roleSchema,
});

export async function PATCH(request: Request, context: RouteContext<"/api/users/[id]/role">) {
  const session = await requireRoles(["admin"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = schema.parse(await request.json());
    const user = await updateUserRole(id, payload.role);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Gebruiker niet gevonden." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: error.issues.map((issue) => issue.message).join(" ") },
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
