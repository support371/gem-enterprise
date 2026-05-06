# GEM Enterprise Navigation & Functionality Map

## Overview
GEM Enterprise is a comprehensive B2B platform with multiple divisions and services for qualified clients. The platform features a dark theme with cyan accents (mobile-first design visible in screenshots).

## Main Navigation Structure

### 1. **Home**
- **Overview** - Platform overview and highlights
- **Platform Highlights** - What GEM Enterprise delivers
- **Leadership** - Leadership and trust signals
- **Client Access** - Access your client account
- **Get Started** - Begin onboarding

### 2. **Intel** (Threat Intelligence & Briefings)
- **Threat Intelligence** - Global threat landscape and briefings
- **Reports** - Published intelligence reports
- **Monitoring** - Continuous threat monitoring
- **Intel Briefs** - Concise intelligence summaries
- **Architecture Specs** - Platform architecture and specs

### 3. **Services** (Enterprise Solutions)
#### Core Services:
- **Cybersecurity** - Enterprise threat protection and response
- **Financial** - Secure financial services and compliance
- **Real Estate** - Real estate security and asset protection
- **Assessments** - Security posture assessments
- **Consultations** - Strategic security consultations

#### ATR Division (Alliance Trust Realty):
- **Alliance Trust Realty** - Real estate investment platform
- **Properties** - ATR property portfolio and listings
- **Investment Platform** - Fractional, full ownership, fund, and REIT vehicles

### 4. **Community** (Vetted Community Hub)
- **Community Hub** - Flagship vetted community experience
- **Opportunities** - Deal flow, mandates, and introductions
- **Members** - Directory of vetted members and advisors
- **Circles** - Private topical working groups
- **Events** - Summits, salons, and working sessions
- **Knowledge** - Member-only research and playbooks
- **Request Access** - Apply to join the GEM Community Hub
- **Community Overview**

### 5. **Hub** (Operations & Support)
- **Command Center** - Operational command and control
- **Documents** - Platform documents and agreements
- **Support Access** - Connect with enterprise support
- **Requests** - Submit service requests
- **Client Portal** - Authenticated client access

### 6. **Resources** (Knowledge & Tools)
- **Market Insights** - Intelligence and market analysis
- **Templates** - Downloadable security templates
- **Bots** - Automated intelligence tools
- **News** - Latest industry news
- **FAQ** - Frequently asked questions

### 7. **Company** (Organization)
- **About** - About GEM Enterprise
- **Leadership & Vision** - Executive leadership and mission
- **Executive Board** - Board of directors
- **Teams** - Expert teams and divisions
- **Personnel Board** - GEM & ATR personnel directory with AI Overseer

### 8. **Footer CTA & Auth**
- **Contact** - Contact page
- **Client Login** - Authentication portal
- **Get Started** (Button) - Main CTA in cyan
- Qualification notice: "GEM Enterprise is for qualified clients only. Access requires KYC verification and compliance approval."

## Key Features Found in Codebase

### Authentication & KYC
- `/kyc/` routes for individual, business, trust, family-office KYC
- `/app/` authenticated dashboard
- `/access/` protected access flows
- Role-based admin areas

### Admin Dashboard
- User management
- Campaign management
- News ingestion
- KYC approvals
- Allocations and approvals

### Application Pages
- Authenticated app dashboard
- Community hub with members/events/circles
- ATR (Alliance Trust Realty) investment platform
- Portfolio management
- Document management
- Compliance tracking

### API Architecture
- `/api/auth/` - Authentication
- `/api/kyc/` - KYC processes
- `/api/support/` - Support & escalation
- `/api/admin/` - Admin operations
- `/api/intel/news` - News feeds
- `/api/portfolios/` - Investment portfolios
- `/api/meetings/`, `/api/notifications/`, `/api/documents/`

### AI Integration
- AI Chat widget (`AIChatWidget.tsx`)
- Assistant API endpoints
- Message/session management

## Design & Tech Stack
- **Framework:** Next.js 16
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Prisma + PostgreSQL
- **Authentication:** Custom JWT-based auth with bcryptjs
- **Theme:** Dark mode with cyan (#00B8D4) accents
- **Components:** Radix UI primitives

## Status
Mobile navigation structure from main branch mapped. Ready for feature development or customization.
