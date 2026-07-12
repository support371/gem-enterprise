import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function safeInternalPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/access/continue";
  }
  return candidate;
}

export default async function LoginRedirectPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const target = safeInternalPath(params.next ?? params.returnTo);
  redirect(`/client-login?next=${encodeURIComponent(target)}`);
}
