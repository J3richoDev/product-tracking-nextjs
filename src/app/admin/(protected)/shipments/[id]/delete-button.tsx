"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this shipment and its history? This cannot be undone.")) e.preventDefault();
      }}
      className="btn border border-red-200 bg-white text-red-600 hover:bg-red-50"
    >
      Delete shipment
    </button>
  );
}
