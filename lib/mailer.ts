import nodemailer from "nodemailer";

import {
  Appointment,
  buildIcsContent,
  formatAppointmentDateTime,
} from "@/lib/appointment";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP configuratie ontbreekt.");
  }

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    }),
  };
}

export async function sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
  const { from, transporter } = getTransporter();
  const appointmentDateTime = formatAppointmentDateTime(appointment);
  const icsContent = buildIcsContent(appointment);

  await transporter.sendMail({
    from,
    to: appointment.customerEmail,
    subject: "Bevestiging afspraak Ladeco IT",
    text: [
      `Beste ${appointment.customerName},`,
      "",
      "Bedankt voor het vertrouwen in Ladeco IT.",
      `Er werd een afspraak ingepland op ${appointmentDateTime}.`,
      `Reden: ${appointment.reason}`,
      `Adres: ${appointment.customerAddress}`,
      "",
      "Met vriendelijke groeten,",
      "Ladeco IT",
    ].join("\n"),
    html: [
      `<p>Beste ${appointment.customerName},</p>`,
      "<p>Bedankt voor het vertrouwen in <strong>Ladeco IT</strong>.</p>",
      `<p>Er werd een afspraak ingepland op <strong>${appointmentDateTime}</strong>.</p>`,
      `<p><strong>Reden:</strong> ${appointment.reason}</p>`,
      `<p><strong>Adres:</strong> ${appointment.customerAddress}</p>`,
      "<p>Met vriendelijke groeten,<br/>Ladeco IT</p>",
    ].join(""),
    icalEvent: {
      method: "REQUEST",
      content: icsContent,
      filename: "afspraak-ladeco-it.ics",
    },
  });
}