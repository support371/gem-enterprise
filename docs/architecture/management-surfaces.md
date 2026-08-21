# GEM management surfaces

GEM uses one identity and authorization model across separately presented applications. The public website is not the administration application.

| Surface | Canonical host | Audience | Publicly listed |
|---|---|---|---|
| Public website | `www.gemcybersecurityassist.com` | Prospective users and public information | Yes |
| Identity gateway | `auth.gemcybersecurityassist.com` | All approved account holders | No |
| Client portal | `portal.gemcybersecurityassist.com` | Organization owners and clients | Yes, as “Workspace sign in” |
| Team workspace | `team.gemcybersecurityassist.com` | Assigned reviewers and delivery team | No; invitation or assignment only |
| Admin console | `admin.gemcybersecurityassist.com` | Delegated administrators and internal operations | No |
| Owner control plane | `control.gemcybersecurityassist.com` | Platform owner / Super Admin only | No |
| App launcher | `apps.gemcybersecurityassist.com` | Role-filtered connected applications | No |

## Authority model

The hostname chooses the presentation surface; it never grants authority. The server-authenticated account role and active organization/workspace memberships remain authoritative. A client session cannot enter the team, admin, or owner surface. An administrator cannot enter the owner control plane. A Super Admin does not silently impersonate a client.

The public header exposes a single neutral workspace sign-in. It does not publish Admin or Super Admin as selectable account types. Direct protected entrances remain available for assigned users and invitation links.

## Routing state machine

1. A user enters the official host assigned to the account.
2. The network proxy maps the host to its dedicated sign-in experience.
3. Authentication validates credentials without accepting a requested role.
4. The server reloads canonical account authority and membership.
5. A matching role enters its dedicated application; a mismatch is signed out or denied.
6. Protected APIs repeat authorization checks and remain the enforcement boundary.

## Deployment boundary

Repository support for host-aware routing does not prove DNS or production acceptance. Before switching a hostname, verify that it is assigned to the intended trusted Vercel project, remove any obsolete proxy origin, and run signed-out, correct-role, wrong-role, logout, and cross-organization isolation tests. Do not share a parent-domain session cookie with an independently operated or untrusted subdomain; use a short-lived, one-time identity exchange when separate deployments require SSO.
