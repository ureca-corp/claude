# Implementation Report: [ComponentName]

Generated: [YYYY-MM-DD]
Plugin: figma2shadcn2next v0.1.0

---

## Node Info

| Field | Value |
|---|---|
| File Key | `[fileKey]` |
| Node ID | `[nodeId]` |
| Node Name | `[name]` |
| Node Type | `[COMPONENT / COMPONENT_SET / INSTANCE / FRAME]` |
| Classification | `[base-component / template-composition]` |
| Dimensions | `[width]px × [height]px` |
| Figma URL | `https://www.figma.com/design/[fileKey]/...?node-id=[nodeId]` |

---

## shadcn/ui Installation

```bash
npx shadcn@latest add [component1] [component2] ...
```

Installed components used:
- `[component1]` — used for [purpose]
- `[component2]` — used for [purpose]

---

## Token Mapping Table

| Usage Alias | Semantic Variable | Primitive (Light) | Primitive (Dark) | Tailwind Class | Source |
|---|---|---|---|---|---|
| `bg-background` | `color/bg/default` | `neutral-950` | `neutral-50` | `bg-background` | boundVariables |
| `text-foreground` | `color/text/default` | `neutral-900` | `neutral-100` | `text-foreground` | boundVariables |
| `radius-md` | `radius/md` | `6px` | — | `rounded-md` | boundVariables |
| `[token]` | `[semantic]` | `[light-value]` | `[dark-value]` | `[class]` | [source] |

Source values: `boundVariables` | `text-style` | `effect-style` | `raw`

---

## Unresolved Issues

### Chain Errors (must fix)

| # | Property | Issue | Raw Value Used |
|---|---|---|---|
| 1 | `[property]` | `[description of broken chain]` | `[fallback value]` |

### Missing Token Bindings (raw values)

| # | Property | Raw Value | Action |
|---|---|---|---|
| 1 | `[property]` | `[raw value]` | Verify with designer |

### Ambiguities

- [ ] [description of ambiguous item requiring designer input]

---

## Token Audit Summary

*(Populated by figma-token-auditor agent)*

- Total tokens audited: N
- ✅ Verified: N
- ❌ Chain errors: N
- ⚠️ Unaudited classes: N
- 🔴 Raw values: N
- **Audit result**: PASS / FAIL

[Detailed audit output here]

---

## Fidelity Review Summary

*(Populated by figma-fidelity-reviewer agent)*

📸 Screenshot: [Figma screenshot URL]

- Properties checked: N
- ✅ Matching: N
- ❌ Discrepancies: N (HIGH: N / MEDIUM: N / LOW: N)
- 🌙 Dark mode coverage: FULL / PARTIAL / MISSING
- **Recommendation**: SHIP AS-IS / FIX BEFORE SHIP / NEEDS REDESIGN REVIEW

### Key Discrepancies

| Property | Figma Spec | Code Value | Severity |
|---|---|---|---|
| `[property]` | `[figma value]` | `[code value]` | HIGH/MEDIUM/LOW |

---

## Implementation Notes

- Light/Dark strategy used: `css-variables` / `tailwind-dark-variant`
- Component classification: base / template (confirmed by user: yes/no)
- Custom overrides applied: [list or "none"]
- [Any other implementation decisions worth documenting]
