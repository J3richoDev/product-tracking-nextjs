"use client";

import { useActionState, useEffect, useRef } from "react";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/status";
import { updateStatusAction } from "../../../actions";

export default function UpdateStatusForm({ shipmentId, currentStatus }: { shipmentId: number; currentStatus: Status }) {
  const [state, formAction, pending] = useActionState(updateStatusAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card space-y-4">
      <h2 className="text-lg font-semibold">Update status</h2>
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <div>
        <label htmlFor="status" className="label">New status</label>
        <select id="status" name="status" defaultValue={currentStatus} className="input" key={currentStatus}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="location" className="label">Location</label>
        <input id="location" name="location" maxLength={200} className="input" placeholder="e.g. Manila Hub" />
      </div>
      <div>
        <label htmlFor="note" className="label">Note (visible to customer)</label>
        <textarea id="note" name="note" maxLength={1000} rows={3} className="input" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state && !state.error && <p className="text-sm text-green-700">Status updated.</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Saving..." : "Save update"}
      </button>
    </form>
  );
}
