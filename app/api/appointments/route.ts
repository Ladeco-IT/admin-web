import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { parseAppointment } from "@/lib/appointment";
import { listAppointments, saveAppointment } from "@/lib/appointmentStore";
import { isAdminAuthenticated } from "@/lib/auth";
import { sendAppointmentConfirmation } from "@/lib/mailer";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  const appointments = await listAppointments();

  return NextResponse.json({
    ok: true,
    appointments,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Niet aangemeld." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const appointmentInput = parseAppointment(body);
    
    // Convert parsed appointment to a stored appointment object
    const appointmentObj = {
      ...appointmentInput,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "scheduled" as const,
      googleSynced: false
    };

    await saveAppointment(appointmentObj);

    await sendAppointmentConfirmation(appointmentObj);

    return NextResponse.json(
      {
        ok: true,
        message:
          "Afspraak is aangemaakt. De klant heeft een bedankmail met afspraakdetails ontvangen.",
        appointment: appointmentObj,
        icsUrl: `/api/appointments/${appointmentObj.id}/ics`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Validatie mislukt.",
          errors: error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Onbekende serverfout.",
      },
      { status: 500 }
    );
  }
}