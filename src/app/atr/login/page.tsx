import { redirect } from "next/navigation";

export default function ATRLoginPage() {
  redirect("/client-login?division=atr");
}
