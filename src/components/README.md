# DinnerTime Component Library

A complete, production-ready UI component library for the DinnerTime mobile-first PWA.

## Directory Structure

```
src/components/
├── layout/                    # Page structure components
│   ├── AppShell.tsx          # Complete page wrapper
│   ├── BottomNav.tsx         # Fixed bottom navigation
│   └── TopHeader.tsx         # Sticky header with user menu
│
├── ui/                       # Reusable UI primitives
│   ├── Button.tsx            # Multiple variants & sizes
│   ├── Card.tsx              # Container with style variants
│   ├── Badge.tsx             # Small tags/labels
│   ├── Avatar.tsx            # Profile pictures
│   ├── Modal.tsx             # Bottom sheet modal
│   ├── LoadingSpinner.tsx    # Animated spinner
│   ├── EmptyState.tsx        # Empty list placeholder
│   ├── StarRating.tsx        # Interactive star ratings
│   └── ProgressBar.tsx       # Animated progress bar
│
├── food/                     # Meal management components
│   ├── FoodCard.tsx          # Single meal display
│   ├── FoodGrid.tsx          # Searchable meal grid
│   └── AddFoodForm.tsx       # Create new meal form
│
├── schedule/                 # Calendar & scheduling
│   ├── WeekCalendar.tsx      # Horizontal week view
│   ├── DayCard.tsx           # Single day details
│   └── MonthView.tsx         # Month calendar grid
│
├── vote/                     # Voting interface
│   ├── VoteCard.tsx          # Votable meal option
│   └── VoteSlot.tsx          # All options for a date
│
├── grocery/                  # Shopping list
│   ├── GrocerySection.tsx    # Aisle grouping
│   └── GroceryListView.tsx   # Full list with progress
│
├── stats/                    # Analytics & insights
│   ├── CategoryChart.tsx     # Category distribution pie chart
│   ├── TopMealsList.tsx      # Ranked meals
│   └── RatingTrendChart.tsx  # Rating over time
│
├── feedback/                 # Post-meal feedback
│   └── FeedbackCard.tsx      # Rating & sentiment form
│
├── breakfast/                # Breakfast prep tracking
│   └── BreakfastPrepCard.tsx # Prep item with expiry
│
├── index.ts                  # Barrel export for all components
└── README.md                 # This file
```

## Component Count

- **Layout**: 3 components
- **UI Primitives**: 9 components
- **Food**: 3 components
- **Schedule**: 3 components
- **Vote**: 2 components
- **Grocery**: 2 components
- **Stats**: 3 components
- **Feedback**: 1 component
- **Breakfast**: 1 component

**Total: 27 production-ready components**

## Key Features

### Design System
- Color scheme: Primary (tomato red), Secondary (herb green), Accent (butter yellow), Warm neutrals
- Touch-friendly: All interactive elements have 44px+ minimum tap targets
- Mobile-first: Responsive design optimized for 320px+ screens
- Tailwind CSS: Full utility-first styling with custom color palette

### Accessibility
- WCAG AA color contrast
- Semantic HTML structure
- Focus indicators and keyboard navigation
- ARIA labels on interactive elements
- Reduced motion support

### Animation
- Framer Motion for smooth interactions
- Spring physics for natural feel
- Performance-optimized transitions
- Tap/click feedback animations

### TypeScript
- Fully typed with React.FC and proper Props interfaces
- Type-safe variants using class-variance-authority (cva)
- Export interfaces for component prop types

## Quick Start

### Import Individual Components
```typescript
import { Button, Card, FoodCard } from '@/components';
```

### Use AppShell for Full Layout
```typescript
import { AppShell } from '@/components';

export default function HomePage() {
  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
      userImage="https://..."
      onLogout={handleLogout}
      votingCount={3}
    >
      {/* Page content here */}
    </AppShell>
  );
}
```

### Create Modals
```typescript
import { Modal, Button } from '@/components';

const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Open</Button>
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Modal Title"
    >
      Modal content here
    </Modal>
  </>
);
```

## Component Props

All components follow consistent patterns:

### Common Props
- `className`: Additional Tailwind classes
- `onClick`: Click handler for interactive components
- `children`: React nodes (where applicable)

### Variant Props (Using CVA)
Components with variants use class-variance-authority:
```typescript
// Button variants: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
// Button sizes: 'sm' | 'md' | 'lg'
<Button variant="primary" size="lg">Click</Button>
```

### Async Props
Some components accept async callbacks:
```typescript
// Form submissions, API calls, etc.
<AddFoodForm
  onSubmit={async (data) => {
    await api.createFood(data);
  }}
/>
```

## Styling

All components use Tailwind CSS with:
- Custom color palette in `tailwind.config.ts`
- Utility-first approach
- `tailwind-merge` for smart class merging
- Safe area support for notched devices

### Color Usage
```typescript
// Primary actions
bg-primary-600 text-white hover:bg-primary-700

// Secondary actions
bg-secondary-600 text-white hover:bg-secondary-700

// Accent highlights
bg-accent-400 text-accent-900

// Meal categories
bg-yellow-100 (breakfast)
bg-blue-100 (lunch)
bg-purple-100 (dinner)
bg-orange-100 (snack)
```

## Forms

### Controlled Inputs
```typescript
const [value, setValue] = useState('');

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="..." // Consistent styling
/>
```

### Form Components
- `AddFoodForm`: Complete meal creation
- `FeedbackCard`: Rating and sentiment
- `GroceryListView`: Checkbox items

## Mobile Optimization

All components are optimized for mobile:

### Touch Targets
- Minimum 44px × 44px
- Tap-friendly spacing between interactive elements
- Bottom nav uses safe-area-inset

### Responsive Breakpoints
- **Mobile**: Default (320px+)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)

### Grid Systems
- FoodGrid: 2 cols mobile, 3 tablet, 4 desktop
- Schedule: Full-width mobile, cards expand on larger screens
- Stats: Single column mobile, multi-column on tablet+

## Animation Library

Uses **Framer Motion** (v11.0.0):

### Common Animations
```typescript
// Page transitions
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// Scale on tap
<motion.button whileTap={{ scale: 0.95 }} />

// Smooth spring
transition={{ type: 'spring', damping: 20, stiffness: 100 }}
```

### Components Using Animation
- Modal (slide up + fade)
- VoteCard (scale on tap)
- ProgressBar (smooth fill)
- LoadingSpinner (rotation)
- FeedbackCard (scale buttons)
- Button with loading state

## Charts (Recharts)

### Integrated Chart Components
- **CategoryChart**: PieChart with donut style
- **RatingTrendChart**: LineChart with trends
- **TopMealsList**: Data table with rankings

Uses **recharts** (v2.12.0) for responsive, mobile-friendly charts.

## Icons (Lucide React)

Uses **lucide-react** (v0.344.0) for 24×24px SVG icons:

### Common Icons Used
- Navigation: Home, Calendar, ShoppingCart, Menu, Settings
- Actions: Plus, X, ChevronLeft, ChevronRight, LogOut
- Status: Lock, Clock, Star, Snowflake, ThumbsUp, ThumbsDown
- UI: Moon, Coffee, Utensils, Apple, UtensilsCrossed

## Testing

Components are designed for easy testing:
- Ref forwarding on wrapper components
- Controlled state patterns
- Clear onClick and onChange handlers
- Mock-friendly async props

Example test setup:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components';

it('calls onClick on click', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

## Performance

### Optimization Techniques
- Memoization where appropriate
- Forward refs for DOM access
- Lazy-loaded images
- Optimized re-renders via CVA
- Efficient state management

### Bundle Size
Components use:
- Minimal dependencies (React 18, Tailwind, Framer Motion)
- Tree-shakeable exports via barrel file
- No large peer dependencies

## Customization

### Extending Components
```typescript
import { Button } from '@/components';
import { cn } from '@/lib/utils';

export function CustomButton(props) {
  return (
    <Button
      {...props}
      className={cn('custom-class', props.className)}
    />
  );
}
```

### Tailwind Config
Edit `/tailwind.config.ts` to customize:
- Colors (primary, secondary, accent, neutral)
- Spacing scales
- Border radius
- Font families
- Safe area insets

## Documentation

Full component documentation in `COMPONENTS.md`:
- Detailed prop descriptions
- Code examples for each component
- Usage patterns and best practices
- Design system specifications
- Accessibility features

## Contributing

When adding new components:

1. Create in appropriate subdirectory
2. Use TypeScript with proper typing
3. Export 'use client' for client components
4. Use CVA for variants
5. Include proper Tailwind styling
6. Add display name for debugging
7. Forward refs where applicable
8. Export from `index.ts`
9. Document in `COMPONENTS.md`

## Browser Support

- iOS Safari 13+
- Android Chrome 90+
- Modern desktop browsers
- Full PWA support

## License

Part of DinnerTime application.
