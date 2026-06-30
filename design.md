# DESIGN.md

## Design Direction

Radio Plugger uses a light, structured, conversion-focused design system.

The visual direction is:

- modern
- clean
- grid-based
- blue-led for actions
- restrained with spacing and contrast instead of decorative effects

This project should not introduce ad hoc colors, random gradients, or one-off visual styles.

## Source Of Truth

All product colors and shadows must come from:

- `src/app/globals.css`

Do not use:

- raw hex colors in components
- arbitrary Tailwind colors such as `text-blue-600`, `bg-slate-50`, `border-gray-200`
- arbitrary shadow values such as `shadow-[0px_40px_40px_0px_rgba(0,70,123,0.06)]`
- inline `style={...}` anywhere in product code
- template literal class strings for conditional styling such as ``className={`${isActive ? "bg-primary" : "bg-secondary"}`}``

If a required color token or shadow does not exist, add it in `src/app/globals.css` first, then use that token everywhere.

## Approved Color Tokens

These tokens are mapped from the Figma variable collection and design direction.

### Brand And Surface Tokens

- `--bg-primary`: `#0053D0`
- `--bg-secondary`: `#EAF2FF`
- `--bg-white`: `#FFFFFF`
- `--primary-soft`: `rgb(0 83 208 / 10%)`
- `--secondary-soft`: `rgb(234 242 255 / 40%)`
- `--stroke`: `rgb(194 198 216 / 32%)`

### Text Tokens

- `--primary-text`: `#191C1D`
- `--secondary-text`: `#414750`

### Badge Tokens

- `--badge-active-bg`: `#dcfce7` - Active status background
- `--badge-active-text`: `#00a63e` - Active status text
- `--badge-pending-bg`: `#ffedd4` - Pending status background
- `--badge-pending-text`: `#ca3500` - Pending status text
- `--badge-archived-bg`: `#f3f4f6` - Archived status background
- `--badge-archived-text`: `#4a5565` - Archived status text
- `--badge-single-bg`: `#dbeafe` - Single type background
- `--badge-single-text`: `var(--bg-primary)` - Single type text
- `--badge-ep-bg`: `#f3e8ff` - EP type background
- `--badge-ep-text`: `#9810fa` - EP type text
- `--badge-album-bg`: `#fce7f3` - Album type background
- `--badge-album-text`: `#e60076` - Album type text

### Overlay Tokens

- `--white-70`: `rgb(255 255 255 / 70%)`
- `--white-50`: `rgb(255 255 255 / 50%)`
- `--black-30`: `rgb(0 0 0 / 30%)`

### Shadow Tokens

- `--shadow-header`: `0px 40px 40px 0px #00467B0F` - Used for header/navigation shadow
- `--shadow-button`: `0px 1px 2px 0px rgba(0, 0, 0, 0.05)` - Used for button shadow
- `--shadow-footer`: `0px -1px 20px 0px rgba(34, 110, 248, 0.2)` - Used for footer shadow

## Semantic Usage Rules

Use semantic tokens first.

### Preferred Tailwind Utilities

- `bg-primary`: primary CTA backgrounds
- `text-primary-foreground`: text/icons on primary surfaces
- `bg-secondary`: soft blue sections and cards that need tint
- `text-secondary-foreground`: text/icons on secondary surfaces
- `bg-background`: app/page base background
- `bg-card`: white card surfaces
- `text-foreground`: primary text
- `text-muted-foreground`: secondary/supporting text
- `border-border`: strokes, dividers, input borders
- `ring-ring`: focus rings
- `bg-accent`: hover/focus highlight surfaces
- `text-accent-foreground`: text/icons on accent surfaces

### Direct Named Utilities Available From Theme

These can be used when the semantic token is not specific enough:

- `text-primary-text`
- `text-secondary-text`
- `bg-bg-primary`
- `bg-bg-secondary`
- `bg-bg-white`
- `bg-primary-soft`
- `bg-secondary-soft`
- `border-stroke`

## Component Rules

### Class Name Composition

- For conditional classes, always use `cn()` from `@/lib/utils`
- Do not build conditional class names with template literals
- Do not manually concatenate class strings with `+`, arrays, or ad hoc helpers

Use:

```tsx
className={cn(
  "base-classes",
  isActive && "bg-primary text-primary-foreground",
  isMuted && "text-muted-foreground",
)}
```

Do not use:

```tsx
className={\`base-classes \${isActive ? "bg-primary text-primary-foreground" : ""}\`}
```

```tsx
className={isActive ? "base-classes bg-primary" : "base-classes bg-secondary"}
```

### Icons

- Use `lucide-react` for product UI icons
- Do not introduce additional icon libraries for regular app UI
- Keep icon usage visually consistent across pages, cards, buttons, nav, and admin screens
- If an icon is missing from Lucide, raise it before adding another icon source

### Buttons

- Primary buttons must use `bg-primary text-primary-foreground`
- Secondary or quiet surfaces should use `bg-secondary text-secondary-foreground`
- Outline buttons should use tokenized borders only, never gray hardcodes

### Cards

- Use `bg-card`
- Use `border-border`
- Keep shadows subtle
- Do not add colored card borders unless the design specifically needs an action state

### Text

- Main headings and important labels: `text-foreground` or `text-primary-text`
- Supporting copy and metadata: `text-muted-foreground` or `text-secondary-text`
- Avoid low-contrast custom text colors

### Sections

- Separate sections with spacing first
- Use `bg-background`, `bg-secondary`, and `bg-card` for hierarchy
- Avoid heavy borders and large shadow stacks

## Typography

- Font family: Inter
- Preserve strong hierarchy
- Prefer large, clear headings and neutral body copy

Recommended intent:

- Hero headings: high impact
- Section headings: clear and structured
- Body: readable and quiet
- Labels/buttons: concise and strong

## Radius And Depth

- Base radius is controlled in `src/app/globals.css`
- Small controls should resolve to the small radius token
- Cards should use medium-to-large radius tokens
- Shadows should remain subtle and secondary to spacing and surface contrast
- Always use shadow tokens from `globals.css` (e.g., `shadow-header`) instead of arbitrary shadow values

## Design Guardrails

- Use blue as the main action color, not as a decorative fill everywhere
- Prefer white and soft-blue surfaces over noisy backgrounds
- Do not introduce purple, random green, or unrelated palette accents for product branding
- Do not hardcode status colors in components; use semantic tokens
- If a new state is needed, add a token first, then consume it
- Do not use inline styles anywhere in React components. Use Tailwind utilities, `cn()`, shared component variants, and tokens in `globals.css`.

## Implementation Rule For Agents And Developers

Before adding or changing UI:

1. Check `src/app/globals.css`
2. Reuse an existing semantic token if it fits
3. If needed, add a new approved token in `globals.css` (colors, shadows, etc.)
4. Use the token through Tailwind utilities or CSS variables
5. Do not ship raw color literals or arbitrary shadow values in component code
