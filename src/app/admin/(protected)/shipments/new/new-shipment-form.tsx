"use client";

import { useActionState } from "react";
import { createShipmentAction } from "../../../actions";

export default function NewShipmentForm() {
  const [state, formAction, pending] = useActionState(createShipmentAction, undefined);

  return (
    <form action={formAction} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customerName" className="label">Customer name *</label>
          <input id="customerName" name="customerName" required maxLength={200} className="input" />
        </div>
        <div>
          <label htmlFor="customerEmail" className="label">Customer email</label>
          <input id="customerEmail" name="customerEmail" type="email" maxLength={200} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="productName" className="label">Product *</label>
        <input id="productName" name="productName" required maxLength={200} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="origin" className="label">Origin</label>
          <input id="origin" name="origin" maxLength={200} className="input" />
        </div>
        <div>
          <label htmlFor="destination" className="label">Destination</label>
          <input id="destination" name="destination" maxLength={200} className="input" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Creating..." : "Create shipment"}
      </button>
    </form>
  );
}
