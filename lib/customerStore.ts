import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDirectory, "customers.json");

async function ensureStore(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await writeFile(dataFilePath, "[]", "utf8");
  }
}

async function readCustomers(): Promise<StoredCustomer[]> {
  await ensureStore();
  const content = await readFile(dataFilePath, "utf8");

  try {
    return JSON.parse(content) as StoredCustomer[];
  } catch {
    return [];
  }
}

async function writeCustomers(customers: StoredCustomer[]): Promise<void> {
  await ensureStore();
  await writeFile(dataFilePath, JSON.stringify(customers, null, 2), "utf8");
}

export async function listCustomers(): Promise<StoredCustomer[]> {
  const customers = await readCustomers();
  return customers.sort((left, right) => left.name.localeCompare(right.name));
}

export async function createCustomer(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}): Promise<StoredCustomer> {
  const customers = await readCustomers();

  const created: StoredCustomer = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    notes: input.notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  customers.push(created);
  await writeCustomers(customers);
  return created;
}

export async function updateCustomer(
  customerId: string,
  input: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  }
): Promise<StoredCustomer | undefined> {
  const customers = await readCustomers();
  const index = customers.findIndex((customer) => customer.id === customerId);

  if (index === -1) {
    return undefined;
  }

  customers[index] = {
    ...customers[index],
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    notes: input.notes.trim(),
    updatedAt: new Date().toISOString(),
  };

  await writeCustomers(customers);
  return customers[index];
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  const customers = await readCustomers();
  const before = customers.length;
  const next = customers.filter((customer) => customer.id !== customerId);

  if (next.length === before) {
    return false;
  }

  await writeCustomers(next);
  return true;
}
