import { redirect } from "next/navigation";

export default function BusinessVerificationRedirect() {
  redirect("/kyc/individual");
}
