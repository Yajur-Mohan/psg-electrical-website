import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Staff login", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <section className="grid-lines grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8">
        <h1 className="text-2xl font-extrabold">Staff login</h1>
        <p className="mt-1 mb-6 text-sm text-muted">HYDRA admin: website quotes and enquiries.</p>
        <LoginForm />
      </div>
    </section>
  );
}
