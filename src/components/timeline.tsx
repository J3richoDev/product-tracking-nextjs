import type { StatusEvent } from "@/db/schema";
import { STATUS_LABELS, formatDate } from "@/lib/status";

export default function Timeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-slate-500">No updates yet.</p>;

  return (
    <ol className="relative ml-2 border-l-2 border-slate-200">
      {events.map((e, i) => (
        <li key={e.id} className="mb-6 ml-5 last:mb-0">
          <span
            className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white ${
              i === 0 ? "bg-blue-600" : "bg-slate-300"
            }`}
          />
          <p className={`font-semibold ${i === 0 ? "text-slate-900" : "text-slate-600"}`}>{STATUS_LABELS[e.status]}</p>
          <p className="text-xs text-slate-500">
            {formatDate(e.createdAt)}
            {e.location && <> &middot; {e.location}</>}
          </p>
          {e.note && <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}
