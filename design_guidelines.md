# FinTask - Design Guidelines

## Design Approach
**Selected Approach:** Design System (Modern Financial Dashboard)

**Rationale:** FinTask is a utility-focused financial management tool where clarity, efficiency, and data comprehension are paramount. Drawing inspiration from modern fintech applications like Stripe Dashboard, Linear, and Wise, with emphasis on clean data presentation and intuitive navigation.

**Core Principles:**
- Information clarity over decoration
- Consistent, predictable patterns
- Efficient task completion
- Data visualization that tells a story

---

## Typography System

**Font Families:**
- Primary: Inter (headers, body, UI elements)
- Monospace: JetBrains Mono (currency values, numbers)

**Hierarchy:**
- Page Titles: text-2xl font-semibold
- Section Headers: text-lg font-semibold
- Card Headers: text-base font-medium
- Body Text: text-sm
- Labels: text-xs font-medium uppercase tracking-wide
- Currency Values: text-2xl font-mono font-bold (large displays), text-base font-mono (tables)

---

## Layout System

**Spacing Units:** Consistently use 4, 6, 8, 12, 16, 24 (p-1, p-1.5, p-2, p-3, p-4, p-6 in Tailwind)

**Page Structure:**
- Sidebar: Fixed width 256px (w-64) on desktop, collapsible on mobile
- Main Content: max-w-7xl mx-auto with px-6 py-8
- Cards/Sections: Rounded corners (rounded-lg), padding p-6
- Between sections: space-y-6 or gap-6

**Grid Patterns:**
- Summary Cards: 3-column grid on desktop (grid-cols-1 md:grid-cols-3)
- Transaction List: Full-width single column with clear dividers
- Chart Section: 2-column layout (grid-cols-1 lg:grid-cols-2) for multiple visualizations

---

## Component Library

### Navigation
**Sidebar (Desktop):**
- Fixed left sidebar with logo at top
- Navigation items with icons (Lucide) + labels, p-3 spacing
- Active state: subtle background fill, font-semibold
- Sections: Dashboard, Transações, Categorias

**Mobile Navigation:**
- Bottom tab bar with icons
- Hamburger menu for secondary actions

### Dashboard Cards
**Summary Cards (Saldo, Receitas, Despesas):**
- Prominent display with large monospace numbers
- Small trend indicator (↑↓ with percentage)
- Icon in corner (subtle, large)
- Minimum height h-32

### Data Tables
**Transaction List:**
- Zebra striping (alternate row backgrounds)
- Columns: Date | Description | Category Badge | Amount
- Row actions (edit/delete) appear on hover
- Group by month with sticky headers
- Responsive: Stack into cards on mobile

### Forms
**Transaction Form (Modal):**
- Type toggle (Receita/Despesa) as prominent segmented control at top
- Currency input with R$ prefix, large text-xl input
- Date picker with calendar icon
- Category dropdown with color-coded badges
- Description textarea with character count
- Action buttons: Cancel (ghost) + Save (primary) at bottom right

### Data Visualization
**Charts:**
- Clean axis labels, minimal gridlines
- Use recharts with tooltips showing exact values
- Income vs Expense line chart: Two distinct lines with legend
- Category pie chart: Limited palette, percentage labels
- All charts: Minimum height h-64, responsive

### Category Badges
- Inline pill shape (px-2 py-1, rounded-full)
- Category name in text-xs font-medium
- Positioned next to transaction descriptions

### Buttons & Actions
**Primary Actions:** Prominent filled buttons (e.g., "+ Nova Transação")
**Secondary Actions:** Outline or ghost variants
**Icon Buttons:** Consistent p-2 size for edit/delete actions
**Floating Action Button (Mobile):** Fixed bottom-right for "+ Nova Transação"

### Empty States
- Centered icon + heading + description
- Clear CTA button
- Minimum height h-96 for proper centering

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Default (< 768px)
- Tablet: md (768px+)
- Desktop: lg (1024px+)

**Key Adaptations:**
- Sidebar → Bottom nav on mobile
- 3-column summary → Single column stack on mobile
- Data tables → Card layout on mobile
- Form modals → Full screen on mobile
- Charts maintain readability, reduce complexity on small screens

---

## Accessibility Standards

- All interactive elements: min-height 44px (h-11)
- Form inputs: Clear labels, visible focus rings
- Buttons: Sufficient contrast ratios, descriptive text
- Icons: Always paired with text or aria-labels
- Charts: Include data tables as alternatives

---

## Portuguese Localization

- All interface text in Portuguese (Brazil)
- Currency: R$ with proper formatting (R$ 1.234,56)
- Dates: DD/MM/YYYY format using date-fns locale pt-BR
- Months in charts: Jan, Fev, Mar, Abr, Mai, Jun...

---

## Images

**Dashboard:** No hero image needed - focus on immediate data display
**Empty States:** Simple, clean illustrations (not photos) for "Nenhuma transação encontrada"
**Overall:** This is a data-focused application - minimize decorative imagery to maintain focus on financial information