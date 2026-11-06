# AIR Lab Website Context & Architectural Blueprint

> **Target Audience:** Future AI coding agents and frontend engineers tasked with revamping the visual UI while maintaining or elevating the underlying UX, information architecture, page routing, and interaction paradigms.
>
> **Live Production Reference:** [https://airlab-website-peach-sigma.vercel.app](https://airlab-website-peach-sigma.vercel.app)  
> **Repository:** [https://github.com/hkh034553-bot/airlab-website](https://github.com/hkh034553-bot/airlab-website)

---

## 1. Executive Summary & Objective

The Artificial Intelligence Research Laboratory (AIR Lab) website at the Department of Computer Science & Information Technology (CSIT), NED University of Engineering & Technology, serves prospective students, academic researchers, corporate partners, and international collaborators.

**The Current State:**
- **The UX (User Experience) is highly validated and praised:** The information architecture, routing hierarchy, interactive drawers, modal forms, research tagging, recency sorting, and multi-track vacancy portals meet real-world institutional needs.
- **The UI (Visual Polish) requires an overhaul:** Earlier iterations suffered from "vibecoded" clunky padded rectangular cards, inconsistent framing, and artificial decorative labels (e.g., redundant banners, over-nested cards, heavy borders). The objective for a successor agent is to **preserve 100% of the functional logic and UX routes while redesigning the aesthetic presentation to look world-class, clean, editorial, and effortless (comparable to AI labs like AllenAI / OpenAI / DeepMind)**.

---

## 2. Core UX Principles & Behavioral Rules

Any agent rebuilding or restyling this application **must adhere to these UX fundamentals**:

### 2.1. Strict Redirection & Semantic Information Architecture
Navigation is split logically into three main domains: **Research**, **People**, and **About**, complemented by a global **Apply Now** CTA.

```
/ (Home)
├── Research
│   ├── /projects (Filtered project directory, category chips, active badges)
│   ├── /grants (Active research funding, award sums, granting bodies)
│   ├── /publications (Peer-reviewed papers sorted by recency)
│   └── /publications#blogs (Technical deep-dives and engineering dispatches)
├── People
│   ├── /team?tab=faculty (Principal Investigators & Faculty Leads)
│   ├── /team?tab=interns (Current Research Interns & Scholars)
│   ├── /team?tab=previous (Past Interns & Alumni Trajectories)
│   ├── /interns (Fellowship program curriculum, eligibility & requirements)
│   └── /performers (Monthly research spotlights and award milestones)
├── About
│   ├── /about (Lab charter, vision, pillars, facilities)
│   ├── /collaborations (Industry partnerships & academic MoUs)
│   └── /gallery (Campus lab imagery, workshops, hardware racks)
└── Actions & Inquiries
    ├── /contact (Contact form, department address, coordinates)
    └── Global Vacancy Modal (Triggered by "Apply Now" anywhere on the site)
```

### 2.2. Intentional & Accessible Interactions (No Hover Traps)
- **Click-Only Side Drawers:** Secondary quick portals (such as "Explore Projects" and "Lab Members" quick drawers) must open **strictly on click**, never on mouse hover. Hover triggers cause accidental drawer expansion and disrupt user reading flow.
- **Carousel Playback UX:** The hero image carousel auto-advances on a continuous timer (default 5000ms) with a bottom progress indicator. It **must pause on mouse hover** so users can examine lab hardware/stations undisturbed, and **resume on mouse leave**.
- **Preserve Background Scroll Lock:** When modals (e.g., `StudentApplicationModal`) open, the underlying `<body>` scroll must be locked (`overflow: hidden`), and the modal itself must be fully responsive, vertically scrollable, and never cropped regardless of screen height.

### 2.3. Direct, Uncluttered Labeling (Eliminate Fluff)
- **Do not add unnecessary label fluff:** Avoid cluttering titles with decorative metadata like `"DISPATCHES & ANNOUNCEMENTS • Recent Updates"`. Direct, self-evident headings (`"Recent Updates"`, `"Core Research Areas"`) preserve clarity.
- **Navbar Redundancy Prevention:** Never repeat `"NED UNIVERSITY"` or `"AIR LAB"` text labels right under the navbar if the navbar branding is already sticky and visible. In the hero, let the iconic mark and the punchy slogan speak for themselves.

### 2.4. Recency & Temporal Truth
- In research listings (`/publications`, `/projects`, `/grants`), **always enforce strict descending order by recency** (latest year/month first). Seed data and API responses must never surface outdated papers above recent breakthroughs.

### 2.5. Single Global Application Flow
- The **"Apply Now"** button is universally accessible in the navbar header, the hero action bar, the announcement ribbon, and the footer. It must always trigger the standardized multi-step application modal (`StudentApplicationModal`), allowing applicants to select their track (Undergraduate Fellowship, Graduate Research, or Visiting Internship).

---

## 3. Current System Architecture & File Map

```
c:\Users\hasan\Downloads\air lab new\
├── index.html                           # Root HTML entry with meta headers
├── package.json                         # Dependencies (React 19, Vite 8, Tailwind v4, Lucide)
├── vite.config.ts                       # Vite configuration with sync-carousel-images plugin
├── public/
│   ├── carousel-images/                 # Real high-resolution photography of the lab
│   └── lab-photos/                      # Hardware, GPU rigs, and workspace photos
├── src/
│   ├── index.css                        # CSS theme variables & typography definition
│   ├── App.tsx                          # React Router route registry
│   ├── assets/                          # SVG & PNG logos (air-lab-logo.png, air-lab-mark.png)
│   ├── components/
│   │   ├── Layout.tsx                   # Sticky nav, top ribbon, mega dropdowns, footer
│   │   ├── HeroBackgroundSlideshow.tsx  # Full-width cinematic lab photography carousel
│   │   ├── ParticleField.tsx            # White canvas interactive particle network
│   │   ├── QuickDrawer.tsx              # Click-to-open sliding research/member directory
│   │   ├── StudentApplicationModal.tsx  # Responsive multi-field applicant portal
│   │   ├── ThemeToggle.tsx              # Theme switcher control
│   │   ├── SponsorsGrid.tsx             # Funding agencies & industry partners
│   │   ├── ContactSection.tsx           # Contact form & department physical coordinates
│   │   └── ui/                          # Button, Modal, SectionReveal, etc.
│   └── pages/
│       ├── Home.tsx                     # Landing page (Hero, Updates, About, Thrusts)
│       ├── Projects.tsx                 # Searchable/filterable project matrix
│       ├── Grants.tsx                   # Funding amounts, agencies, PIs
│       ├── Publications.tsx             # Peer-reviewed bibliography + #blogs section
│       ├── Team.tsx                     # Faculty, active interns, past fellows tabs
│       ├── Interns.tsx                  # Fellowship guidelines, tracks, requirements
│       ├── Performers.tsx               # Performer of the month archive
│       ├── About.tsx                    # Lab charter, vision, equipment
│       ├── Collaborations.tsx           # Academic & corporate partners
│       ├── Gallery.tsx                  # Photo gallery of lab & events
│       └── Contact.tsx                  # Direct inquiry form & location
```

---

## 4. UI Deficiencies to Fix in the Next Design Iteration

If you are tasked with upgrading the UI, focus on these visual flaws while preserving all UX logic:

1. **Avoid "Padded Rectangle Syndrome":**  
   Do not wrap every section, hero headline, or update rail in heavy rounded rectangular cards with thick multi-colored borders. Use generous whitespace, refined typography hierarchy, and subtle hair-thin borders (`1px solid rgba(0,0,0,0.08)` or subtle surface shifts) instead.
2. **Hero Presentation:**  
   The hero must span **100% of the screen width** horizontally. Keep the photography natural and bright without muddy filters. Use a high-contrast white logo mark (`brightness-0 invert`) and a punchy 4-word slogan (`"Where Intelligence Meets Engineering."`).
3. **Contrast on Light Canvas:**  
   The background canvas is pure white (`#FFFFFF`) to ensure maximum legibility and accessibility. Elevated surfaces should use soft, tinted neutral backgrounds rather than harsh solid colors.
4. **Typography Consistency:**  
   Use clean, modern sans-serif typography (`Manrope` for body copy, `Space Grotesk` or `Plus Jakarta Sans` for editorial headings). Maintain strict typographic hierarchy: `h1` (48-64px), `h2` (30-36px), body (14-16px), micro-labels (11-12px uppercase tracked).
5. **Color Themes:**  
   The application features two clean palettes:
   - **Deep Violet (Default):** Monochromatic deep violet (`#7B2CBF` primary accent, `#10002B` deep ink dark bands, crisp `#FFFFFF` canvas).
   - **Soft Pastels:** Subtle lilac/soft blue tones with high contrast text.

---

## 5. Instructions for the Successor Agent

When prompting a successor agent to overhaul the website, provide this prompt:

> *"Read `context.md` completely. Keep all page routes (`/projects`, `/grants`, `/publications`, `/team`, `/interns`, `/performers`, `/about`, etc.), all modals, drawers, and form validation exactly as they are. Maintain the full-width cinematic hero carousel, recency sorting, and pure white canvas. Your sole task is to elevate the UI to a world-class, premium research lab aesthetic (clean whitespace, beautiful typography, subtle elevation, no clunky padded rectangles or gimmicky borders)."*

