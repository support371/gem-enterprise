# GEM Enterprise Workspace OS — Perplexity Port Plan

## Status

Implementation lane: `feat/workspace-os-perplexity-port`

Source prototype reviewed from the uploaded `GEM Enterprise Workspace OS.zip` (`index.html`, `styles.css`, `app.js`).

The Perplexity Computer share URL was supplied for supporting context, but the share page could not be fetched directly from this environment. The uploaded ZIP and the user's supplied session transcript are therefore the authoritative prototype sources for this lane.

## Decision

Do **not** replace GEM Enterprise with the static prototype as a whole.

The current GEM application already has production authentication, active workspace membership checks, project-scoped permissions, authoritative database-backed project metrics, protected nested routes, approval controls, audit-sensitive workflows, social/video governance, and role-specific management surfaces.

The prototype is a strong **interaction and information-architecture reference**. Its layout/navigation model should be ported into the current Next.js application while retaining the current security and data architecture.

No feature may be removed merely to make the new visual shell easier to implement.

## Prototype capabilities to preserve and port

### Workspace directory and routing

- Workspace directory as the entry point.
- Dedicated dashboard per workspace.
- Workspace switch/back-to-directory affordance.
- Workspace-specific module lists.
- Clear groupings for Workspace, Platform, and Governance modules.
- Persistent topbar with page context, account controls, notifications, AI search/command entry, and theme control.
- Dedicated module pages rather than one overloaded dashboard.

### Rich operating modules

The source prototype contains modules for:

- Overview
- Threat & Monitoring / GEM Sentinel
- Cybersecurity
- Real Estate / legal workflows
- Stores / commerce
- Workspaces & Clients
- Production
- Marketing
- Sales
- AI
- Integrations marketplace
- Community
- Security & access
- Settings

The implementation must map these to real GEM capabilities and authoritative records. Prototype-only sample values must not overwrite or masquerade as production data.

### Integration catalog

The prototype includes a large categorized integration marketplace and app-detail drawer. Preserve the discoverability model, but connect it to GEM's existing governed connector system and installed/authorized providers. Never represent an unavailable integration as connected.

### Threat-monitoring model

Preserve the GEM Sentinel structure:

- Command Center
- Alert Inbox
- Flow Trace
- Intel Feeds
- SOAR Playbooks
- Bot/Detection Settings

Production data must come from actual monitoring services or remain explicitly not configured.

## Accessibility and navigation requirements

The user's supplied Perplexity session describes a later accessibility/navigation pass. These requirements are accepted as the target even where the uploaded ZIP does not fully contain them.

Required in the Next.js port:

- Skip-to-main-content link.
- Semantic `header`, `nav`, `main`, `aside`, and landmark labeling.
- `aria-current="page"` on active routes.
- Real breadcrumb links with `aria-current` on the current location.
- Focus management when route/environment changes.
- Keyboard-operable tabs using the ARIA tablist/tab/tabpanel pattern.
- ArrowLeft/ArrowRight/Home/End tab navigation.
- Keyboard-operable switches with `aria-checked` and Space/Enter support.
- Integration drawer as an accessible dialog with focus trap, Escape close, and focus restore.
- Toast/status announcements through an `aria-live` region.
- Mobile sidebar backdrop/scrim, Escape-to-close, and correct `aria-expanded` state.
- Sidebar/module/workspace search/filter.
- `prefers-reduced-motion` support.
- Visible `:focus-visible` treatment.
- Theme toggle with `aria-pressed`.
- No hidden-tab controls left keyboard-focusable.

### Important source discrepancy

The uploaded ZIP does include some accessibility groundwork (`aria-label`, `aria-hidden`, `:focus-visible`, `prefers-reduced-motion`, Escape handling for the drawer, and `aria-current` CSS), but it does **not** fully implement every accessibility behavior claimed in the supplied Perplexity session transcript. For example, the ZIP's current tab helper does not emit full ARIA tab roles, the drawer does not yet contain a complete focus trap/restore implementation, and the mobile sidebar currently auto-opens on workspace render under 820px.

The port must implement the stronger transcript-described behavior rather than copying those incomplete prototype behaviors.

## Current GEM architecture that must remain authoritative

Current GEM already proves:

- Project environments: overview, production, development, marketing, sales, finance, team, client, services, tools, monitoring, administration.
- Protected project route under `/app/workspace/projects/[projectId]/[[...environment]]`.
- Active workspace membership revalidation.
- Environment access controlled by project permissions.
- Authoritative project progress, update counts, workspace members, connectors, and approval requests.
- Legacy dashboard routing into the workspace instead of showing fabricated sample metrics.
- Super Admin governance routes for workspace access and organization reporting.

These capabilities are not to be replaced with static in-browser arrays from the prototype.

## Target architecture

### Route level

Keep the current protected Next.js route model and upgrade its UI shell:

- `/app/workspace` — Workspace Directory / organization overview.
- `/app/workspace/projects/[projectId]` — project home.
- `/app/workspace/projects/[projectId]/production`
- `/development`
- `/marketing`
- `/sales`
- `/finance`
- `/team`
- `/client`
- `/services`
- `/tools`
- `/monitoring`
- `/admin`

Additional domain modules from the prototype should be introduced as permission-gated destinations or subpages, not as unscoped fake screens.

### Component level

Recommended new/reworked reusable components:

- `WorkspaceDirectoryShell`
- `WorkspaceSidebar`
- `WorkspaceTopbar`
- `WorkspaceBreadcrumbs`
- `WorkspaceModuleSearch`
- `WorkspaceKpiGrid`
- `WorkspaceQuickActions`
- `WorkspaceHealthPanel`
- `AccessibleTabs`
- `AccessibleIntegrationDrawer`
- `WorkspaceIntegrationCatalog`
- `WorkspaceCommandBar`
- `MobileWorkspaceNavigation`

The existing `ProjectWorkspaceShell` should be evolved rather than discarded.

## Visual direction

Port the prototype's strengths:

- Clean persistent sidebar.
- Clear workspace identity and role label.
- Compact topbar.
- Strong page title hierarchy.
- KPI summary cards.
- Dedicated content surfaces.
- Quick-actions rail.
- Integration state visibility.
- Responsive mobile sidebar.
- Light/dark theme capability where compatible with GEM brand policy.

Keep GEM's current production brand/security tone. Do not copy Perplexity branding or injected preview code.

## Files from the prototype that must NOT be copied into production

- Perplexity iframe/screenshot instrumentation appended to `index.html`.
- Static demo-only data values presented as live facts.
- In-browser connection state arrays as authoritative integration state.
- Static client/security data that bypasses the database and permission model.
- Prototype API-key examples as real credentials.

## Migration sequence

### Phase 1 — Shell and accessibility

1. Rework project/workspace shell to use the prototype's directory/sidebar/topbar information architecture.
2. Add real breadcrumbs.
3. Add workspace/module search.
4. Implement mobile drawer/scrim behavior.
5. Add skip link and focus management.
6. Add fully accessible tabs and switches.
7. Add accessible integration drawer behavior.
8. Preserve all current route guards and server data loading.

### Phase 2 — Workspace directory and module mapping

1. Upgrade `/app/workspace` to the richer workspace-directory experience.
2. Map current project environments to grouped navigation.
3. Add permission-gated links for cybersecurity, threat monitoring, integrations, AI, community, commerce, and settings where real GEM routes already exist.
4. Use explicit `Not configured`, `Human required`, or `Unavailable` states when backend capability is absent.

### Phase 3 — Integration and Sentinel surfaces

1. Port catalog/filter/drawer UX to the real connector registry.
2. Port threat-monitoring command-center layout onto real monitoring data.
3. Keep all high-risk actions approval-gated.

### Phase 4 — UX regression and production proof

Required deterministic checks:

- existing workspace/project authorization tests remain green;
- no route permits privilege escalation;
- all environment destinations remain accessible only when authorized;
- no sample metric replaces authoritative project/workspace data;
- keyboard-only route/navigation flow;
- screen-reader landmarks and names;
- drawer focus trap/restore;
- mobile sidebar Escape/backdrop behavior;
- 320px/390px/768px/desktop visual QA;
- light/dark contrast checks if both themes are enabled;
- no console errors;
- production Next.js build;
- secret scan;
- `git diff --check`.

## Non-negotiable invariants

- No Prisma/schema change solely for visual parity.
- No removal of authentication/session architecture.
- No replacement of server authorization with client-only route state.
- No fabricated live metrics.
- No silent connector activation.
- No weakening of fail-closed controls.
- No removal of current video, AI-support, social-media, workspace-owner, or governance capabilities.
- No merge until preview QA proves the new shell preserves current functionality.

## First implementation target

Start with `src/components/workspace/ProjectWorkspaceShell.tsx` plus the `/app/workspace` directory surface. Port the shell/navigation/accessibility model first while keeping all existing server data and authorization contracts unchanged.

Only after that passes tests should module-specific visual surfaces be migrated.
