# GEM Enterprise Guided Demo Production Deployment

This deployment marker retriggers the canonical Vercel production pipeline after the enterprise website and TikTok demonstration flow was merged.

## Release contents

- `/enterprise-demo` — complete page-by-page enterprise walkthrough;
- `/enterprise-demo/watch` — interactive guided player with automatic progression, browser narration, timeline controls, page purpose, screen-recording instructions, and secure links to every real page;
- `/tokmetric/review-demo` — TikTok app-review workspace connected to the full enterprise walkthrough;
- security-compatible page launching instead of iframe embedding because production headers prohibit framing;
- corrected Community route at `/community-hub`.

## Review boundary

The guided walkthrough explains the full website and controlled TokMetric workflow. TikTok's submitted review recording must still show the real Sandbox OAuth authorization, every requested product and scope, connected-account return, content preparation, explicit approval, upload or publishing result, status history, audit evidence, and disconnect control.

No password, client secret, access token, private customer record, or production credential is included in this deployment marker.
