---
name: Liquid Glass
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#414755'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#8d2ebc'
  on-secondary: '#ffffff'
  secondary-container: '#d072ff'
  on-secondary-container: '#540079'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#f6d9ff'
  secondary-fixed-dim: '#e8b3ff'
  on-secondary-fixed: '#310048'
  on-secondary-fixed-variant: '#7201a2'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The brand personality is premium, ethereal, and high-tech, focusing on clarity through depth. The design system leverages **Glassmorphism** as its core visual driver, creating a sense of "Liquid Glass" where elements feel like physical panes of polished crystal suspended in a vibrant digital environment.

The target audience consists of tech-savvy professionals and creative enthusiasts who value a high-fidelity, polished user experience. The UI should evoke an emotional response of serenity and precision.

**Key Stylistic Pillars:**
- **Translucency:** Backgrounds are never fully opaque, allowing content to bleed through and create a sense of environmental awareness.
- **Depth through Refraction:** Using multiple layers of blur and inner borders to simulate the thickness of glass.
- **Vibrant Accents:** High-energy colors are used sparingly to guide the eye, popping against a neutral, frosted canvas.

## Colors

The palette is rooted in a highly transparent white base that adapts to the background behind it. 

- **Primary (Electric Blue):** Used for primary actions and active states. It provides a sharp contrast to the soft glass backgrounds.
- **Secondary (Orchid Purple):** Used for supplementary highlights, progress indicators, or creative features.
- **Neutral:** A deep, off-black used exclusively for high-contrast typography and iconography to ensure legibility against translucent layers.
- **Glass Surfaces:** Use a base of white with 70% opacity, combined with a `backdrop-filter: blur(20px)` and a subtle `saturate(180%)` to mimic the Apple vibrancy effect.

## Typography

This design system utilizes **Inter** for its systematic, neutral, and highly legible qualities, mimicking the clarity of San Francisco. 

- **Hierarchy:** Use bold weights for display titles to ground the airy UI.
- **Coloration:** Headlines should be `Neutral 900`. Body text should use a slightly reduced opacity (80%) to maintain the "liquid" feel while ensuring AA accessibility.
- **Scale:** Large display type on desktop scales down significantly for mobile to avoid clashing with the tight margins of glass containers.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with generous safe areas. Content is grouped into "Glass Pods"—floating containers that define the structure.

- **Desktop:** 12-column grid with 64px side margins. Elements are encouraged to float with wide gutters to emphasize the background blur.
- **Mobile:** 4-column grid with 16px margins. Containers typically span full width to maximize the "sheet" effect.
- **Rhythm:** All spacing (padding, margins, gaps) must be multiples of the 8px base unit to maintain mathematical harmony within the organic glass shapes.

## Elevation & Depth

Depth is not communicated through traditional black shadows, but through **light refraction and layering**.

- **Level 1 (Base):** Dynamic background (gradients or imagery).
- **Level 2 (Panels):** `Backdrop-blur: 20px`, 1px solid white border at 20% opacity (inner glow effect), and a very soft, large-radius shadow (Color: `rgba(0,0,0,0.04)`, Blur: 40px).
- **Level 3 (Popovers/Modals):** `Backdrop-blur: 40px`, 1px solid white border at 40% opacity. These should have a slight "lift" effect using a secondary 1px "highlight" border on the top and left edges only.
- **Interactions:** When an element is pressed, it should "sink" by reducing the blur radius and increasing the opacity of the surface.

## Shapes

The shape language is consistently **Rounded**. Squircle-inspired corners are preferred over simple geometric radii to mimic hardware aesthetics.

- **Small elements (Buttons/Inputs):** 0.5rem (8px).
- **Large elements (Cards/Modals):** 1.5rem (24px).
- **Continuous Curvature:** Ensure that nested elements have a smaller radius than their parent containers to maintain a consistent visual gap (Radius_Inner = Radius_Outer - Padding).

## Components

### Buttons
- **Primary:** Solid Primary Color with a subtle top-down linear gradient (White at 10% to Transparent). 1px inner white border at 20% opacity.
- **Glass Button:** Transparent background, `backdrop-filter: blur(10px)`, and a 1.5px white border.

### Cards
- **Construction:** Use the Level 2 elevation specs. Cards should not have a background color when placed on light backgrounds; instead, use the blur and the white border to define the edge.

### Input Fields
- **Style:** Subtle recessed look. Use a background of `rgba(0,0,0,0.05)` with an inner shadow and 8px rounded corners. On focus, the border glows with the Primary Color.

### Chips & Tags
- **Style:** Fully pill-shaped (`rounded-xl`). Use the Secondary color at 10% opacity for the background and 100% opacity for the text.

### Segmented Controls
- **Style:** A single glass container with a "sliding" frosted pane that moves behind the active text option. The sliding pane should have a more intense blur than the container.