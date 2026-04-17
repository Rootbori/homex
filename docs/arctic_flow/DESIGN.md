# Design System Documentation: The Atmospheric Editorial

## 1. Overview & Creative North Star
**Creative North Star: "Precision Transparency"**

In the humid, high-velocity climate of Thailand’s service industry, users seek clarity and relief. This design system moves beyond the "utilitarian app" look to create an editorial-grade experience. We aren't just managing HVAC units; we are "curating the atmosphere." 

The system rejects the rigid, boxy constraints of traditional SaaS. Instead, it utilizes **Atmospheric Layering**—using tonal shifts, soft glassmorphism, and intentional asymmetry to guide the eye. We prioritize "breathability" (negative space) to mimic the feeling of a freshly serviced, cool environment. By overlapping elements and using extreme typographic scales, we transform a CRM into a premium service portal.

---

## 2. Colors: The Tonal Atmosphere
We use color not just for branding, but to define physical space without the clutter of lines.

### The Palette (Material 3 Derived)
- **Primary Focus:** `primary (#0058bc)` and `primary_container (#0070eb)`.
- **Surface Logic:** `surface (#f8f9fa)` serves as our base, with `surface_container_lowest (#ffffff)` used for the most prominent interactive cards.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** 1px solid lines create visual noise that feels "cheap." 
- **The Solution:** Define boundaries through background shifts. A `surface_container_low` section should sit against a `surface` background. If you feel the need for a line, increase the padding instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper. 
- **Layer 1 (Base):** `surface`
- **Layer 2 (Content Areas):** `surface_container_low`
- **Layer 3 (Interactive Cards):** `surface_container_lowest` (Pure White)
- **Layer 4 (Floating Actions):** Semi-transparent `primary_container` with a 20px backdrop blur.

### The "Glass & Gradient" Rule
To elevate the "Sky Blue" theme, use **Atmospheric Gradients**. Main CTAs should transition from `primary (#0058bc)` at the bottom-right to `primary_container (#0070eb)` at the top-left. This creates a subtle convexity that feels tactile and high-end.

---

## 3. Typography: Editorial Authority
We utilize two typefaces to balance Thai readability with global SaaS aesthetics. 
- **Headings:** `Plus Jakarta Sans` (Sophisticated, modern, wide apertures).
- **Body/System:** `Inter` (Optimized for Thai character legibility and data density).

### The Scale
- **Display (display-lg):** 3.5rem / Plus Jakarta Sans. Used for "Hero" numbers (e.g., Temperature or Total Revenue).
- **Headline (headline-sm):** 1.5rem / Plus Jakarta Sans. For service titles and section starts.
- **Title (title-lg):** 1.375rem / Inter. For card headers.
- **Body (body-lg):** 1rem / Inter. The standard for all user input and service descriptions.
- **Label (label-md):** 0.75rem / Inter. For status chips and metadata.

**Intentional Asymmetry:** Align primary headlines to the left with generous top-padding (48px+) to create an editorial "entry point" for the user's eye.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too heavy for a "clean/air" theme. We use **Ambient Depth**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_lowest` card on a `surface_container_high` background provides all the separation required.
- **Ambient Shadows:** Only for floating elements (FABs, sticky bottoms). Use `on_surface` at 4% opacity with a 32px blur and 8px Y-offset. It should feel like a glow, not a shadow.
- **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., Input Fields), use `outline_variant` at **15% opacity**. It should be felt, not seen.
- **Glassmorphism:** Bottom navigation bars and Sticky Action Buttons must use a `surface` color at 80% opacity with a `blur(20px)` effect. This ensures the service content "flows" under the interface.

---

## 5. Components

### Large Action Buttons (CTAs)
- **Styling:** Height 56px (Mobile-first tap target).
- **Radius:** `md (0.75rem)` for a modern, friendly feel.
- **Primary:** Gradient (`primary` to `primary_container`) with `on_primary` text. No shadow.
- **Secondary:** `secondary_container` background with `on_secondary_container` text.

### Status Chips (Atmospheric Indicators)
- **Shape:** `full (9999px)` pill shape.
- **Logic:** 
    - *Pending:* `tertiary_container` with `on_tertiary_container` (Warm/Attention).
    - *Scheduled:* `secondary_container` (Calm/Action).
    - *Completed:* `primary_fixed_dim` with `on_primary_fixed_variant` (Success/Cool).

### Cards & Information Stacks
- **Forbid Dividers:** Never use a horizontal line to separate "Job Date" from "User Name." 
- **The Solution:** Use `body-sm` in `on_surface_variant` for the label, stacked directly above `title-sm` in `on_surface`. Use 16px of vertical space between groups.

### Progress Timelines
- Use a **Vertical Stepper** for mobile. 
- Completed steps use a solid `primary` dot; upcoming steps use a `primary_fixed` ring. The "line" connecting them should be `outline_variant` at 20% opacity.

---

## 6. Do’s and Don’ts

### Do
- **Do** use "Breathing Room." If a screen feels cramped, remove content before you shrink the font.
- **Do** use `xl (1.5rem)` corner radius for the main top-level containers to give a soft, premium "app-in-app" feel.
- **Do** ensure Thai glyphs in `Inter` have sufficient line-height (minimum 1.5x) to avoid clipping tone marks.

### Don't
- **Don't** use pure black `#000000`. Use `on_surface (#191c1d)` for high-contrast text to keep the "Atmosphere" soft.
- **Don't** use standard Material Design "elevated" buttons with heavy shadows. They look dated and heavy.
- **Don't** use 100% opaque backgrounds for bottom navigation. It traps the user; glassmorphism sets them free.

### Accessibility Note
Ensure that all `on_surface_variant` text on `surface` backgrounds maintains a 4.5:1 contrast ratio. While we love "subtle," we never sacrifice the technician's ability to read a job order in high-glare Thailand sunlight.