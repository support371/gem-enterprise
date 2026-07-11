# Platform Operations Agent Connection

## Production bridge

- API origin: `https://support371-gem-enterprise.vercel.app`
- OpenAPI schema: `https://support371-gem-enterprise.vercel.app/gem-platform-operations-openapi.yaml`
- Authentication header: `X-GEM-Agent-Key`

## Protected read-only endpoints

- `GET /api/agent/health`
- `GET /api/agent/context`
- `GET /api/agent/commerce`
- `GET /api/agent/commerce?channel=tiktok`
- `GET /api/agent/commerce?channel=google`
- `GET /api/agent/tiktok-shop`
- `GET /api/agent/google-store`
- `GET /api/agent/catalog`

The bridge is deliberately fail-closed. Until a credential is configured, protected endpoints return:

```json
{
  "ok": false,
  "error": "agent_api_not_configured"
}
```

## Vercel configuration

Add a randomly generated value of at least 32 characters to the Production environment:

```text
GEM_AGENT_API_KEY=<private random value>
```

The existing `GPT_AUTH_TOKEN` is also accepted as a temporary compatibility fallback, but `GEM_AGENT_API_KEY` is the preferred dedicated credential.

Keep these values accurate:

```text
GEM_PUBLIC_APP_URL=https://www.gemcybersecurityassist.com
GEM_AGENT_API_BASE_URL=https://support371-gem-enterprise.vercel.app
TIKTOK_SELLER_ACCOUNT_CONNECTED=false
GOOGLE_MERCHANT_ACCOUNT_CONNECTED=false
```

Do not set either commerce-account flag to `true` until the corresponding external account authorization has been verified.

## Platform Operations Agent Action

In the existing Platform Operations Agent editor:

1. Open **Actions**.
2. Import the OpenAPI schema URL above.
3. Set authentication to **API Key**.
4. Set the header name to `X-GEM-Agent-Key`.
5. Enter the same private value stored as `GEM_AGENT_API_KEY` in Vercel.
6. Test `checkGemPlatformHealth` and `getGemPlatformContext`.
7. Save or update the agent.

Never place the credential in GitHub, GPT instructions, public documentation, screenshots, or chat messages.

## Expected TikTok response flow

The `getGemTikTokShop` operation returns:

- Internal GEM page: `https://www.gemcybersecurityassist.com/store/tiktok`
- Main storefront: `https://superagent-17ea9ea1.base44.app/functions/tiktokStore`
- Seller-account connection state
- Forwarding state

Until official TikTok seller authorization is verified, both seller connection and account forwarding remain `false`.

## Expected Google response flow

The `getGemGoogleStore` operation returns:

- Internal GEM page: `https://www.gemcybersecurityassist.com/store/google`
- Main storefront: `https://crystal-kinetic-cart-flow.base44.app/`
- Google Merchant account connection state
