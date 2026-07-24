# Token Chain Resolution Rules

## Overview

Figma variables in the Ureca Shadcn library are organized in three layers:

```
usage (alias)       →  semantic (mode-aware)  →  primitive (raw value)
bg-background           color/bg/default           neutral-950 (light)
                                                   neutral-50  (dark)
```

The `codeSyntax.WEB` field on each variable is the authoritative Tailwind class name.
**Always use this field. Never derive class names from variable display names.**

---

## Variable Collections

The Ureca Shadcn library uses three standard collections:

| Collection | Role | Has Modes? |
|---|---|---|
| `usage` | Tailwind alias → semantic reference | No |
| `semantic` | Mode-aware token (Light / Dark) | Yes — Light, Dark |
| `primitive` | Raw design value | No |

**Mode branching rule:** Modes are defined at the `semantic` collection level only.
The `usage` layer simply points to a semantic variable; it does not carry mode information.
The `primitive` layer contains raw values that do not vary by mode.

---

## Chain Resolution Algorithm

### Case 1: Variable bound directly to usage alias

```
boundVariable → variable ID in usage collection
→ get codeSyntax.WEB from usage variable
→ if value is "bg-background" (a Tailwind utility) → USE AS-IS
→ if value references another variable ID → go to Case 2
```

### Case 2: Usage variable aliases to semantic variable

```
usage.codeSyntax.WEB → semantic variable ID
→ get semantic variable
→ check modes:
  Light mode value: semantic.value(Light) → if primitive ID → go to Case 3
  Dark mode value:  semantic.value(Dark)  → if primitive ID → go to Case 3
```

### Case 3: Semantic variable resolves to primitive

```
semantic.value(mode) → primitive variable ID
→ get primitive variable
→ codeSyntax.WEB → "blue-600" or "#2563EB" or specific CSS value
→ combine with mode context:
  Light → className="bg-blue-600"
  Dark  → className="dark:bg-blue-400"
```

### Case 4: Direct semantic binding (no usage layer)

Some properties bind directly to semantic variables (skipping usage). Apply Case 2 → Case 3.

### Case 5: Named style (no variable binding)

```
node has named textStyle or effectStyle → look up style by name
→ style has codeSyntax.WEB field → use that value
→ if no codeSyntax.WEB → decompose style properties (fontSize, lineHeight, etc.)
  and map each property individually
```

### Case 6: Raw value (no binding, no style)

```
fills[].color → convert rgba to nearest Tailwind value or use arbitrary [#hex]
→ always add comment: // raw: no token binding — verify with designer
```

---

## codeSyntax.WEB Value Patterns

| Pattern | Example | How to Use |
|---|---|---|
| Tailwind utility | `"bg-background"` | Direct className |
| Tailwind arbitrary | `"bg-[#0F172A]"` | Direct className (arbitrary value) |
| CSS variable | `"var(--background)"` | `style={{ background: "var(--background)" }}` |
| Primitive token | `"neutral-950"` | `bg-neutral-950` (add category prefix) |
| Numeric value | `"16px"` | `p-4` (convert via spacing scale) or `p-[16px]` |
| Hex color | `"#0F172A"` | `bg-[#0F172A]` |

### Tailwind Spacing Scale (1 unit = 4px)

| px | Tailwind |
|---|---|
| 2px | 0.5 |
| 4px | 1 |
| 8px | 2 |
| 12px | 3 |
| 16px | 4 |
| 20px | 5 |
| 24px | 6 |
| 32px | 8 |
| 40px | 10 |
| 48px | 12 |
| 64px | 16 |

---

## Light/Dark Mode Implementation

### When project uses Tailwind dark: variant

```tsx
// semantic variable: color/bg/default
// Light → primitive: neutral-950 → codeSyntax.WEB: "bg-neutral-950"
// Dark  → primitive: neutral-50  → codeSyntax.WEB: "bg-neutral-50"

className="bg-neutral-950 dark:bg-neutral-50"
// token: bg-background → semantic/color/bg/default → primitive/neutral-950 (dark: primitive/neutral-50)
```

### When project uses CSS variables (shadcn default)

shadcn/ui by default uses CSS variable theming. In this pattern, `bg-background` itself
switches between modes because the CSS variable `--background` changes value:

```tsx
className="bg-background"
// token: bg-background → semantic/color/bg/default (CSS var --background resolves per mode)
```

**Rule:** If the project has `globals.css` with `:root` and `.dark` CSS variable definitions,
use the usage alias directly (e.g., `bg-background`) — do not expand to primitive. If there are
no CSS variable definitions, expand to `light-class dark:dark-class` form.

Check `globals.css` or `tailwind.config.ts` before deciding. The presence of a block like this
confirms the `css-variables` strategy:

```css
/* globals.css — confirms css-variables strategy is active */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

If this block is absent, use `tailwind-dark-variant` form instead.

---

## Typography Chain

Text style properties map as follows:

| Figma Property | codeSyntax.WEB | Tailwind Class |
|---|---|---|
| fontSize | `"text-sm"` | `text-sm` |
| fontWeight | `"font-medium"` | `font-medium` |
| lineHeight | `"leading-5"` | `leading-5` |
| letterSpacing | `"tracking-tight"` | `tracking-tight` |
| fontFamily | `"font-sans"` | `font-sans` |

When a named text style is present, use its codeSyntax.WEB fields. When missing individual
properties, look up the semantic typography variable for that property.

---

## Radius Chain

| Figma token | Semantic | Primitive | Tailwind |
|---|---|---|---|
| radius-sm | radius/sm | 4px | `rounded` |
| radius-md | radius/md | 6px | `rounded-md` |
| radius-lg | radius/lg | 8px | `rounded-lg` |
| radius-xl | radius/xl | 12px | `rounded-xl` |
| radius-full | radius/full | 9999px | `rounded-full` |

If codeSyntax.WEB is not `"rounded-*"` format, use arbitrary: `rounded-[6px]`.

---

## Gradient and Multi-Fill Rules

### Multi-fill layering

Figma applies fills bottom to top. Render in the same order:

```tsx
// For layered backgrounds: use CSS background-image with multiple layers
style={{
  backgroundImage: [
    "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.05))",  // top fill
    "url('/bg-texture.png')"  // bottom fill
  ].join(", ")
}}
```

### Gradient stops

Extract stop positions and RGBA values from Figma gradient fill:

```
gradient.gradientStops[0] → { position: 0, color: {r,g,b,a} }
gradient.gradientStops[1] → { position: 1, color: {r,g,b,a} }
```

Convert `{r,g,b,a}` (0–1 range) to `rgba(R,G,B,A)` (0–255 range for RGB, 0–1 for A).

---

## Effect Chain (Shadows, Blur)

### Drop shadow

Check for named effect style first. If present, use its codeSyntax.WEB (e.g., `"shadow-md"`).

If no named style, reconstruct from raw effect:

```
effect.type === "DROP_SHADOW"
effect.color → rgba
effect.offset.x, offset.y → horizontal, vertical offset
effect.radius → blur radius
effect.spread → spread

→ Tailwind arbitrary: shadow-[0_4px_6px_rgba(0,0,0,0.07)]
  or tailwind.config.ts custom shadow if project defines one
```

### Blur

```
effect.type === "BLUR"
effect.radius → blur value

→ backdrop-blur-sm / backdrop-blur-md / etc.
  or backdrop-blur-[12px] if no match
```

---

## Common Edge Cases

### Variable exists but codeSyntax.WEB is empty

Log as unresolved: "Variable `[name]` has no codeSyntax.WEB value. Using raw primitive value."
Use the raw value and mark as `// raw: codeSyntax.WEB missing`.

### Circular alias reference

If usage → semantic → usage (circular), stop at first alias and use its primitive value.
Log: "Circular alias detected at `[variable-name]`. Resolved to raw value."

### Figma-safe variable name vs Tailwind class

Figma variable names use `/` as path separator (e.g., `color/bg/default`). These are NOT
Tailwind classes. Only `codeSyntax.WEB` values map to Tailwind. Do not use path segments
as class names.

Example:
```
Variable name: "color/bg/primary"       ← NOT a class name
codeSyntax.WEB: "bg-primary"            ← THIS is the Tailwind class
```

### boundVariables key mismatch

`boundVariables` in design context uses property keys like `fills`, `strokes`, `effects`, etc.
Cross-reference these with the correct fill index. Example:

```json
"boundVariables": {
  "fills": [{ "id": "VariableID:123:45", "type": "VARIABLE_ALIAS" }]
}
```

This binds `fills[0]` to variable `123:45`. If the node has multiple fills, each fill may
have its own variable binding or none at all.
