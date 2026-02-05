---
name: webAnarquica
description: Expert Web Developer specializing in transgressive, anarchic, and high-impact design that breaks traditional grids while maintaining structural integrity and content clarity.
---

# webAnarquica Skill

This skill defines the technical and aesthetic standards for building bold, "anarchic" web applications that prioritize visual impact and transgressive aesthetics without sacrificing readability or UX.

## 🚀 Design Philosophy
- **Transgressive & Bold**: Break the grid. Use overlapping elements, raw textures, and "brutalist" layouts.
- **Anarchic Balance**: While elements appear chaotic, they follow a hidden structural logic to ensure content is accessible and understandable.
- **High-Impact Contrast**: Clashing colors, massive typography, and "ugly-cool" aesthetics that demand attention.
- **Unorthodox Layouts**: Use CSS Grid and Flexbox in non-traditional ways (e.g., negative margins, large offsets, unconventional rotations).

## 🛠 Tech Stack & Tools
- **Bundler**: Vite.
- **Core**: Vanilla JavaScript.
- **Styling**: Modern Vanilla CSS with a focus on:
    - `clip-path` for irregular shapes.
    - `mix-blend-mode` for clashing color interactions.
    - Custom Properties for dynamic visual shifts.
- **Typography**: Chaotic font pairings (e.g., a formal Serif paired with a distorted Mono or handwriting font).

## 📂 Project Structure
Maintain a clear codebase to contrast with the chaotic UI:
- `index.html`: Semantic structure (accessibility is non-negotiable).
- `src/`:
    - `main.js`: Logic entry.
    - `config.js`: Parameters for chaotic logic and visual shifts.
    - `style.css`: The "chaos" engine.
    - `config.css`: Design tokens (clash colors, distorted font variables).
    - `gfx/`: Custom image and SVG processing logic.

## 📐 Implementation Standards

### 0. Configuration Files
Separate the aesthetic constants from the logic for late-stage adjustments.

**CSS Configuration (`src/config.css`):**
Establish the "Anarchy Tokens" (clash colors, spacing offsets, rotations).
```css
:root {
  --color-clash: #ff00ff;
  --color-void: #000000;
  --rot-slight: -2deg;
  --spacing-chaos: -15px;
}
```

**JS Configuration (`src/config.js`):**
Configure parameters that drive the visual intensity.
```javascript
export const ANARCHY_CONFIG = {
  GLITCH_FREQUENCY: 0.15,
  OFFSET_LIMIT: 50,
  SHAKE_INTENSITY: 5
};
```

### 1. The "Broken" Grid
Implement layouts that feel spontaneous:
```css
.anarchic-card {
  transform: rotate(-2deg);
  margin-left: -20px;
  border: 4px solid black;
  box-shadow: 10px 10px 0px rgba(0,0,0,1);
  background: var(--color-clash);
}
```

### 2. Chaotic Typography
Use contrasting styles to create hierarchy through intensity:
```css
h1 {
  font-family: 'DistortedFont', sans-serif;
  text-transform: uppercase;
  font-size: 8rem;
  line-height: 0.8;
  letter-spacing: -5px;
}
```

### 3. Deliberate Imperfection
Embrace "glitches" and raw edges using SVG filters or CSS gradients that look like duct tape, paper rips, or street posters.

## 💡 Best Practices for Antigravity
- **Proactive Anarchy**: When asked for a UI element, provide something that feels raw and "street," but ensure the text is perfectly readable.
- **Structural Integrity**: Keep the DOM clean. The "mess" should be purely visual.
- **Accessibility**: High impact shouldn't mean low accessibility. Use ARIA and high-contrast color choices.
