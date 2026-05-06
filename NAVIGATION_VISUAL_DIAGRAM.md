# GEM Enterprise Navigation - Visual Diagram

## Complete Navigation Tree (59 Items)

```
GEM ENTERPRISE NAVIGATION
│
├── HOME (5 items)
│   ├── Overview → /
│   ├── Platform Highlights → /#highlights
│   ├── Leadership → /company
│   ├── Client Access → /client-login
│   └── Get Started → /get-started
│
├── INTEL (5 items)
│   ├── Threat Intelligence → /intel
│   ├── Reports → /intel#reports
│   ├── Monitoring → /intel#monitoring
│   ├── Intel Briefs → /intel#briefs
│   └── Architecture Specs → /developers
│
├── SERVICES (8 items)
│   ├── Cybersecurity → /services#cyber
│   ├── Financial → /services#financial
│   ├── Real Estate → /services#real-estate
│   ├── Assessments → /services#assessments
│   ├── Consultations → /services#consultations
│   ├── Alliance Trust Realty → /atr
│   ├── Properties → /atr/properties
│   └── Investment Platform → /atr/invest
│
├── COMMUNITY (8 items)
│   ├── Community Hub → /community-hub
│   ├── Opportunities → /community-hub/opportunities
│   ├── Members → /community-hub/members
│   ├── Circles → /community-hub/circles
│   ├── Events → /community-hub/events
│   ├── Knowledge → /community-hub/knowledge
│   ├── Request Access → /request-access
│   └── Community Overview → /community-hub#overview
│
├── HUB (5 items)
│   ├── Command Center → /hub
│   ├── Documents → /app/documents
│   ├── Support Access → /app/support
│   ├── Requests → /app/requests
│   └── Client Portal → /client-login
│
├── RESOURCES (5 items)
│   ├── Market Insights → /resources#insights
│   ├── Templates → /resources#templates
│   ├── Bots → /resources#bots
│   ├── News → /intel/news
│   └── FAQ → /resources#faq
│
├── COMPANY (5 items)
│   ├── About → /about
│   ├── Leadership & Vision → /company#leadership
│   ├── Executive Board → /company#board
│   ├── Teams → /company#teams
│   └── Personnel Board → /personnel
│
└── FOOTER (3 items)
    ├── Contact → /contact
    ├── Client Login → /client-login
    └── Get Started → /get-started
```

## Mobile Menu Interaction Flow

```
┌─────────────────────────────────────────────┐
│                  APP SCREEN                 │
│                                             │
│  GEM ENTERPRISE      [☰ Menu Icon]         │
│                                             │
│  [Main Content Area]                       │
│                                             │
└─────────────────────────────────────────────┘
         ↓ (User clicks menu icon)
┌─────────────────────────────────────────────┐
│     MOBILE NAVIGATION DRAWER (Right)        │
│ ┌───────────────────────────────────────┐  │
│ │ GEM ENTERPRISE         [X]            │  │
│ ├───────────────────────────────────────┤  │
│ │                                       │  │
│ │ ▼ HOME (EXPANDED)                    │  │
│ │   • Overview                          │  │
│ │     Platform overview and highlights  │  │
│ │                                       │  │
│ │   • Platform Highlights               │  │
│ │     What GEM Enterprise delivers      │  │
│ │                                       │  │
│ │   • Leadership                        │  │
│ │     Leadership and trust signals      │  │
│ │                                       │  │
│ │   • Client Access                     │  │
│ │     Access your client account        │  │
│ │                                       │  │
│ │   • Get Started                       │  │
│ │     Begin onboarding                  │  │
│ │                                       │  │
│ │ ▶ INTEL                               │  │
│ │ ▶ SERVICES                            │  │
│ │ ▶ COMMUNITY                           │  │
│ │ ▶ HUB                                 │  │
│ │ ▶ RESOURCES                           │  │
│ │ ▶ COMPANY                             │  │
│ │                                       │  │
│ ├───────────────────────────────────────┤  │
│ │ CONTACT                               │  │
│ │ [CLIENT LOGIN]                        │  │
│ │ [GET STARTED] ← CYAN CTA BUTTON      │  │
│ │                                       │  │
│ │ GEM Enterprise is for qualified...    │  │
│ │                                       │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
    ↓ (User clicks INTEL section)
┌─────────────────────────────────────────────┐
│     MOBILE NAVIGATION DRAWER (Updated)      │
│ ┌───────────────────────────────────────┐  │
│ │ GEM ENTERPRISE         [X]            │  │
│ ├───────────────────────────────────────┤  │
│ │                                       │  │
│ │ ▼ HOME (COLLAPSED)                   │  │
│ │ ▼ INTEL (NOW EXPANDED)                │  │
│ │   • Threat Intelligence               │  │
│ │     Global threat landscape...        │  │
│ │                                       │  │
│ │   • Reports                           │  │
│ │     Published intelligence reports    │  │
│ │                                       │  │
│ │   • Monitoring                        │  │
│ │     Continuous threat monitoring      │  │
│ │                                       │  │
│ │   • Intel Briefs                      │  │
│ │     Concise intelligence summaries    │  │
│ │                                       │  │
│ │   • Architecture Specs                │  │
│ │     Platform architecture and specs   │  │
│ │                                       │  │
│ │ ▶ SERVICES                            │  │
│ │ ▶ COMMUNITY                           │  │
│ │ ▶ HUB                                 │  │
│ │ ▶ RESOURCES                           │  │
│ │ ▶ COMPANY                             │  │
│ │                                       │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
    ↓ (User clicks an item, e.g., "Threat Intelligence")
         Menu closes automatically
         Page navigates to /intel
         User sees intel page content
```

## Section Expansion/Collapse Animation

```
COLLAPSED STATE:
┌─────────────────────────────────────┐
│ ▶ SERVICES                          │
└─────────────────────────────────────┘
    (Click)
         ↓
    (Smooth animation - height expands)
         ↓
EXPANDED STATE:
┌─────────────────────────────────────┐
│ ▼ SERVICES                          │
│   • Cybersecurity                   │
│     Enterprise threat protection... │
│                                     │
│   • Financial                       │
│     Secure financial services...    │
│                                     │
│   • Real Estate                     │
│     Real estate security...         │
│                                     │
│   • Assessments                     │
│     Security posture assessments    │
│                                     │
│   • Consultations                   │
│     Strategic security consultations│
│                                     │
│   • Alliance Trust Realty           │
│     Real estate investment...       │
│                                     │
│   • Properties                      │
│     ATR property portfolio...       │
│                                     │
│   • Investment Platform             │
│     Fractional, full ownership...   │
└─────────────────────────────────────┘
    (Click again)
         ↓
    (Smooth animation - height collapses)
         ↓
COLLAPSED STATE
```

## Component Structure

```
Navigation Component (src/components/Navigation.tsx)
│
├── State Management
│   ├── expandedSections (useState)
│   ├── mobileMenuOpen (useState)
│   └── currentPath (usePathname)
│
├── Data Structure
│   └── navSections: NavSection[]
│       └── items: NavItem[]
│           ├── label: string
│           ├── path: string
│           └── description?: string
│
├── Rendered Elements
│   ├── Desktop Navigation (conditional)
│   ├── Mobile Menu Icon
│   └── Mobile Menu Drawer
│       ├── Mobile Menu Container
│       ├── Logo/Title
│       ├── Section List
│       │   ├── Section Header (expandable)
│       │   └── Section Items (visible when expanded)
│       │       └── Item Link
│       │           ├── Item Label
│       │           └── Item Description (if present)
│       └── Footer
│           ├── Contact Link
│           ├── Client Login Button
│           ├── Get Started Button (CTA)
│           └── Compliance Notice
│
└── Event Handlers
    ├── toggleSection(sectionLabel)
    ├── toggleMobileMenu()
    ├── closeMobileMenu()
    ├── isActive(path)
    └── handleItemClick()
```

## Route Mapping Diagram

```
GEM ENTERPRISE ROUTES
│
├── PUBLIC ROUTES (No Auth Required)
│   ├── / → Home
│   ├── /intel → Threat Intelligence
│   ├── /intel/news → News Feed
│   ├── /services → Enterprise Services
│   ├── /about → About Company
│   ├── /company → Company Info
│   ├── /contact → Contact Form
│   ├── /developers → Developer Portal
│   ├── /personnel → Personnel Directory
│   ├── /resources → Resources Library
│   ├── /community-hub → Community Hub
│   ├── /get-started → Onboarding Flow
│   └── /request-access → Request Access
│
├── AUTHENTICATION ROUTES
│   ├── /client-login → Client Login
│   ├── /kyc/individual → Individual KYC
│   ├── /kyc/business → Business KYC
│   ├── /kyc/trust → Trust KYC
│   ├── /kyc/family-office → Family Office KYC
│   └── /kyc/status → KYC Status
│
├── AUTHENTICATED DASHBOARD (/app/*)
│   ├── /app/dashboard → User Dashboard
│   ├── /app/admin → Admin Panel
│   ├── /app/documents → Documents
│   ├── /app/support → Support Ticket
│   ├── /app/requests → Service Requests
│   ├── /app/portfolios → Portfolio Management
│   ├── /app/community → Community Access
│   ├── /app/messages → Messaging
│   ├── /app/meetings → Meetings
│   └── /app/notifications → Notifications
│
├── COMMUNITY HUB (/community-hub/*)
│   ├── /community-hub → Hub Main
│   ├── /community-hub/members → Members Directory
│   ├── /community-hub/opportunities → Opportunities
│   ├── /community-hub/circles → Circles
│   ├── /community-hub/events → Events
│   ├── /community-hub/knowledge → Knowledge Base
│   └── /community-hub/messages → Community Messaging
│
├── ALLIANCE TRUST REALTY (/atr/*)
│   ├── /atr → ATR Main
│   ├── /atr/properties → Properties Listing
│   ├── /atr/invest → Investment Platform
│   ├── /atr/packages → Packages
│   ├── /atr/affiliate → Affiliate Program
│   ├── /atr/dashboard → ATR Dashboard
│   └── /atr/demo → Demo Environment
│
├── HUB SECTION (/hub/*)
│   ├── /hub → Command Center
│   ├── /hub/threat-command → Threat Management
│   ├── /hub/compliance → Compliance Center
│   └── /hub/research → Research Lab
│
├── DEVELOPER PORTAL (/developers/*)
│   ├── /developers → Portal Main
│   ├── /developers/docs → API Docs
│   ├── /developers/security → Security Docs
│   └── /developers/webhooks → Webhooks
│
└── API ROUTES (/api/*)
    ├── /api/auth/login
    ├── /api/auth/logout
    ├── /api/users
    ├── /api/kyc
    ├── /api/services
    ├── /api/community
    ├── /api/atr
    ├── /api/compliance
    ├── /api/webhooks
    └── [40+ more endpoints]
```

## Styling & Colors

```
COLOR SCHEME:
├── Dark Mode (Default)
│   ├── Background: Dark Navy (#0f172a, slate-950)
│   ├── Text Primary: White (#ffffff)
│   ├── Text Secondary: White 60% (#ffffff99)
│   ├── Text Tertiary: White 40% (#ffffff66)
│   ├── Accent: Cyan (#06B6D4, cyan-300)
│   ├── Hover: White 5% (#ffffff0d)
│   ├── Success: Green (#22c55e)
│   ├── Warning: Yellow (#eab308)
│   ├── Error: Red (#ef4444)
│   └── Border: White 20% (#ffffff33)
│
└── Spacing Scale
    ├── 1 unit = 4px
    ├── Small = 2 units = 8px
    ├── Medium = 3 units = 12px
    ├── Large = 4 units = 16px
    └── XLarge = 6 units = 24px
```

## Responsive Breakpoints

```
BREAKPOINTS:
│
├── Mobile (< 640px)
│   ├── Full screen width navigation
│   ├── Hamburger menu icon visible
│   ├── Drawer navigation from right
│   └── Touch-friendly 44x44px targets
│
├── Tablet (640px - 1024px)
│   ├── Hamburger menu still visible
│   ├── Some horizontal space available
│   └── Drawer navigation from right
│
└── Desktop (> 1024px)
    ├── Horizontal navigation bar
    ├── Dropdown menus
    ├── Hamburger menu hidden
    └── Mouse-friendly interactions
```

## Data Flow Diagram

```
User Input
    │
    ├─ Click Menu Icon → openMobileMenu() → mobileMenuOpen = true
    │
    ├─ Click Section → toggleSection(label) → expandedSections[label] = !value
    │
    ├─ Click Item → navigate(path) → closeMobileMenu() → router.push(path)
    │
    └─ Component Render
         ├─ Read navSections array
         ├─ Apply active state styling (usePathname)
         ├─ Show/hide descriptions
         ├─ Render mobile/desktop layout
         └─ Display navigation UI
```

---

**Created**: 5/6/2026
**For**: GEM Enterprise Navigation (59 items)
**Version**: Mobile-First Responsive Design
