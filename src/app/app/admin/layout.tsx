import { AdminSectionNavigation } from "@/components/admin/AdminSectionNavigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminSectionNavigation />
      {children}
    </div>
  );
}
