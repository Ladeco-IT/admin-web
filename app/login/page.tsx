import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  const authenticated = await isAdminAuthenticated();

  if (authenticated) {
    redirect("/");
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.22),transparent_34%),linear-gradient(140deg,#ecfeff_0%,#f8fafc_42%,#fef3c7_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}