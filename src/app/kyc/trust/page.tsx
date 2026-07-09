import { redirect } from "next/navigation";

export default function TrustVerificationRedirect() {
  redirect("/kyc/individual");
}
