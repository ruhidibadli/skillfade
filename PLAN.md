# SkillFade UI Overhaul Plan - Dark Professional Theme

## Overview

Complete UI redesign to transform the generic "AI-generated" look into a unique, professional dark-themed application.

**Design Direction:**
- **Style**: Dark Professional (dark backgrounds, subtle glows, refined gradients, premium feel)
- **Icons**: Lucide React replacing all emojis
- **Scope**: Complete overhaul of all pages and components

---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies
- Add `lucide-react` package

### 1.2 Tailwind Configuration (`tailwind.config.js`)
- New color palette:
  - **Surface colors**: Dark backgrounds (gray-900 to gray-950 range)
  - **Accent**: Cyan/Teal (`#00fff0`) for primary interactions
  - **Secondary**: Violet/Purple (`#a855f7`) for secondary elements
  - **Freshness indicators**: Fresh (green glow), Aging (amber glow), Decayed (pink glow) - replacing traffic light metaphor
- Custom typography scale with display sizes
- New animations: `glow-pulse`, `shimmer`, `float`
- Glow-based box shadows instead of generic shadows
- Mesh gradient backgrounds

### 1.3 Global CSS (`src/index.css`)
- Component classes: `.card`, `.card-elevated`, `.card-interactive`
- Button styles: `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- Input styles: `.input`
- Tag/badge styles: `.tag`, `.tag-accent`
- Custom scrollbar styling
- Force dark mode

### 1.4 Theme Context (`src/context/ThemeContext.tsx`)
- Dark mode as default (always on)

---

## Phase 2: Layout Redesign (`src/components/Layout.tsx`)

- Dark navigation bar with blur backdrop
- Lucide icons for nav items: `LayoutDashboard`, `Layers`, `BarChart3`, `Settings`, `LogOut`
- Logo with gradient icon + "SkillFade" text + Beta tag
- Active nav items with accent glow
- Refined footer with minimal text

---

## Phase 3: Landing Page (`src/pages/Landing.tsx`)

**Icon Replacements:**
| Emoji | Lucide Icon |
|-------|-------------|
| 🟢🟡🔴 | Custom `StatusDot` with glow |
| ⏳ | `Clock` |
| 🎯 | `Target` |
| ⚖️ | `Scale` |
| 📊 | `BarChart3` |
| 📝 | `FileText` |
| 📈 | `TrendingUp` |
| 📧 | `Mail` |
| 🔒 | `Shield` |
| 🎨 | `Palette` |

**Layout Changes:**
- Hero with mesh gradient background and blur orbs
- Asymmetric stat cards (12-column grid with varied spans)
- Feature sections with icon-based cards
- CTAs with glow effects

---

## Phase 4: Dashboard (`src/pages/Dashboard.tsx`)

- Asymmetric grid layout (5-4-3 column spans)
- `StatusDot` component for freshness indicators
- Icons: `Target`, `Calendar`, `Scale`, `GraduationCap`
- Progress visualization for weekly stats
- Skill cards with freshness progress bars

---

## Phase 5: Skills Page (`src/pages/Skills.tsx`)

- Card grid with hover glow effects
- Freshness progress bars (not just numbers)
- Icons: `Plus`, `BookOpen`, `Zap`, `Folder`, `ArrowUpRight`
- Refined modal for adding skills
- Better empty state with `Target` icon

---

## Phase 6: Skill Detail (`src/pages/SkillDetail.tsx`)

- Timeline with icon markers (`BookOpen` for learning, `Zap` for practice)
- Dark-themed Recharts:
  - Dark grid lines
  - Accent-colored lines
  - Custom tooltip styling
  - Reference lines at 70% and 40%
- Stat boxes with icons: `Target`, `Calendar`, `TrendingUp`, `Award`, `Clock`
- Modals with proper dark styling
- Action buttons with icons: `Edit3`, `Settings2`, `Archive`, `Link2`

---

## Phase 7: Analytics (`src/pages/Analytics.tsx`)

- Calendar with dark cells and accent highlights
- Event indicators with icons (not emojis)
- Charts with dark theme colors
- Period comparison cards with better hierarchy

---

## Phase 8: Auth & Settings

### Login/Register (`src/pages/Login.tsx`, `Register.tsx`)
- Centered card on mesh background
- Glow effect on form card
- Refined input styling
- `Sparkles` logo icon

### Settings (`src/pages/Settings.tsx`)
- Section cards with icons: `FileDown`, `Shield`, `Trash2`, `Plus`, `Pencil`
- Danger zone with pink/red glow border

### QuickLogWidget (`src/components/QuickLogWidget.tsx`)
- Floating button with gradient and glow
- `Plus` / `X` icons
- Form icons: `BookOpen`, `Zap`, `Calendar`, `Clock`, `FileText`

---

## Files to Modify

1. `package.json` - Add lucide-react
2. `tailwind.config.js` - Complete color/animation overhaul
3. `src/index.css` - Global styles and component classes
4. `src/context/ThemeContext.tsx` - Dark mode default
5. `src/components/Layout.tsx` - Navigation redesign
6. `src/components/QuickLogWidget.tsx` - Floating button
7. `src/pages/Landing.tsx` - Complete redesign
8. `src/pages/Dashboard.tsx` - New layout
9. `src/pages/Skills.tsx` - Card improvements
10. `src/pages/SkillDetail.tsx` - Timeline and charts
11. `src/pages/Analytics.tsx` - Calendar and charts
12. `src/pages/Settings.tsx` - Section styling
13. `src/pages/Login.tsx` - Auth form
14. `src/pages/Register.tsx` - Auth form

---

## Key Design Principles

1. **No emojis** - All replaced with Lucide icons
2. **Glow over shadow** - Subtle colored glows instead of generic box-shadows
3. **Asymmetric layouts** - Varied card sizes, not uniform grids
4. **Visual hierarchy** - Important elements larger/brighter
5. **Accent consistency** - Cyan for primary, violet for secondary
6. **Dark surfaces** - Multiple dark shades for depth
7. **Refined interactions** - Glow on hover, subtle scale on click
