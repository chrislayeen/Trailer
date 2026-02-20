# Logistics Suite Design Tokens

Unified design system documentation for both User and Admin portals.

## 1. Color Palette

### Neutrals (Slate)
Used for backgrounds, borders, and text. Consistent with the "Gray instead of Black" requirement.
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--slate-50` | `#f8fafc` | Surface background |
| `--slate-100` | `#f1f5f9` | Secondary background |
| `--slate-200` | `#e2e8f0` | Standard border |
| `--slate-400` | `#94a3b8` | Muted text / base icons |
| `--slate-500` | `#64748b` | Secondary text |
| `--slate-900` | `#0f172a` | Primary text / Headings |
| `--slate-950` | `#020617` | High-contrast backgrounds |

### Identity & Functional
| Token | Value | usage |
| :--- | :--- | :--- |
| `--primary` | `#1d4ed8` | Primary actions, branding |
| `--success` | `#10b981` | Success states |
| `--error` | `#ef4444` | Errors / Danger |
| `--warning` | `#f59e0b` | Warnings |

## 2. Spacing Scale (4px Base)
Standardized scale for margins, padding, and gaps.
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 24px
- `--space-6`: 32px
- `--space-8`: 48px
- `--space-10`: 64px

## 3. Typography Scale
- `--text-xs`: 0.75rem
- `--text-sm`: 0.875rem
- `--text-base`: 1rem
- `--text-lg`: 1.125rem
- `--text-xl`: 1.25rem
- `--text-2xl`: 1.5rem
- `--text-3xl`: 1.875rem

## 4. Radii
- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 14px
- `--radius-pill`: 9999px

## Usage Guidelines
1. **Gray instead of Black:** Never use pure black (`#000`). Use `--slate-900` for primary text and `--slate-950` for dark themes.
2. **Minimal Blue:** Reserve `--primary` for core functional buttons (Submit, Start, Approve). Use `--slate-100` or `--slate-200` for secondary actions to avoid visual fatigue.
3. **Consistency:** All new components must exclusively use these tokens via `var()` syntax.
