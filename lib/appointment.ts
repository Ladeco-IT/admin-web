import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export const appointmentSchema = z.object({
  customerName: z.string().trim().min(2, "Naam is verplicht."),
  customerEmail: z.email("E-mailadres is ongeldig.").trim(),
  customerAddress: z.string().trim().min(5, "Adres is verplicht."),
  reason: z.string().trim().min(5, "Reden is verplicht."),
  date: z.string().regex(datePattern, "Datum is ongeldig."),
  time: z.string().regex(timePattern, "Uur is ongeldig."),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export type Appointment = AppointmentInput & {
  startDate: Date;
  endDate: Date;
  timezone: string;
};

export function parseAppointment(input: unknown): Appointment {
  const parsed = appointmentSchema.parse(input);
  const startDate = new Date(`${parsed.date}T${parsed.time}:00`);

  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Datum en uur konden niet verwerkt worden.");
  }

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return {
    ...parsed,
    startDate,
    endDate,
    timezone: process.env.APPOINTMENT_TIMEZONE || "Europe/Brussels",
  };
}

function formatIcsDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildIcsContent(appointment: Appointment): string {
  const dtStamp = formatIcsDate(new Date());
  const dtStart = formatIcsDate(appointment.startDate);
  const dtEnd = formatIcsDate(appointment.endDate);
  const uid = `${Date.now()}-${appointment.customerEmail}`.replace(/\s+/g, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ladeco IT//Admin Afspraken//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${appointment.timezone}:${dtStart}`,
    `DTEND;TZID=${appointment.timezone}:${dtEnd}`,
    `SUMMARY:${escapeIcsText("Afspraak Ladeco IT")}`,
    `DESCRIPTION:${escapeIcsText(appointment.reason)}`,
    `LOCATION:${escapeIcsText(appointment.customerAddress)}`,
    `ORGANIZER;CN=Ladeco IT:mailto:${process.env.SMTP_FROM || "no-reply@ladeco-it.com"}`,
    `ATTENDEE;CN=${escapeIcsText(appointment.customerName)};RSVP=TRUE:mailto:${appointment.customerEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function formatAppointmentDateTime(appointment: Appointment): string {
  return new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: appointment.timezone,
  }).format(appointment.startDate);
}