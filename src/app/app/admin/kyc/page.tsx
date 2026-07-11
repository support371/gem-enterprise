import { redirect } from "next/navigation";

export default function AdminKycRedirect() {
  redirect("/app/admin/gem-verify");
}
