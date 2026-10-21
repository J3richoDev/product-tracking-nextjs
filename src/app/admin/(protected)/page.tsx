import Link from "next/link";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { shipments, STATUSES, type Status } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { STATUS_LABELS, formatDate } from "@/lib/status";
import StatusBadge from "@/components/status-badge";

export const metadata = { title: "Shipments | Admin" };

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const statusFilter = (STATUSES as readonly string[]).includes(status) ? (status as Status) : null;

  const filters: SQL[] = [];
  if (query) {
    const like = `%${query.replace(/[%_\\]/g, "\\$&")}%`;
    filters.push(
      or(
        ilike(shipments.trackingCode, like),
        ilike(shipments.customerName, like),
        ilike(shipments.productName, like),
      )!,
    );
  }
  if (statusFilter) filters.push(eq(shipments.currentStatus, statusFilter));

  const rows = await getDb()
    .select()
    .from(shipments)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(shipments.updatedAt))
    .limit(100);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Shipments</h1>
        <Link href="/admin/shipments/new" className="btn-primary">+ New shipment</Link>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row" role="search">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search code, customer, product"
          className="input sm:flex-1"
        />
        <select name="status" defaultValue={statusFilter ?? ""} className="input sm:w-48">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
      </form>

      {rows.length === 0 ? (
        <p className="card text-center text-slate-500">No shipments found.</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/shipments/${s.id}`} className="card block hover:border-blue-300">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-sm font-semibold">{s.trackingCode}</span>
                    <StatusBadge status={s.currentStatus} />
                  </div>
                  <p className="mt-2 font-medium">{s.productName}</p>
                  <p className="text-sm text-slate-500">{s.customerName}</p>
                  <p className="mt-1 text-xs text-slate-400">Updated {formatDate(s.updatedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="card hidden overflow-x-auto p-0 md:block sm:p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Tracking code</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/shipments/${s.id}`} className="font-mono font-semibold text-blue-600 hover:underline">
                        {s.trackingCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{s.customerName}</td>
                    <td className="px-4 py-3">{s.productName}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.currentStatus} /></td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(s.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
