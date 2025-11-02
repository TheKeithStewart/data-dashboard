# Design Specification: [Project Name]

**Project ID**: [project-name]
**Design Phase**: Completed on [YYYY-MM-DD]
**MANIFEST Reference**: [Path to MANIFEST.md]

## Design Overview

### Design Philosophy
[Brief description of the design approach and goals]

### Design Principles
1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

### Target Audience
- **Primary Users**: [Description]
- **User Personas**: [Link or brief description]
- **Accessibility Requirements**: WCAG 2.1 AA compliance

## Figma Integration

### Figma File Details
- **File URL**: [Figma file URL]
- **File ID**: [Extracted from URL]
- **Last Updated**: [Date]
- **Figma Version**: [Version or timestamp]

### MCP Server Setup
```bash
# Figma MCP server configuration
# See figma-mcp-setup.md for detailed instructions

# Required environment variables
FIGMA_ACCESS_TOKEN=your_token_here
FIGMA_FILE_ID=abc123...
```

### Design Extraction Summary
- Design tokens extracted: ✅
- Component hierarchy mapped: ✅
- Responsive specifications documented: ✅
- shadcn/ui mappings completed: ✅

## Design System

### Color Palette

#### Primary Colors
```css
--primary-50: #[hex]
--primary-100: #[hex]
--primary-500: #[hex]  /* Main brand color */
--primary-900: #[hex]
```

#### Semantic Colors
```css
--background: #[hex]
--foreground: #[hex]
--card: #[hex]
--card-foreground: #[hex]
--popover: #[hex]
--popover-foreground: #[hex]
--primary: #[hex]
--primary-foreground: #[hex]
--secondary: #[hex]
--secondary-foreground: #[hex]
--muted: #[hex]
--muted-foreground: #[hex]
--accent: #[hex]
--accent-foreground: #[hex]
--destructive: #[hex]
--destructive-foreground: #[hex]
--border: #[hex]
--input: #[hex]
--ring: #[hex]
```

#### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#[hex]',
          100: '#[hex]',
          // ... full scale
        }
      }
    }
  }
}
```

### Typography

#### Font Families
- **Primary**: [Font name] - For headings and important text
- **Secondary**: [Font name] - For body text
- **Monospace**: [Font name] - For code and technical content

#### Typography Scale
| Style | Font | Size | Weight | Line Height | Use Case |
|-------|------|------|--------|-------------|----------|
| H1 | [Font] | 48px | 700 | 1.2 | Page titles |
| H2 | [Font] | 36px | 600 | 1.3 | Section headings |
| H3 | [Font] | 24px | 600 | 1.4 | Subsections |
| H4 | [Font] | 20px | 500 | 1.5 | Card titles |
| Body | [Font] | 16px | 400 | 1.6 | Main text |
| Small | [Font] | 14px | 400 | 1.5 | Secondary text |
| Caption | [Font] | 12px | 400 | 1.4 | Labels, captions |

#### Tailwind Typography Classes
```javascript
// Map design tokens to Tailwind classes
h1: 'text-5xl font-bold leading-tight'
h2: 'text-4xl font-semibold leading-snug'
h3: 'text-2xl font-semibold leading-normal'
body: 'text-base font-normal leading-relaxed'
```

### Spacing System

#### Spacing Scale
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

#### Layout Patterns
- **Container Max Width**: 1280px
- **Content Max Width**: 768px (for readable text)
- **Grid Columns**: 12 columns
- **Grid Gap**: 24px (desktop), 16px (mobile)
- **Section Padding**: 64px (desktop), 32px (mobile)

### Shadows & Effects

#### Shadow Scale
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

#### Border Radius
```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-full: 9999px
```

## Component Library

### shadcn/ui Components

#### Button Component
**Variants**:
- `default`: Primary action button
- `destructive`: Dangerous actions (delete, remove)
- `outline`: Secondary actions
- `ghost`: Tertiary actions
- `link`: Text-only links

**Sizes**:
- `sm`: Small buttons (32px height)
- `md`: Default buttons (40px height)
- `lg`: Large buttons (48px height)

**Usage Examples**:
```tsx
<Button variant="default" size="md">Primary Action</Button>
<Button variant="outline" size="sm">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
```

#### Card Component
**Purpose**: Container for related content

**Composition**:
- `Card`: Root container
- `CardHeader`: Top section with title
- `CardTitle`: Card heading
- `CardDescription`: Subtitle text
- `CardContent`: Main content area
- `CardFooter`: Actions or metadata

**Usage Example**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Dialog Component
**Purpose**: Modal dialogs and overlays

**States**:
- Open: Dialog visible with backdrop
- Closed: Dialog hidden

**Accessibility**:
- Focus trapped within dialog
- Escape key closes dialog
- Click backdrop closes dialog
- Focus returns to trigger on close

#### Form Components
**Components**:
- `Input`: Text input fields
- `Label`: Form labels
- `Select`: Dropdown selection
- `Checkbox`: Boolean selection
- `RadioGroup`: Single choice from options
- `Textarea`: Multi-line text input

**Validation**:
- Required field indicators
- Error message display
- Success states
- Disabled states

### Custom Components

#### [Custom Component Name]
**Purpose**: [Component purpose]

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| [prop] | [type] | [default] | [description] |

**Composition**:
Built with: [List of shadcn/ui components used]

**Usage Example**:
```tsx
<CustomComponent prop="value" />
```

## Page Layouts

### Home Page
**Layout**: Root layout with navigation

**Sections**:
1. **Hero Section**
   - Heading: [Text]
   - Subheading: [Text]
   - CTA Button: [Text and action]
   - Visual: [Image or illustration]

2. **Features Section**
   - Layout: 3-column grid
   - Cards: Feature cards with icon, title, description
   - Spacing: 24px gap between cards

3. **CTA Section**
   - Heading: [Text]
   - Button: [Primary CTA]

**Components Used**:
- Button (shadcn)
- Card (shadcn)
- [Custom components]

### Dashboard Page
**Layout**: Dashboard layout with sidebar navigation

**Sections**:
1. **Header**
   - Page title
   - Actions toolbar
   - Breadcrumbs

2. **Stats Cards**
   - Layout: 4-column grid (responsive to 2-col on tablet, 1-col on mobile)
   - Cards: Metric cards showing key numbers
   - Components: Card (shadcn)

3. **Main Content**
   - [Content description]
   - Components: [List components]

4. **Sidebar**
   - Navigation links
   - User profile
   - Settings access

### [Additional Pages]
[Repeat structure for each major page]

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First Approach
All designs start with mobile and scale up.

### Responsive Patterns

#### Navigation
- **Mobile**: Hamburger menu, drawer navigation
- **Tablet**: Collapsible sidebar
- **Desktop**: Full sidebar navigation

#### Grid Layouts
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns

#### Typography
- **Mobile**: Smaller sizes (base 14px)
- **Desktop**: Full sizes (base 16px)

## Interaction Patterns

### Button Interactions
- **Hover**: Slight darkening, smooth transition
- **Active**: Further darkening, scale down 98%
- **Focus**: Ring indicator for keyboard navigation
- **Disabled**: Reduced opacity (50%), no interaction

### Form Interactions
- **Focus**: Input border highlight, ring indicator
- **Error**: Red border, error message below
- **Success**: Green border, success message
- **Loading**: Spinner or skeleton state

### Navigation
- **Active Link**: Highlighted with background color
- **Hover**: Slight background change
- **Transition**: Smooth page transitions

### Modal/Dialog
- **Open**: Fade in with backdrop
- **Close**: Fade out, focus returns to trigger
- **Backdrop Click**: Closes dialog

## Animation & Motion

### Transition Timing
- **Fast**: 150ms - Small interactions (button hover)
- **Medium**: 300ms - Modals, dropdowns
- **Slow**: 500ms - Page transitions

### Easing Functions
- **Default**: ease-in-out
- **Enter**: ease-out
- **Exit**: ease-in

### Animation Principles
1. **Subtle**: Animations should enhance, not distract
2. **Fast**: Keep animations under 500ms
3. **Purposeful**: Animate only when it adds meaning
4. **Accessible**: Respect prefers-reduced-motion

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels for icon buttons
- [ ] Semantic HTML structure
- [ ] Alt text for all images
- [ ] Form labels properly associated

### Keyboard Navigation
- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward
- **Enter**: Activate buttons and links
- **Escape**: Close modals and dropdowns
- **Arrow Keys**: Navigate within component (select, radio)

### Screen Reader Support
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA landmarks (main, nav, aside, footer)
- ARIA labels for icon-only buttons
- Live regions for dynamic content
- Skip to content link

## Design Assets

### Icons
**Icon Library**: [Lucide / Heroicons / Custom]
**Size Scale**: 16px, 20px, 24px, 32px

### Images
**Formats**: WebP with PNG fallback
**Optimization**: Next.js Image component
**Responsive**: Multiple sizes for different viewports

### Illustrations
[Description of illustration style and usage]

## Design Deliverables

### From UI Designer
- [ ] Visual design system documented
- [ ] Color palette with Tailwind mapping
- [ ] Typography scale defined
- [ ] Spacing system documented
- [ ] Layout wireframes created

### From shadcn Expert
- [ ] Component catalog completed
- [ ] Component variants specified
- [ ] Design system configuration
- [ ] Composition patterns documented

### From Figma Design Expert (if applicable)
- [ ] Figma designs analyzed
- [ ] Design tokens extracted
- [ ] Component specifications created
- [ ] Implementation roadmap provided
- [ ] MCP setup documented

## Implementation Notes

### Priority Order
1. **Phase 1**: Design system setup (colors, typography, Tailwind config)
2. **Phase 2**: Core layout components (navigation, footer)
3. **Phase 3**: shadcn/ui component installation
4. **Phase 4**: Page layouts and routing
5. **Phase 5**: Feature components and interactions

### Design-to-Code Mapping
| Design Element | Implementation |
|----------------|----------------|
| Figma Component | shadcn/ui component + Tailwind |
| Color Token | CSS variable + Tailwind class |
| Text Style | Tailwind typography class |
| Spacing | Tailwind spacing utility |
| Layout | Next.js layout component |

### Known Design Decisions
1. **[Decision 1]**: [Rationale]
2. **[Decision 2]**: [Rationale]

## References

- **MANIFEST.md**: [Path to manifest]
- **Figma File**: [URL]
- **System Architect Output**: [Path]
- **UI Designer Output**: [Path]
- **shadcn Expert Output**: [Path]
- **Figma Design Expert Output**: [Path]

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | Design Team | Initial design specification |
