import { TokMetricError } from "@/lib/tokmetric/security";
import { socialOAuthProviders, type SocialOAuthProvider } from "./config";
import type { SocialProviderLifecycleAdapter } from "./lifecycle";

const adapters = new Map<SocialOAuthProvider, SocialProviderLifecycleAdapter>();

export function registerSocialProviderLifecycleAdapter(
  adapter: SocialProviderLifecycleAdapter,
) {
  if (!socialOAuthProviders.includes(adapter.provider)) {
    throw new TokMetricError(
      400,
      "UNSUPPORTED_SOCIAL_PROVIDER",
      "Social lifecycle provider is not supported.",
    );
  }
  if (adapters.has(adapter.provider)) {
    throw new TokMetricError(
      409,
      "SOCIAL_LIFECYCLE_ADAPTER_ALREADY_REGISTERED",
      "Social lifecycle adapter is already registered.",
    );
  }
  adapters.set(adapter.provider, adapter);
}

export function getSocialProviderLifecycleAdapter(provider: SocialOAuthProvider) {
  const adapter = adapters.get(provider);
  if (!adapter) {
    throw new TokMetricError(
      503,
      "SOCIAL_LIFECYCLE_ADAPTER_NOT_CONFIGURED",
      "The provider lifecycle adapter has not been configured.",
    );
  }
  return adapter;
}

export function listRegisteredSocialLifecycleProviders() {
  return [...adapters.keys()].sort();
}

export function resetSocialProviderLifecycleAdaptersForTests() {
  if (process.env.NODE_ENV !== "test") {
    throw new TokMetricError(
      403,
      "SOCIAL_LIFECYCLE_RESET_FORBIDDEN",
      "Lifecycle adapters may only be reset in tests.",
    );
  }
  adapters.clear();
}
