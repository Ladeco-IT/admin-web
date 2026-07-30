import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRoles } from "@/lib/auth";
import { readPcCatalog, writePcCatalog } from "@/lib/pcCatalogStore";

const optionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  price: z.number().finite().nonnegative(),
  helper: z.string().trim().min(1),
  imageUrl: z.string().trim().optional().default(""),
  imageAlt: z.string().trim().optional().default(""),
  brand: z.enum(["amd", "intel", "nvidia", "other"]).optional(),
  platform: z.enum(["all", "amd", "intel"]).optional(),
  retailer: z.string().trim().optional().default(""),
  productUrl: z.string().trim().optional().default(""),
});

const groupSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  helper: z.string().trim().min(1),
  defaultOptionId: z.string().trim().min(1),
  options: z.array(optionSchema),
});

const upgradeSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  price: z.number().finite().nonnegative(),
  helper: z.string().trim().min(1),
});

const catalogSchema = z.object({
  updatedAt: z.string().optional(),
  note: z.string().trim().min(1),
  groups: z.array(groupSchema),
  upgrades: z.array(upgradeSchema),
});

export async function GET(request: Request) {
  const syncToken = process.env.PC_CATALOG_SYNC_TOKEN?.trim();
  const headerToken = request.headers.get("x-pc-catalog-token")?.trim();
  const hasValidSyncToken = Boolean(syncToken && headerToken && headerToken === syncToken);

  if (!hasValidSyncToken) {
    const session = await requireRoles(["admin", "manager", "sales", "technician"]);
    if (!session) {
      return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
    }
  }

  const catalog = await readPcCatalog();
  return NextResponse.json({ ok: true, catalog });
}

export async function PUT(request: Request) {
  const session = await requireRoles(["admin", "manager", "sales"]);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Geen toegang." }, { status: 403 });
  }

  try {
    const payload = catalogSchema.parse(await request.json());
    const catalog = await writePcCatalog({
      ...payload,
      updatedAt: payload.updatedAt || new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, catalog });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.issues.map((issue) => issue.message).join(" "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Onbekende serverfout." },
      { status: 500 }
    );
  }
}
