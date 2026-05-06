# GEM Enterprise Mobile Navigation Reference

## How It Works

The mobile navigation is a hamburger menu that expands to show all 8 main sections. Each section can be expanded to reveal its submenu items with descriptions.

## Mobile Menu Structure

```
┌─────────────────────────────────────┐
│  GEM ENTERPRISE        [X]          │
├─────────────────────────────────────┤
│                                     │
│  ▼ Home                             │
│    • Overview                       │
│    • Platform Highlights            │
│    • Leadership                     │
│    • Client Access                  │
│    • Get Started                    │
│                                     │
│  ▶ Intel                            │
│  ▶ Services                         │
│  ▶ Community                        │
│  ▶ Hub                              │
│  ▶ Resources                        │
│  ▶ Company                          │
│                                     │
├─────────────────────────────────────┤
│  Contact                            │
│  [Client Login]                     │
│  [Get Started]                      │
│                                     │
│  GEM Enterprise is for qualified    │
│  clients only. Access requires      │
│  KYC verification...                │
│                                     │
└─────────────────────────────────────┘
```

## Section States

### Collapsed Section (▶)
Shows section title only. Click to expand.

### Expanded Section (▼)
Shows all submenu items with:
- **Item Title** (cyan highlight if active)
- **Description** (gray text below)
- Gap spacing between items

## Key Features

1. **Active State Detection**
   - Active items highlighted in cyan (#06B6D4)
   - White background for section background
   - Non-active items in white/60 opacity

2. **Smooth Animations**
   - Section expand/collapse smoothly animates
   - Mobile menu slides in from right side
   - Overlay click closes menu

3. **Footer Actions**
   - Contact link
   - Client Login button (outlined)
   - Get Started button (cyan CTA)
   - Compliance notice below

## Navigation Paths

### All Clickable Links

**HOME**
- `/` - Overview
- `/#highlights` - Platform Highlights
- `/company` - Leadership
- `/client-login` - Client Access
- `/get-started` - Get Started

**INTEL**
- `/intel` - Threat Intelligence
- `/intel#reports` - Reports
- `/intel#monitoring` - Monitoring
- `/intel#briefs` - Intel Briefs
- `/developers` - Architecture Specs

**SERVICES**
- `/services#cyber` - Cybersecurity
- `/services#financial` - Financial
- `/services#real-estate` - Real Estate
- `/services#assessments` - Assessments
- `/services#consultations` - Consultations
- `/atr` - Alliance Trust Realty
- `/atr/properties` - Properties
- `/atr/invest` - Investment Platform

**COMMUNITY**
- `/community-hub` - Community Hub
- `/community-hub/opportunities` - Opportunities
- `/community-hub/members` - Members
- `/community-hub/circles` - Circles
- `/community-hub/events` - Events
- `/community-hub/knowledge` - Knowledge
- `/request-access` - Request Access
- `/community-hub#overview` - Community Overview

**HUB**
- `/hub` - Command Center
- `/app/documents` - Documents
- `/app/support` - Support Access
- `/app/requests` - Requests
- `/client-login` - Client Portal

**RESOURCES**
- `/resources#insights` - Market Insights
- `/resources#templates` - Templates
- `/resources#bots` - Bots
- `/intel/news` - News
- `/resources#faq` - FAQ

**COMPANY**
- `/about` - About
- `/company#leadership` - Leadership & Vision
- `/company#board` - Executive Board
- `/company#teams` - Teams
- `/personnel` - Personnel Board

## Mobile Menu Styling

### Color Scheme
- **Background**: Dark navy (`bg-slate-950`)
- **Section Headers**: White text (`text-white`)
- **Active Labels**: Cyan (`text-cyan-300`)
- **Description Text**: White 40% opacity
- **Hover State**: White 5% opacity background

### Spacing
- **Section Gap**: 4px (gap-3)
- **Item Gap**: 16px (gap-4)
- **Padding**: 12px horizontal, 12px vertical
- **Border Radius**: 12px

### Typography
- **Section Headers**: Bold, large text
- **Item Labels**: Bold
- **Descriptions**: Regular weight, smaller size, gray

## Responsive Behavior

- **Mobile (< 768px)**: Full hamburger menu visible
- **Tablet (768px - 1024px)**: Hamburger menu
- **Desktop (> 1024px)**: Horizontal navigation bar

## Testing Checklist

- [ ] Menu opens/closes smoothly
- [ ] Sections expand/collapse correctly
- [ ] Descriptions display below labels
- [ ] Active state highlights work
- [ ] All links navigate correctly
- [ ] Footer buttons are clickable
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable in dark mode
- [ ] No layout shifts when menu opens
- [ ] Close button works on all devices

---

**Last Updated**: 5/6/2026
**Framework**: Next.js 16 + React
**Component**: `src/components/Navigation.tsx`
