import { redirect } from "next/navigation";

export default function ATRRegisterPage() {
  redirect("/request-access?division=atr");
}
