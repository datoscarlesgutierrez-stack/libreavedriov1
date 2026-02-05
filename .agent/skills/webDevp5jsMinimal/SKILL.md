---
name: webDevp5jsMinimal
description: Expert Web Developer specializing in UX/UI, Vite, Vanilla JS, and creative coding (p5.js).
---

# webDevp5jsMinimal Skill

This skill defines the technical and aesthetic standards for building modern, high-performance web applications with a focus on premium UX/UI and creative interactivity.

## 🚀 Design Philosophy
- **Minimalist Aesthetics**: Prioritize clean lines, intentional whitespace, and a refined, neutral color palette. Avoid visual clutter and "glassmorphism" unless specifically requested.
- **Purposeful Typography**: Use high-contrast, premium typography (e.g., Google Fonts like Inter, Outfit, or Playfair Display for accents).
- **Subtle Micro-Animations**: Interaction should feel "alive" but restrained. Use smooth, subtle CSS transitions and GSAP for purposeful motion.

## 🛠 Tech Stack & Tools
- **Bundler**: Vite (standard for all projects).
- **Core**: Vanilla JavaScript (ES Modules).
- **Styling**: Modern Vanilla CSS (Custom Properties, Flexbox, Grid).
- **Creative Coding**: 
    - **p5.js**: For canvas-based interactivity, generative art, and dynamic backgrounds.
    - **GSAP**: For complex sequencing and high-performance animations.
- **Form Handling**: Use services like Formspree for backend-less logic.

## 📂 Project Structure
Maintain a clean and predictable structure:
- `index.html`: Semantic entry point.
- `public/`: Static assets (images, icons, fonts).
- `src/`:
    - `main.js`: Application entry point.
    - `config.js`: Configuration parameters for JavaScript logic.
    - `style.css`: Main styles.
    - `config.css`: Design tokens and CSS variables.
    - `canvas/`: Modules for p5.js sketches or Three.js scenes.
    - `utils/`: Helper functions and UI logic.

## 📐 Implementation Standards

### 1. Configuration Files
Always separate configuration from logic to allow for easy tweaking:

**CSS Configuration (`src/config.css`):**
Define all design tokens (colors, fonts, spacing, sizes) as CSS variables.
```css
:root {
  --color-primary: #111111;
  --color-accent: #666666;
  --color-bg: #f8f9fa;
  --color-text: #1a1a1a;
  --font-main: 'Inter', sans-serif;
  --transition-subtle: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

**JS Configuration (`src/config.js`):**
Export a configuration object with the most relevant parameters for your code.
```javascript
export const CONFIG = {
  CANVAS: {
    FPS: 60,
    PARTICLE_COUNT: 100,
    SPEED_MULTIPLIER: 1.2
  },
  ANIMATIONS: {
    DURATION: 0.5,
    EASE: 'power2.out'
  }
};
```

### 2. p5.js Integration
When using p5.js in a Vite/ESM environment, use **Instance Mode** for better control and encapsulation:
```javascript
import p5 from 'p5';

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };
  p.draw = () => {
    // Creative logic here
  };
};

new p5(sketch, document.getElementById('canvas-container'));
```

### 3. SEO & Accessibility
- Use one `<h1>` per page.
- Descriptive `alt` tags for images.
- ARIA labels for interactive elements.
- Optimized meta titles and descriptions.

## 💡 Best Practices for Antigravity
- **Proactive Design**: If the user asks for a button, give them a beautifully styled, animated button with a hover state.
- **Component Thinking**: Even in Vanilla JS, think in terms of reusable modules.
- **Safety**: Always use absolute paths and verify build status after changes.
