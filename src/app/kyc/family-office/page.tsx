import { redirect } from "next/navigation";

export default function FamilyOfficeVerificationRedirect() {
  redirect("/kyc/individual");
}
