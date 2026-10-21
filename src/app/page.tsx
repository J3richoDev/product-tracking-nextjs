import TrackForm from "@/components/track-form";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Track your order</h1>
        <p className="mt-2 text-slate-600">Enter the tracking code you received to see the latest status.</p>
        <div className="card mt-8 text-left">
          <TrackForm />
        </div>
      </div>
    </main>
  );
}
