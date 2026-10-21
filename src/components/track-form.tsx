"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <label htmlFor="code" className="sr-only">Tracking code</label>
      <input
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. TRK-ABC23XYZ45"
        autoComplete="off"
        autoCapitalize="characters"
        maxLength={50}
        required
        className="input font-mono sm:flex-1"
      />
      <button type="submit" className="btn-primary">Track</button>
    </form>
  );
}
