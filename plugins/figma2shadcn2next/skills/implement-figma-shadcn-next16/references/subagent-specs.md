# Subagent Specifications

This file defines how to invoke `figma-token-auditor` and `figma-fidelity-reviewer`
from within the `implement-figma-shadcn-next16` skill workflow.

Both agents live in the plugin's `agents/` directory and are available as Claude Code
subagents whenever the plugin is enabled.

---

## figma-token-auditor

**Purpose:** Validate that every Tailwind class in the generated TSX file traces correctly
back through the `usage → semantic → primitive` chain via `codeSyntax.WEB`. Catches broken
chains, missing variable bindings, and incorrect mode mappings.

**When to invoke:** After the TSX file has been saved (Step 7 of implement-figma-shadcn-next16).

**Invocation:** Launch as a subagent (Agent tool or equivalent) with the following context:

```
Task: Audit Figma token chain resolution for [ComponentName].tsx

Inputs:
1. TSX file path: [absolute path to generated .tsx file]
2. Variable defs: [full output from mcp__figma__get_variable_defs]
3. Token usage list:
   - [usage alias] → [semantic variable] → [primitive] — used as [tailwind class]
   - [repeat for each token]
```

**Expected output format:**

```
## Token Audit Report

### ✅ Verified Tokens (N)
| Usage Alias | Semantic Variable | Primitive | Tailwind Class | Mode |

### ❌ Chain Errors (N)
| Token | Issue | Actual | Expected |

### ⚠️ Potentially Unaudited Classes (N)
- [class] on line [N] — may be from [token type]

### 🔴 Raw Values (N)
- [class] on line [N] — no token binding

### Summary
Total: N | Verified: N | Errors: N | Unaudited: N | Raw: N
Audit result: PASS / FAIL
```

**PASS criteria:** Zero chain errors. Unaudited classes and raw values are warnings only.

**If agent unavailable:** Perform a manual token chain spot-check: read the TSX file,
pick 3–5 `// token:` comments at random, verify each chain against the variable defs.
Note "manual spot-check (agent unavailable)" in the report.

---

## figma-fidelity-reviewer

**Purpose:** Compare Figma design intent (dimensions, fills, typography, effects) against
the generated TSX implementation and identify visual discrepancies.

**When to invoke:** In parallel with `figma-token-auditor`, after the TSX file is saved.

**Invocation:** Launch as a subagent with the following context:

```
Task: Review visual fidelity for [ComponentName].tsx against Figma node [nodeId]

Inputs:
1. TSX file path: [absolute path to generated .tsx file]
2. Figma screenshot URL: [URL returned by mcp__figma__get_screenshot]
3. Design context summary:
   - Node dimensions: [width]px × [height]px
   - Layout: [Auto Layout direction, gap, padding]
   - Fill: [primary fill value or token]
   - Text: [font size, weight, line height if applicable]
   - Effects: [shadow / blur if present]
4. Light/Dark strategy used: [css-variables | tailwind-dark-variant]
```

**Expected output format:**

```
## Fidelity Review Report

📸 Screenshot: [URL]

### ✅ Matching (N)
- [property]: [match description]

### ❌ Discrepancies (N)
| Property | Figma Spec | Code Value | Severity |

### ⚠️ Uncertain (N)
- [property]: [reason for uncertainty]

### 🌙 Light/Dark Coverage
- Light: ✅ / ⚠️ / ❌
- Dark: ✅ / ⚠️ / ❌ / Not reviewed

### Summary
Properties checked: N | Matching: N | Critical: N | Medium: N | Low: N
Recommendation: SHIP AS-IS / FIX BEFORE SHIP / NEEDS REDESIGN REVIEW
```

**If agent unavailable:** Include the screenshot URL in the IMPLEMENTATION_REPORT.md under
"Fidelity Review Summary" with the note "Automated fidelity review unavailable — visual review
required at [screenshot URL]".

---

## Parallel Invocation Pattern

Both agents can run concurrently since their inputs are independent (both read the TSX file
but neither writes to it):

```
# Start both agents simultaneously
launch figma-token-auditor → wait for audit result
launch figma-fidelity-reviewer → wait for fidelity result

# Collect both results before writing IMPLEMENTATION_REPORT.md
```

Do not proceed to Step 8 (IMPLEMENTATION_REPORT.md generation) until both agents have
returned results — or until timeout/unavailability has been handled per the fallback
instructions above.

---

## Output Integration

Insert agent results directly into the corresponding sections of IMPLEMENTATION_REPORT.md:

- Token Audit output → "Token Audit Summary" section
- Fidelity Review output → "Fidelity Review Summary" section

If either agent returns a FAIL / "FIX BEFORE SHIP" result, include a prominent warning
in the final summary printed to the user (Step 9).
