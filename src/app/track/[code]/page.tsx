import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { shipments, statusEvents } from "@/db/schema";
import { PROGRESS_STEPS, STATUS_LABELS, type Status } from "@/lib/status";
import StatusBadge from "@/components/status-badge";
import Timeline from "@/components/timeline";
import TrackForm from "@/components/track-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tracking | Order Tracking", robots: { index: false } };

export default async function TrackPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.trim().toUpperCase().slice(0, 50);

  const db = getDb();
  const [shipment] = await db
    .select({
      id: shipments.id,
      trackingCode: shipments.trackingCode,
      productName: shipments.productName,
      origin: shipments.origin,
      destination: shipments.destination,
      currentStatus: shipments.currentStatus,
    })
    .from(shipments)
    .where(eq(shipments.trackingCode, code))
    .limit(1);

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; Track another order</Link>

      {!shipment ? (
        <div className="card space-y-4 text-center">
          <h1 className="text-xl font-bold">Tracking code not found</h1>
          <p className="text-slate-600">
            We couldn&apos;t find <span className="font-mono font-semibold">{code}</span>. Please check the code and try again.
          </p>
          <div className="text-left"><TrackForm defaultValue={code} /></div>
        </div>
      ) : (
        <ShipmentView shipment={shipment} events={await getEvents(shipment.id)} />
      )}
    </main>
  );
}

async function getEvents(shipmentId: number) {
  return getDb()
    .select()
    .from(statusEvents)
    .where(eq(statusEvents.shipmentId, shipmentId))
    .orderBy(desc(statusEvents.createdAt), desc(statusEvents.id));
}

type ShipmentSummary = {
  trackingCode: string;
  productName: string;
  origin: string | null;
  destination: string | null;
  currentStatus: Status;
};

function ShipmentView({
  shipment,
  events,
}: {
  shipment: ShipmentSummary;
  events: Awaited<ReturnType<typeof getEvents>>;
}) {
  const cancelled = shipment.currentStatus === "CANCELLED";
  const currentIndex = PROGRESS_STEPS.indexOf(shipment.currentStatus);

  return (
    <>
      <section className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-mono text-lg font-bold sm:text-xl">{shipment.trackingCode}</h1>
          <StatusBadge status={shipment.currentStatus} />
        </div>
        <p className="text-slate-700">{shipment.productName}</p>
        {(shipment.origin || shipment.destination) && (
          <p className="text-sm text-slate-500">
            {shipment.origin ?? "—"} &rarr; {shipment.destination ?? "—"}
          </p>
        )}
      </section>

      {!cancelled && (
        <section className="card">
          <h2 className="sr-only">Progress</h2>
          {/* Vertical on mobile, horizontal on larger screens */}
          <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
            {PROGRESS_STEPS.map((step, i) => {
              const done = i <= currentIndex;
              return (
                <li key={step} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                    } ${i === currentIndex ? "ring-4 ring-blue-200" : ""}`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={`text-sm sm:text-xs ${done ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                    {STATUS_LABELS[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Tracking history</h2>
        <Timeline events={events} />
      </section>
    </>
  );
}
