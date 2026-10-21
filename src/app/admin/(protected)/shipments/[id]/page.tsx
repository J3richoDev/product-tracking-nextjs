import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { shipments, statusEvents } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/status";
import StatusBadge from "@/components/status-badge";
import Timeline from "@/components/timeline";
import UpdateStatusForm from "./update-status-form";
import DeleteButton from "./delete-button";
import { deleteShipmentAction } from "../../../actions";

export const metadata = { title: "Shipment | Admin" };

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const db = getDb();
  const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
  if (!shipment) notFound();

  const events = await db
    .select()
    .from(statusEvents)
    .where(eq(statusEvents.shipmentId, id))
    .orderBy(desc(statusEvents.createdAt), desc(statusEvents.id));

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">&larr; Back to shipments</Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold sm:text-2xl">{shipment.trackingCode}</h1>
          <Link href={`/track/${shipment.trackingCode}`} target="_blank" className="text-sm text-blue-600 hover:underline">
            View customer page &rarr;
          </Link>
        </div>
        <StatusBadge status={shipment.currentStatus} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <dl className="card grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Field label="Customer" value={shipment.customerName} />
            <Field label="Email" value={shipment.customerEmail} />
            <Field label="Product" value={shipment.productName} />
            <Field label="Created" value={formatDate(shipment.createdAt)} />
            <Field label="Origin" value={shipment.origin} />
            <Field label="Destination" value={shipment.destination} />
          </dl>
          <UpdateStatusForm shipmentId={shipment.id} currentStatus={shipment.currentStatus} />
        </div>

        <div className="space-y-4">
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold">History</h2>
            <Timeline events={events} />
          </section>
          <form action={deleteShipmentAction} className="text-right">
            <input type="hidden" name="shipmentId" value={shipment.id} />
            <DeleteButton />
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium break-words">{value || "—"}</dd>
    </div>
  );
}
