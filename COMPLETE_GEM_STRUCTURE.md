# GEM ENTERPRISE - COMPLETE NAVIGATION & FUNCTIONALITY MAP

**Last Updated:** May 6, 2026  
**Project:** gem-enterprise (Org: support371)  
**Framework:** Next.js 16 + Prisma + shadcn/ui  
**Database:** Prisma ORM (PostgreSQL)

---

## MARKETING/PUBLIC PAGES

### Main Landing Pages
- `/` - **Home/Landing**
- `/about` - **About GEM Enterprise**
- `/company` - **Company Overview**
- `/contact` - **Contact Form**

### Decision/Access Pages
- `/decision/pending` - KYC Pending Status
- `/decision/manual-review` - Manual Review Pending
- `/decision/approved` - Access Approved
- `/decision/rejected` - Access Denied

### Authentication
- `/client-login` - Client Portal Login
- `/access/continue` - Access Continuation
- `/eligibility` - Eligibility Check
- `/compliance-notice` - Compliance Notification

---

## NAVIGATION MENU STRUCTURE (From Images)

### HOME SECTION
**URL:** `/`  
**Submenu Items:**
- Overview - Platform overview and highlights
- Platform Highlights - What GEM Enterprise delivers
- Leadership - Leadership and trust signals
- Client Access - Access your client account
- Get Started - Begin onboarding

### INTEL SECTION
**URL:** `/intel`  
**Pages:** `/intel/page.tsx`, `/intel/news/page.tsx`  
**Submenu Items:**
- Threat Intelligence - Global threat landscape and briefings
- Reports - Published intelligence reports
- Monitoring - Continuous threat monitoring
- Intel Briefs - Concise intelligence summaries
- Architecture Specs - Platform architecture and specs

### SERVICES SECTION
**URL:** `/app/products` or `/app/services`  
**Pages:** `/app/products/page.tsx`, `/app/products/cyber/page.tsx`, `/app/products/financial/page.tsx`, `/app/products/real-estate/page.tsx`  
**Submenu Items:**
- Cybersecurity - Enterprise threat protection and response
- Financial - Secure financial services and compliance
- Real Estate - Real estate security and asset protection
- Assessments - Security posture assessments
- Consultations - Strategic security consultations
- **Alliance Trust Realty (ATR Division)**
  - Real estate investment platform
  - `/app/services` links to ATR services
  - Properties - ATR property portfolio and listings
  - Investment Platform - Fractional, full ownership, fund, and REIT vehicles

### COMMUNITY SECTION
**URL:** `/community` (public), `/community-hub` (authenticated)  
**Pages:** `/community/page.tsx`, `/community-hub/page.tsx`  
**Public Submenu (from `/community`):**
- Community Hub - Flagship vetted community experience
- Opportunities - Deal flow, mandates, and introductions
- Members - Directory of vetted members and advisors
- Circles - Private topical working groups
- Events - Summits, salons, and working sessions
- Knowledge - Member-only research and playbooks
- Request Access - Apply to join the GEM Community Hub
- Community Overview - Overview of community features

**Authenticated Submenu (from `/community-hub`):**
- `/community-hub` - Main Hub Page
- `/community-hub/circles` - Private Groups
- `/community-hub/events` - Community Events
- `/community-hub/knowledge` - Research & Playbooks
- `/community-hub/members` - Member Directory
- `/community-hub/messages` - Direct Messaging
- `/community-hub/opportunities` - Deal Flow
- `/community-hub/profile` - Member Profile
- `/community-hub/requests` - Access Requests
- `/community-hub/settings` - Settings

### HUB SECTION (Operations Center)
**URL:** `/hub`  
**Submenu Items:**
- Command Center - Operational command and control
- Documents - Platform documents and agreements
- Support Access - Connect with enterprise support
- Requests - Submit service requests
- Client Portal - Authenticated client access

**Authenticated Hub Features (`/app`):**
- `/app/dashboard` - Dashboard/Overview
- `/app/documents` - Document Management
- `/app/support` - Support Tickets
- `/app/requests` - Service Requests
- `/app/workspace` - Workspace Management

### RESOURCES SECTION
**URL:** `/resources`  
**Pages:** (implied submenu structure)  
**Submenu Items:**
- Market Insights - Intelligence and market analysis
- Templates - Downloadable security templates
- Bots - Automated intelligence tools
- News - Latest industry news
- FAQ - Frequently asked questions

### COMPANY SECTION
**URL:** `/company`  
**Pages:** `/company/page.tsx`  
**Submenu Items:**
- About - About GEM Enterprise
- Leadership & Vision - Executive leadership and mission
- Executive Board - Board of directors
- Teams - Expert teams and divisions
- Personnel Board - GEM & ATR personnel directory with AI Overseer

---

## AUTHENTICATED DASHBOARD (`/app/*`)

### Main Pages
- `/app/dashboard` - **Dashboard/Home**
- `/app/profile` - **User Profile**
- `/app/profiles` - **Profiles Directory**
- `/app/settings` - **User Settings**
- `/app/notifications` - **Notifications**
- `/app/messages` - **Direct Messages**
- `/app/meetings` - **Scheduled Meetings**

### Admin Panel (`/app/admin`)
- `/app/admin` - Admin Dashboard
- `/app/admin/users` - User Management
- `/app/admin/campaigns` - Campaign Management
- `/app/admin/campaigns/new` - Create Campaign
- `/app/admin/news` - News Management
- `/app/admin/kyc` - KYC Administration
- `/app/admin/approvals` - Approval Management
- `/app/admin/allocations` - Allocation Management

### Product Management
- `/app/products` - **Products Overview**
- `/app/products/cyber` - **Cybersecurity Products**
- `/app/products/financial` - **Financial Products**
- `/app/products/real-estate` - **Real Estate Products**
- `/app/services` - **All Services**

### Compliance & Security
- `/app/compliance` - **Compliance Dashboard**
- `/app/security` - **Security Settings**

### Portfolio Management
- `/app/my-portfolio` - **Personal Portfolio**
- `/app/portfolios` - **All Portfolios**
- `/app/portfolios/[portfolioId]` - **Portfolio Details**
- `/app/savings-vault` - **Savings Vault**

### Support & Operations
- `/app/support` - **Support Center**
- `/app/requests` - **Service Requests**
- `/app/documents` - **Document Repository**
- `/app/community` - **Community Hub** (in-app)

---

## ALLIANCE TRUST REALTY (ATR) DIVISION

**Base URL:** `/atr`  
**Layout:** `/atr/layout.tsx`

### Main Pages
- `/atr` - **ATR Home/Landing**
- `/atr/about` - **About Alliance Trust Realty**
- `/atr/properties` - **Property Listings**
- `/atr/dashboard` - **ATR Dashboard** (authenticated)
- `/atr/demo/dashboard` - **Demo Dashboard**

### Investment & Education
- `/atr/invest` - **Invest in Properties**
- `/atr/buy` - **Buy Properties**
- `/atr/sell` - **Sell Properties**
- `/atr/investment-plan` - **Investment Planning**
- `/atr/packages` - **Investment Packages**
- `/atr/for-beginners` - **Beginner's Guide**
- `/atr/for-beginners/strategy-framework` - **Strategy Framework**

### Business Models
- `/atr/enterprise` - **Enterprise Solutions**
- `/atr/affiliate` - **Affiliate Program**
- `/atr/qfs` - **QFS** (Qualified Financial Services)

---

## KYC/ONBOARDING FLOW

**Base URL:** `/kyc`  
**Layout:** `/kyc/layout.tsx`

### Onboarding Steps
1. `/kyc/start` - **Start KYC**
2. `/kyc/individual` - **Individual KYC Form**
3. `/kyc/business` - **Business KYC Form**
4. `/kyc/trust` - **Trust KYC Form**
5. `/kyc/family-office` - **Family Office KYC Form**
6. `/kyc/upload` - **Document Upload**
7. `/kyc/review` - **Review KYC Data**
8. `/kyc/status` - **KYC Status**

### Decision Pages
- `/decision/pending` - Decision Pending
- `/decision/approved` - Approved
- `/decision/rejected` - Rejected
- `/decision/manual-review` - Manual Review

---

## DEVELOPER/TECHNICAL PAGES

### Documentation
- `/docs` - **Documentation Home**
- `/docs/quickstart` - **Quickstart Guide**
- `/docs/authentication` - **Auth Documentation**
- `/docs/changelog` - **Changelog**
- `/docs/rate-limits` - **Rate Limits**
- `/docs/errors` - **Error Documentation**
- `/docs/guides` - **Technical Guides**
- `/docs/architecture` - **Architecture**
- `/docs/security` - **Security Docs**
- `/docs/webhooks` - **Webhook Docs**

### API Documentation by Category
- `/docs/api/identity` - Identity API
- `/docs/api/threats` - Threats API
- `/docs/api/assets` - Assets API
- `/docs/api/analytics` - Analytics API
- `/docs/api/compliance` - Compliance API

### SDK Documentation
- `/docs/sdk/node` - Node.js SDK
- `/docs/sdk/python` - Python SDK
- `/docs/sdk/go` - Go SDK
- `/docs/sdk/java` - Java SDK
- `/docs/sdk/dotnet` - .NET SDK
- `/docs/sdk/ruby` - Ruby SDK

### Developer Tools
- `/developers` - **Developer Portal**
- `/developers/security` - **Security Management**
- `/developers/webhooks` - **Webhook Management**
- `/api-explorer` - **API Explorer** (interactive)

---

## FOOTER PAGES

- `/get-started` - Get Started CTA
- `/portal` - Client Portal Access
- `/assets` - Asset Management
- `/personnel` - Personnel Directory
- `/admin` - Admin Portal
- `/forbidden` - Access Denied
- `/eligibility` - Eligibility Checker

---

## API ENDPOINTS

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get Session

### Admin APIs
- `GET /api/admin/users` - User Management
- `GET|POST /api/admin/kyc` - KYC Administration
- `GET|POST /api/admin/campaigns` - Campaign Management
- `GET|POST /api/admin/news/sources` - News Source Management
- `POST /api/admin/news/ingest` - News Ingestion
- `GET /api/admin/stats` - Admin Statistics

### Core Features
- `GET|POST /api/documents` - Document Management
- `GET|POST /api/requests` - Service Requests
- `GET|POST /api/notifications` - Notifications
- `GET|POST /api/meetings` - Meeting Management
- `GET|POST /api/portfolios` - Portfolio Management
- `GET|POST /api/entitlements` - User Entitlements

### Intel & Market Data
- `GET /api/intel/news` - News Feed
- `GET /api/intel/news/categories` - News Categories

### KYC & Compliance
- `POST /api/kyc/submit` - Submit KYC
- `POST /api/kyc/documents` - Upload KYC Docs
- `GET|POST /api/kyc/route` - KYC Management

### Community & Social
- `GET /api/routes` - Routes/Navigation
- `POST /api/contact` - Contact Form

### Support & Services
- `POST /api/booking/create` - Create Booking
- `POST /api/support/escalate` - Escalate Support
- `GET|POST /api/support/session/start` - Start Support Session
- `POST /api/support/session/consent` - Support Consent
- `GET|POST /api/support/message` - Support Messages

### Assistant/AI
- `POST /api/assistant/message` - Chat Message
- `GET|POST /api/assistant/session` - Chat Session

### Developer Keys & Webhooks
- `GET|POST /api/developers/keys` - API Key Management
- `DELETE /api/developers/keys/[id]` - Delete Key
- `GET|POST /api/developers/webhooks` - Webhook Management

### Admin Intake
- `POST /api/intake/submit` - Submit Intake Form

### Cron/Background Jobs
- `GET /api/cron/news-ingest` - News Ingestion Job

### Health Check
- `GET /api/health` - Health Check

---

## KEY INTEGRATIONS & SYSTEMS

### Authentication
- JWT Token Management (jose)
- bcryptjs for password hashing
- Session-based auth
- Custom auth logic with `/api/auth/*`

### AI/Intelligent Features
- AI SDK v6 Integration
- Assistant/Chat functionality (`/api/assistant/*`)
- Automated AI tools (Bots in Resources)

### Data Management
- Prisma ORM
- PostgreSQL database
- News ingestion system (cron jobs)
- Document management

### UI Components
- shadcn/ui components
- Radix UI primitives
- Lucide React icons
- Recharts for data visualization

### Notifications & Communication
- Email notifications (Nodemailer)
- In-app notifications
- Support tickets
- Direct messaging system

### Additional Features
- Dark mode support (next-themes)
- Analytics (Vercel Analytics & Speed Insights)
- Markdown rendering (react-markdown)
- Form validation (React Hook Form + Zod)
- Date utilities (date-fns)
- Carousel components (Embla)

---

## DIRECTORY SUMMARY

```
/src
├── /app           (45+ pages, all routing)
├── /api           (40+ endpoints)
├── /components    (Reusable UI components)
├── /lib           (Utilities, helpers, auth, db)
├── /hooks         (Custom React hooks)
├── /types         (TypeScript types)
├── /integrations  (Third-party integrations)
└── /test          (Test utilities)
```

---

## NOTABLE FEATURES

✅ **Multi-tenant Admin Panel** - User, campaign, news, KYC, allocation management  
✅ **Community Hub** - Vetted member directory, events, circles, opportunities  
✅ **KYC Onboarding** - Individual, business, trust, family office flows  
✅ **Alliance Trust Realty** - Real estate investment platform (sub-brand)  
✅ **Developer Portal** - API documentation, key management, webhooks  
✅ **Intelligence Feed** - Real-time news, threat intelligence, market insights  
✅ **Service Marketplace** - Cybersecurity, financial, real estate services  
✅ **Support System** - Ticketing, escalation, messaging  
✅ **Portfolio Management** - Personal and shared portfolios, savings vault  
✅ **Compliance Framework** - KYC, compliance checks, audit logs  

---

## NAVIGATION ENTRY POINTS

1. **Public Landing** → `/` (About, Contact, Products overview)
2. **Client Login** → `/client-login`
3. **Onboarding** → `/kyc/start`
4. **Dashboard** → `/app/dashboard` (auth required)
5. **Community** → `/community` (public) or `/community-hub` (auth)
6. **ATR** → `/atr` (public) or `/atr/dashboard` (auth)
7. **Developers** → `/developers` or `/docs`
8. **Admin** → `/app/admin` (admin role required)
