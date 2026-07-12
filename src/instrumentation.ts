export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getScopedServerSecret } = await import(
    "@/lib/security/scoped-secret"
  );

  const scannerRequest = getScopedServerSecret(
    "GEM_VERIFY_SCANNER_TOKEN",
    "gem-verify-scanner-request",
  );
  const scannerCallback = getScopedServerSecret(
    "GEM_VERIFY_SCANNER_CALLBACK_SECRET",
    "gem-verify-scanner-callback",
  );

  if (
    !process.env.GEM_VERIFY_SCANNER_TOKEN?.trim() &&
    scannerRequest.source === "derived"
  ) {
    process.env.GEM_VERIFY_SCANNER_TOKEN = scannerRequest.value;
  }

  if (
    !process.env.GEM_VERIFY_SCANNER_CALLBACK_SECRET?.trim() &&
    scannerCallback.source === "derived"
  ) {
    process.env.GEM_VERIFY_SCANNER_CALLBACK_SECRET = scannerCallback.value;
  }
}
