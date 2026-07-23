import { getAppointmentById } from "@/lib/appointmentStore";
import { buildIcsContent, hydrateAppointment } from "@/lib/appointment";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/appointments/[id]/ics">
) {
  const { id } = await context.params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    return new Response("Afspraak niet gevonden.", { status: 404 });
  }

  const icsContent = buildIcsContent(hydrateAppointment(appointment));

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="afspraak-${appointment.id}.ics"`,
    },
  });
}