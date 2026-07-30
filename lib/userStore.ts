import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { hashPassword } from "@/lib/password";

export type UserRole = "admin" | "manager" | "technician" | "sales";

export type StoredUser = {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDirectory, "users.json");

async function ensureStore(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    const seeded = await seedDefaultAdmin();
    await writeFile(dataFilePath, JSON.stringify(seeded, null, 2), "utf8");
  }
}

async function seedDefaultAdmin(): Promise<StoredUser[]> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return [];
  }

  return [
    {
      id: crypto.randomUUID(),
      username,
      displayName: "Administrator",
      passwordHash: await hashPassword(password),
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

async function ensureDefaultAdminIfNeeded(users: StoredUser[]): Promise<StoredUser[]> {
  if (users.length > 0) {
    return users;
  }

  const seeded = await seedDefaultAdmin();
  if (seeded.length > 0) {
    await writeUsers(seeded);
    return seeded;
  }

  return users;
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();
  const content = await readFile(dataFilePath, "utf8");

  try {
    const parsed = JSON.parse(content) as StoredUser[];
    return ensureDefaultAdminIfNeeded(parsed);
  } catch {
    const seeded = await seedDefaultAdmin();
    if (seeded.length > 0) {
      await writeUsers(seeded);
      return seeded;
    }
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await ensureStore();
  await writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf8");
}

export async function listUsers(): Promise<StoredUser[]> {
  const users = await readUsers();
  return users.sort((left, right) => left.username.localeCompare(right.username));
}

export async function getUserByUsername(username: string): Promise<StoredUser | undefined> {
  const users = await readUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
}

export async function getUserById(id: string): Promise<StoredUser | undefined> {
  const users = await readUsers();
  return users.find((user) => user.id === id);
}

export async function createUser(input: {
  username: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
}): Promise<StoredUser> {
  const users = await readUsers();

  const normalizedUsername = input.username.trim().toLowerCase();
  if (users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
    throw new Error("Gebruikersnaam bestaat al.");
  }

  const created: StoredUser = {
    id: crypto.randomUUID(),
    username: normalizedUsername,
    displayName: input.displayName.trim(),
    passwordHash: input.passwordHash,
    role: input.role,
    active: true,
    createdAt: new Date().toISOString(),
  };

  users.push(created);
  await writeUsers(users);
  return created;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<StoredUser | undefined> {
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return undefined;
  }

  users[index] = {
    ...users[index],
    role,
  };

  await writeUsers(users);
  return users[index];
}

export async function setUserActive(userId: string, active: boolean): Promise<StoredUser | undefined> {
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return undefined;
  }

  users[index] = {
    ...users[index],
    active,
  };

  await writeUsers(users);
  return users[index];
}
