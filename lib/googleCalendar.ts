import { google } from "googleapis";

import { Appointment } from "@/lib/appointment";

type SyncResult = {
  synced: boolean;
  eventId?: string;
  reason?: "missing-config";
};

function hasGoogleConfig(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID
  );
}

export async function syncGoogleAppointment(
  appointment: Appointment
): Promise<SyncResult> {
  if (!hasGoogleConfig()) {
    return {
      synced: false,
      reason: "missing-config",
    };
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  const endTime = `${String(appointment.endDate.getHours()).padStart(2, "0")}:${String(
    appointment.endDate.getMinutes()
  ).padStart(2, "0")}`;

  const created = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `Afspraak met ${appointment.customerName}`,
      description: appointment.reason,
      location: appointment.customerAddress,
      start: {
        dateTime: `${appointment.date}T${appointment.time}:00`,
        timeZone: appointment.timezone,
      },
      end: {
        dateTime: `${appointment.date}T${endTime}:00`,
        timeZone: appointment.timezone,
      },
      attendees: [{ email: appointment.customerEmail, displayName: appointment.customerName }],
    },
    sendUpdates: "all",
  });

  return {
    synced: true,
    eventId: created.data.id || undefined,
  };
}