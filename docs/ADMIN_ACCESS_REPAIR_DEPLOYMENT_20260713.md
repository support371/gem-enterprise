# Administrator Access Repair Deployment

This deployment marker retriggers the canonical Vercel production pipeline after PR #165 was merged but the initial Git deployment webhook was not observed.

Runtime change delivered by PR #165:

- validates the one-time authorization hash before password entry;
- validates again before consuming the capability;
- prevents navigation with an unregistered, expired, or consumed capability;
- provides a secure restart flow;
- sends only the capability SHA-256 hash to Supabase;
- uses the Supabase publishable key through the `apikey` header;
- leaves the existing atomic password-consumption RPC unchanged.

No password, usable capability, database credential, service-role key, or private user data is included in this document.
