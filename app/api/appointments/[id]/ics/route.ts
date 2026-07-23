import { getAppointmentById } from "@/lib/appointmentStore";
import { buildIcsContent, hydrateAppointment } from "@/lib/appointment";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/appointments/[id]/ics">
) {
  if (!(await isAdminAuthenticated())) {
    return new Response("Niet aangemeld.", { status: 401 });
  }

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