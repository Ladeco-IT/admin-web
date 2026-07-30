import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/auth";
import { appointmentSchema } from "@/lib/appointment";
import { deleteAppointment, updateAppointment, updateAppointmentStatus } from "@/lib/appointmentStore";

const statusSchema = z.object({
  status: z.enum(["scheduled", "completed"]),
});

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/appointments/[id]">
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status } = statusSchema.parse(body);
    const appointment = await updateAppointmentStatus(id, status);

    if (!appointment) {
      return NextResponse.json(
        {
          ok: false,
          message: "Afspraak niet gevonden.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ongeldige status.",
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

export async function PUT(
  request: Request,
  context: RouteContext<"/api/appointments/[id]">
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payload = appointmentSchema.parse(await request.json());
    const appointment = await updateAppointment(id, payload);

    if (!appointment) {
      return NextResponse.json(
        {
          ok: false,
          message: "Afspraak niet gevonden.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Validatie mislukt.",
          errors: error.issues.map((issue) => issue.message),
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

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/appointments/[id]">
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteAppointment(id);

  if (!deleted) {
    return NextResponse.json(
      {
        ok: false,
        message: "Afspraak niet gevonden.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}