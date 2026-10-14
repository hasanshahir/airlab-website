# AIR Lab Website — Artificial Intelligence Research Lab

Official web application, research showcase, and faculty/student directory for the **Artificial Intelligence Research Lab (AIR Lab)**, Department of Computer & Information Systems Engineering (CSIT), **NED University of Engineering & Technology, Karachi**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://hasanshahir.github.io/airlab-website/)
[![Built with React](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Live Access

- **Official Web Deployment:** [https://hasanshahir.github.io/airlab-website/](https://hasanshahir.github.io/airlab-website/)

---

## 🚀 Key Features

- **Concentric Sunflower Team Cluster (Apple Watch Interface):** Fluid dual-easing fisheye lens interaction with soft damping and hover cards.
- **Complete Research Portfolio:** Live showcase of active Sindh HEC funded projects, NEDAASC sponsored initiatives, and undergraduate capstone engineering systems.
- **Faculty & Student Directory:** Comprehensive profiles for Principal Investigators, lecturers, and research fellows with direct contact links and research tags.
- **Fast Flyout Quick Drawer:** Right-side hover/click drawer providing instant access to all projects and researchers.
- **Zero 404 Routing:** HashRouter architecture optimized for reliable client-side routing on static hosts.
- **Neo-Grotesk Design System:** Stanford-academic aesthetic powered by Tailwind CSS v4 design tokens, smooth micro-interactions, and accessible theme switching.

---

## 📂 Repository Structure

```text
airlab-website/
├── public/                 # Static assets, team portraits, logos
├── src/
│   ├── components/         # AppleWatchCluster, ParticleField, QuickDrawer, Layout, etc.
│   │   └── ui/             # Reusable UI primitives (Buttons, Badges, Modals)
│   ├── data/               # Institutional JSON stores (team, projects, grants, gallery)
│   ├── pages/              # Home, Team, Projects, Grants, Publications, Gallery, Performers, Interns
│   ├── entities/           # TypeScript Domain entities (TeamMemberEntity)
│   ├── lib/                # Data queries & utilities
│   ├── types/              # Type definitions
│   ├── App.tsx             # Routing & Theme setup
│   └── index.css           # Design tokens, color system, and reveal rules
├── .github/workflows/      # Automated CI/CD deploying directly to GitHub Pages
├── package.json
└── vite.config.ts
```

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/hasanshahir/airlab-website.git
cd airlab-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📜 Authors & Acknowledgments

- **AIR Lab**, Department of Computer & Information Systems Engineering, NED University of Engineering & Technology, Karachi.
- Developed by **Hasan Shahir** ([@hasanshahir](https://github.com/hasanshahir)).
