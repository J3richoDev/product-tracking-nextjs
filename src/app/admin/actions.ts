"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { getDb } from "@/db";
import { shipments, statusEvents, STATUSES } from "@/db/schema";
import { createSession, destroySession, requireAdmin, verifyCredentials } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

const optionalText = z
  .string()
  .trim()
  .max(200)
  .transform((v) => (v === "" ? null : v));

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ email: z.string().trim().min(1).max(200), password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Email and password are required." };

  if (!(await verifyCredentials(parsed.data.email, parsed.data.password))) {
    return { error: "Invalid email or password." };
  }
  await createSession(parsed.data.email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// Excludes look-alike characters (0/O, 1/I/L) so customers can read codes easily.
const generateCode = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 10);

const createSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required.").max(200),
  customerEmail: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Invalid email.")
    .transform((v) => (v === "" ? null : v)),
  productName: z.string().trim().min(1, "Product name is required.").max(200),
  origin: optionalText,
  destination: optionalText,
});

export async function createShipmentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const db = getDb();
  const trackingCode = `TRK-${generateCode()}`;
  const [created] = await db
    .insert(shipments)
    .values({ ...parsed.data, trackingCode, currentStatus: "ORDER_PLACED" })
    .returning({ id: shipments.id });
  await db.insert(statusEvents).values({
    shipmentId: created.id,
    status: "ORDER_PLACED",
    location: parsed.data.origin,
  });

  revalidatePath("/admin");
  redirect(`/admin/shipments/${created.id}`);
}

const updateSchema = z.object({
  shipmentId: z.coerce.number().int().positive(),
  status: z.enum(STATUSES),
  location: optionalText,
  note: z
    .string()
    .trim()
    .max(1000)
    .transform((v) => (v === "" ? null : v)),
});

export async function updateStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { shipmentId, status, location, note } = parsed.data;
  const db = getDb();
  const [updated] = await db
    .update(shipments)
    .set({ currentStatus: status, updatedAt: new Date() })
    .where(eq(shipments.id, shipmentId))
    .returning({ trackingCode: shipments.trackingCode });
  if (!updated) return { error: "Shipment not found." };

  await db.insert(statusEvents).values({ shipmentId, status, location, note });

  revalidatePath("/admin");
  revalidatePath(`/admin/shipments/${shipmentId}`);
  revalidatePath(`/track/${updated.trackingCode}`);
  return {};
}

export async function deleteShipmentAction(formData: FormData) {
  await requireAdmin();
  const id = z.coerce.number().int().positive().parse(formData.get("shipmentId"));
  await getDb().delete(shipments).where(eq(shipments.id, id));
  revalidatePath("/admin");
  redirect("/admin");
}
