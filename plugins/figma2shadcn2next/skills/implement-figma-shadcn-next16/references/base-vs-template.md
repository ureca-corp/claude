# Base Component vs Template/Example — Classification Rules

## Why This Matters

Classifying a node incorrectly leads to wrong implementation strategy:

- **Base component** → Implement as a reusable React component with props interface
- **Template/Example** → Assemble existing base components; do NOT recreate base component internals

Misclassifying a template as a base component causes unnecessary duplication.
Misclassifying a base component as a template causes loss of reusability.

---

## Classification Checklist

Answer each question. The classification with the most "yes" answers wins.
In the event of a tie, prompt the user for clarification before proceeding:
> "이 노드가 base component인지 template/example인지 명확하지 않습니다. 직접 알려주세요."

### Signals for Base Component

- [ ] The node is a main component (`type === "COMPONENT"`) or inside a component set (`type === "COMPONENT_SET"`)
- [ ] The node name matches a known shadcn/ui component (Button, Input, Badge, Card, Select, Dialog, etc.)
- [ ] The node has defined component properties (variant, size, destructive, disabled, icon, etc.)
- [ ] The node represents one interaction pattern (click a button, type in an input, select an option)
- [ ] The node is the source of truth (not an instance of another component)
- [ ] The node has no real/example content — slots, placeholder text like "Label", "Placeholder"
- [ ] The node name in Figma matches the team library component name exactly

### Signals for Template / Example

- [ ] The node is a frame or group, not a component or component set
- [ ] The node name contains "Example", "Preview", "Usage", "Demo", "Playground", "Page", "Screen", "Template", "Sample", or is a number/date-like label
- [ ] The node contains multiple distinct component instances from the team library
- [ ] The node contains realistic example content (user names, prices, product titles, addresses)
- [ ] The node layout resembles a page section, card layout, or data table with rows
- [ ] The node contains instances of other team library components as children
- [ ] A designer or the file structure suggests this node exists to illustrate usage, not to be reused

---

## Node Type Reference

| `type` value | Meaning | Classification |
|---|---|---|
| `"COMPONENT"` | Main component definition | Always base component |
| `"COMPONENT_SET"` | Variant group | Always base component |
| `"INSTANCE"` | Placed instance of a component | Investigate parent component |
| `"FRAME"` | Layout frame | Usually template; check name and children |
| `"GROUP"` | Group of layers | Usually template |
| `"TEXT"` | Standalone text | Not a component |
| `"RECTANGLE"` | Shape | Not a component |

---

## Handling INSTANCE nodes

When the target node is an `INSTANCE`:

1. Identify the main component it references (`mainComponent.name`)
2. Check if that main component is in the team library or local file
3. If **team library main component** → treat the instance as a base component invocation
   - Implementation: import the shadcn/ui component and apply the instance's overrides as props
   - Do NOT reimplement the component internals
4. If **local main component** → check if it should itself be implemented (run classification on it)

### Override Handling

An instance may have overrides on top of its main component:

```
Instance override types:
- Text override → becomes a prop or children
- Fill override  → becomes a className prop or style prop
- Visibility override → becomes a boolean prop (e.g., showIcon={false})
- Component property override → becomes a variant/size/etc. prop
```

Map each override to the corresponding React prop. Do not hardcode override values —
make them configurable via props.

---

## Team Library Component Identification

To confirm a node is from the team library `Ureca Shadcn`:

1. In `get_design_context`, check `componentSetId` or `componentId`
2. In `get_metadata`, check if the component source is an external library
3. The component name should match a known shadcn/ui primitive or composite component

Known base components in Ureca Shadcn (non-exhaustive):
- Primitives: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- Feedback: Badge, Alert, Toast, Progress, Skeleton
- Overlay: Dialog, Sheet, Popover, Tooltip, DropdownMenu, ContextMenu
- Layout: Card, Separator, ScrollArea, Tabs, Accordion
- Navigation: NavigationMenu, Breadcrumb, Pagination
- Data: Table, DataTable, Calendar
- Form: Form, Label, FormField, FormMessage

Any component not in this list should default to the template strategy, unless the node
`type` is `COMPONENT` or `COMPONENT_SET` — in which case treat it as a base component
regardless of name.

---

## Handling Ambiguous Cases

### "It looks like both"

Some nodes are base components that include example states in the same file frame.
The canonical rule: **classify by node, not by file**. If the target node is a `COMPONENT`
or `COMPONENT_SET`, it is a base component regardless of surrounding context.

### Custom composite components

A team may define composite components (e.g., `ProductCard`) that are stored as main
components in the library. These are base components too — even if they contain multiple
shadcn/ui primitives. Implement them as a single exported React component that accepts props.

### Page sections

A section like "Hero Section" or "Pricing Card" is always a template. Implement by
assembling imported base components; provide a layout wrapper component if needed.

---

## Output by Classification

### Base Component Output

```
ComponentName.tsx              ← reusable component with props interface
IMPLEMENTATION_REPORT.md       ← token map, shadcn install, issues
```

### Template / Example Output

```
ComponentNameSection.tsx       ← composition (imports base components)
IMPLEMENTATION_REPORT.md       ← token map, list of base components assembled
```

### After User Confirmation (for ambiguous template nodes)

If the user confirms "implement as base component" for a node that looks like a template,
proceed with base component strategy but note the discrepancy in IMPLEMENTATION_REPORT.md.

If the user confirms "implement as template", assemble from base components and list
each base component used.
