import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { z } from "zod";

import { verifyPassword } from "@/lib/password";
import { getUserByUsername, type UserRole } from "@/lib/userStore";

export const SESSION_COOKIE_NAME = "ladeco-admin-session";
export const roleSchema = z.enum(["admin", "manager", "technician", "sales"]);
export type SessionRole = z.infer<typeof roleSchema>;

export type SessionUser = {
  username: string;
  role: SessionRole;
  expiresAt: number;
};

const sessionDurationMs = 1000 * 60 * 60 * 12;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Gebruikersnaam is verplicht."),
  password: z.string().min(1, "Wachtwoord is verplicht."),
});

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "ladeco-it-admin-session-secret";
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export async function isValidCredentials(username: string, password: string): Promise<{
  ok: boolean;
  role?: SessionRole;
}> {
  const user = await getUserByUsername(username);
  if (!user || !user.active) {
    return { ok: false };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { ok: false };
  }

  return { ok: true, role: user.role };
}

export function createSessionToken(input: { username: string; role: SessionRole }): string {
  const expiresAt = Date.now() + sessionDurationMs;
  const payload = `${input.username}:${input.role}:${expiresAt}`;
  const signature = signPayload(payload);

  return Buffer.from(`${payload}:${signature}`, "utf8").toString("base64url");
}

export function decodeSessionToken(token: string | undefined): SessionUser | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, role, expiresAtRaw, signature] = decoded.split(":");
    const expiresAt = Number(expiresAtRaw);

    if (!username || !role || !expiresAtRaw || !signature) {
      return null;
    }

    const roleResult = roleSchema.safeParse(role);
    if (!roleResult.success) {
      return null;
    }

    const expected = signPayload(`${username}:${role}:${expiresAtRaw}`);
    const providedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      return null;
    }

    return {
      username,
      role: roleResult.data,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export function verifySessionToken(token: string | undefined): boolean {
  return decodeSessionToken(token) != null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return decodeSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export function hasAnyRole(user: SessionUser | null, roles: UserRole[]): boolean {
  if (!user) {
    return false;
  }

  return roles.includes(user.role);
}

export async function requireRoles(roles: UserRole[]): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  if (!hasAnyRole(user, roles)) {
    return null;
  }

  return user;
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