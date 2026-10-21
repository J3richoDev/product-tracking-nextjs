import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import NewShipmentForm from "./new-shipment-form";

export const metadata = { title: "New shipment | Admin" };

export default async function NewShipmentPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">&larr; Back to shipments</Link>
      <h1 className="text-2xl font-bold">New shipment</h1>
      <NewShipmentForm />
    </div>
  );
}
