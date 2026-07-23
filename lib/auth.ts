import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { z } from "zod";

export const SESSION_COOKIE_NAME = "ladeco-admin-session";

const sessionDurationMs = 1000 * 60 * 60 * 12;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Gebruikersnaam is verplicht."),
  password: z.string().min(1, "Wachtwoord is verplicht."),
});

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "ladeco-it-admin-session-secret";
}

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("Admin login is niet geconfigureerd. Stel ADMIN_USERNAME en ADMIN_PASSWORD in.");
  }

  return { username, password };
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function isValidAdminCredentials(username: string, password: string): boolean {
  const configured = getAdminCredentials();
  return username === configured.username && password === configured.password;
}

export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + sessionDurationMs;
  const payload = `${username}:${expiresAt}`;
  const signature = signPayload(payload);

  return Buffer.from(`${payload}:${signature}`, "utf8").toString("base64url");
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, expiresAt, signature] = decoded.split(":");

    if (!username || !expiresAt || !signature) {
      return false;
    }

    const configured = getAdminCredentials();
    if (username !== configured.username) {
      return false;
    }

    const expected = signPayload(`${username}:${expiresAt}`);
    const providedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return false;
    }

    return Number(expiresAt) > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export function getSessionCookieSettings() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationMs / 1000,
  };
}