import { NextResponse } from "next/server";
import { z } from "zod";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  SUPPORTED_LOCALES,
  isLocale,
} from "@/i18n/config";

const localeSchema = z.object({
  locale: z.string().refine(isLocale, "Unsupported locale"),
});

export async function GET() {
  return NextResponse.json(
    {
      defaultLocale: "en",
      supportedLocales: SUPPORTED_LOCALES,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 },
    );
  }

  const parsed = localeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_LOCALE", message: "The requested locale is not supported." } },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true, locale: parsed.data.locale });

  response.cookies.set({
    name: LOCALE_COOKIE,
    value: parsed.data.locale,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });

  return response;
}
