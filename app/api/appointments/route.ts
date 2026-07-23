import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { parseAppointment } from "@/lib/appointment";
import { syncGoogleAppointment } from "@/lib/googleCalendar";
import { sendAppointmentConfirmation } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appointment = parseAppointment(body);

    const googleResult = await syncGoogleAppointment(appointment);
    await sendAppointmentConfirmation(appointment);

    return NextResponse.json(
      {
        ok: true,
        message:
          "Afspraak is aangemaakt. De klant heeft een bedankmail met afspraakdetails ontvangen.",
        googleSynced: googleResult.synced,
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