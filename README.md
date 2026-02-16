# gastown-calculator

A web-based calculator built with TypeScript and Vite.

## Features

### Scientific mode

Toggle scientific functions with the **Sci** button in the display area. Adds sin, cos, tan, ln, log, sqrt, x², and x^y. Unary functions apply immediately to the current value; x^y works as a binary operator.

### Formula builder

Open the formula panel with the **f(x)** button. Write expressions using variables (e.g. `x * 2 + y`), fill in variable values, and evaluate. Supports `+`, `-`, `*`, `/`, `^`, parentheses, and math functions. Saved formulas persist in localStorage.

### Undo

Click the undo arrow (↩) or press **Ctrl+Z** / **Cmd+Z** to revert the last action. Maintains a history stack of up to 100 entries.

### Pixel art theme

Click **PXL** to toggle a retro Game Boy-inspired skin with green monochrome palette, chunky box-shadow borders, and monospace font.

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
```

## Keyboard shortcuts

- `0-9` — digits
- `+-*/` — operators
- `.` — decimal point
- `Enter` / `=` — evaluate
- `Escape` / `Backspace` — clear
- `Ctrl+Z` / `Cmd+Z` — undo
