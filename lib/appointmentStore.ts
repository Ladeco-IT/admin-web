import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { StoredAppointment } from "@/lib/appointment";

const dataDirectory = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDirectory, "appointments.json");

async function ensureStore(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await writeFile(dataFilePath, "[]", "utf8");
  }
}

async function readAppointments(): Promise<StoredAppointment[]> {
  await ensureStore();
  const content = await readFile(dataFilePath, "utf8");

  try {
    return JSON.parse(content) as StoredAppointment[];
  } catch {
    return [];
  }
}

async function writeAppointments(appointments: StoredAppointment[]): Promise<void> {
  await ensureStore();
  await writeFile(dataFilePath, JSON.stringify(appointments, null, 2), "utf8");
}

export async function listAppointments(): Promise<StoredAppointment[]> {
  const appointments = await readAppointments();

  return appointments.sort((left, right) => {
    const leftDate = new Date(`${left.date}T${left.time}:00`).getTime();
    const rightDate = new Date(`${right.date}T${right.time}:00`).getTime();

    return rightDate - leftDate;
  });
}

export async function saveAppointment(appointment: StoredAppointment): Promise<void> {
  const appointments = await readAppointments();
  appointments.push(appointment);
  await writeAppointments(appointments);
}

export async function getAppointmentById(
  appointmentId: string
): Promise<StoredAppointment | undefined> {
  const appointments = await readAppointments();
  return appointments.find((appointment) => appointment.id === appointmentId);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: StoredAppointment["status"]
): Promise<StoredAppointment | undefined> {
  const appointments = await readAppointments();
  const index = appointments.findIndex((appointment) => appointment.id === appointmentId);

  if (index === -1) {
    return undefined;
  }

  const updated = {
    ...appointments[index],
    status,
  };

  appointments[index] = updated;
  await writeAppointments(appointments);

  return updated;
}