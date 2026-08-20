import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isStaffRole } from "@/lib/api/auth-helpers";
import { SupportOperationsConsole } from "@/components/support/SupportOperationsConsole";

export default async function SupportOperationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/app/support/operations");
  if (!isStaffRole(session.role)) redirect("/unauthorized");
  return <SupportOperationsConsole />;
}
