import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.role || !["ADMIN", "AGENT"].includes(session.user.role)) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar role={session.user.role} userName={session.user.name} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
