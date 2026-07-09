import { redirect } from "next/navigation";

export default function AdminKycRedirect() {
  redirect("/review/verification");
}
