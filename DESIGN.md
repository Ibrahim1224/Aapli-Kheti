---
name: Agricultural Intelligence System
colors:
  surface: '#f8faf8'
  surface-dim: '#d8dad9'
  surface-bright: '#f8faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f2'
  surface-container: '#eceeec'
  surface-container-high: '#e6e9e7'
  surface-container-highest: '#e1e3e1'
  on-surface: '#191c1b'
  on-surface-variant: '#42493e'
  inverse-surface: '#2e3130'
  inverse-on-surface: '#eff1ef'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#77574d'
  on-secondary: '#ffffff'
  secondary-container: '#fed3c7'
  on-secondary-container: '#795950'
  tertiary: '#003c60'
  on-tertiary: '#ffffff'
  tertiary-container: '#005484'
  on-tertiary-container: '#8dc8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#e7bdb1'
  on-secondary-fixed: '#2c160e'
  on-secondary-fixed-variant: '#5d4037'
  tertiary-fixed: '#cee5ff'
  tertiary-fixed-dim: '#96ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004a75'
  background: '#f8faf8'
  on-background: '#191c1b'
  surface-variant: '#e1e3e1'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  data-display:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality of this design system is rooted in **precision, reliability, and ecological stewardship**. It bridges the gap between traditional farming wisdom and cutting-edge data science. The visual language evokes a sense of "digital terraforming"—transforming complex raw data into fertile insights for decision-makers.

The chosen style is **Corporate / Modern** with a lean toward **Minimalism**. By utilizing generous white space and a grounded color palette, the UI avoids the clutter often found in data-heavy platforms. It prioritizes clarity and functional beauty, ensuring that the technology feels like a natural extension of the agricultural environment rather than a foreign layer. The aesthetic goal is to foster a "calm-tech" experience, where users feel in control of their land and their data.

## Colors

The palette is derived from the natural lifecycle of a crop. 
- **Deep Green (#2D5A27)** acts as the primary anchor, representing growth, health, and the core of the brand.
- **Rich Brown (#5D4037)** is used for structural elements, secondary actions, and grounding typography, providing a tactile, earthy contrast.
- **Sky Blue (#0288D1)** serves as the tertiary highlight, used specifically for data visualization, interactive elements, and information related to weather or irrigation.

The background system relies on an off-white, slightly warm neutral to reduce eye strain during long periods of data analysis. Success and error states are subtly tuned to harmonize with the earthy primary green to avoid visual jarring.

## Typography

This design system utilizes **Manrope** for all typographic needs. Its geometric but slightly softened terminals offer a modern, high-tech feel while remaining approachable and highly legible in dense data environments.

- **Headlines:** Use a bold weight in Rich Brown for a grounded, authoritative hierarchy.
- **Body Text:** Standardized on 16px to ensure readability for users in various lighting conditions (e.g., outdoors on mobile devices).
- **Labels:** Set in uppercase with slight tracking to distinguish metadata from content.
- **Data Display:** A specific "Data Display" style is used for hero metrics within cards, emphasizing numerical clarity.

## Layout & Spacing

The design system employs a **fixed grid** approach for desktop views to maintain rigorous alignment of data cards, while transitioning to a fluid model for mobile field use. 

A 12-column grid is the standard, with a 24px gutter to ensure distinct separation between analytical modules. The spacing rhythm is strictly based on an **8px base unit**. This mathematical consistency mirrors the precision of the data being displayed. Margin-heavy layouts are preferred to create "visual breathing room," preventing the platform from feeling overwhelming despite high information density.

## Elevation & Depth

To maintain a professional and trustworthy feel, this design system avoids heavy drop shadows. Instead, it utilizes **tonal layers** and **low-contrast outlines**. 

Depth is communicated through:
1.  **Surface Levels:** The background uses a soft neutral, while primary content cards use pure white.
2.  **Subtle Outlines:** Elements are defined by 1px borders in a light gray-brown tint, providing structure without bulk.
3.  **Soft Ambient Shadows:** When an element requires focus (like a modal or a hovered card), a very soft, diffused shadow with a slight green-tinted umbra is used to suggest it is "floating" just above the surface.

## Shapes

The shape language follows a **Soft (Level 1)** philosophy. This provides a subtle 4px (0.25rem) radius on standard components like input fields and buttons, and 8px (0.5rem) on larger data cards.

This level of roundedness strikes a balance between the precision of a sharp-edged "technical" tool and the user-friendly nature of a modern service. It feels engineered yet organic. Interactive elements like "Pill Tags" for status indicators may use a full 100px radius to distinguish them from structural components.

## Components

### Data Cards
Cards are the primary container for intelligence. They must feature a white background, a 1px soft-tinted border, and an 8px corner radius. Headlines within cards should use the Deep Green to denote the category of data.

### Progress Indicators
Used for crop growth cycles or task completion. These utilize a thick, 8px track in a pale green, with the active progress rendered in the primary Deep Green. For "at-risk" metrics, the track may transition to Sky Blue to indicate irrigation-related status.

### Interactive Charts
Charts must be minimalist. Remove unnecessary grid lines and use Sky Blue for primary data lines, with Deep Green for "target" or "ideal" ranges. Tooltips should be dark-themed (Rich Brown) to pop against the light UI.

### Multi-Step Forms
For field reports and data entry. A horizontal "Stepped" header is used at the top. Each step is represented by a circle—hollow for upcoming, Rich Brown for completed, and Deep Green for the active state. Buttons are clearly differentiated: "Next" is a solid Deep Green, while "Back" is a text-only Rich Brown link to minimize visual competition.

### Input Fields
Inputs use a white fill with a subtle 1px border. Upon focus, the border thickens and changes to Sky Blue, signaling active engagement and technical precision.