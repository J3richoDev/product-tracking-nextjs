import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata = { title: "Admin Login" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <h1 className="mb-6 text-xl font-bold">Admin Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
