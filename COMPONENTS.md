# DinnerTime UI Component Library

A comprehensive, production-ready React component library for the DinnerTime mobile-first PWA. All components are built with TypeScript, Tailwind CSS, and lucide-react icons with touch-friendly 44px+ minimum tap targets.

## Quick Import

```typescript
// Import components from the index
import { 
  Button, 
  Card, 
  AppShell, 
  FoodCard,
  // ... all other components
} from '@/components';
```

## Design System

### Color Palette
- **Primary**: Tomato red (#F44336 and tints/shades)
- **Secondary**: Herb green (#4CAF50 and tints/shades)
- **Accent**: Butter yellow (#FFEB3B and tints/shades)
- **Neutral**: Warm grays for text and backgrounds
- **Meal Categories**: Breakfast (yellow), Lunch (blue), Dinner (purple), Snack (orange)

### Spacing & Sizing
- **Touch targets**: Minimum 44px height/width
- **Padding**: 4px units (p-1 = 4px, p-4 = 16px, etc.)
- **Border radius**: 8px (rounded-lg) for most elements, 12px (rounded-xl) for cards

## Component Categories

---

## Layout Components

### AppShell
Complete page wrapper with header, bottom nav, and safe area handling.

```typescript
import { AppShell } from '@/components';

<AppShell
  familyName="The Smiths"
  userImage="https://..."
  userName="John"
  onLogout={async () => {...}}
  votingCount={3}
>
  <YourPageContent />
</AppShell>
```

**Props:**
- `familyName`: Display name of the family
- `userImage`: Google profile picture URL
- `userName`: Display name of logged-in user
- `showBackButton`: Show back button in header (default: false)
- `onLogout`: Async function called on logout
- `votingCount`: Number of open votes for badge (default: 0)
- `mainClassName`: Additional classes for main content area

---

### TopHeader
Sticky header with family name and user avatar dropdown.

```typescript
<TopHeader
  familyName="The Smiths"
  userImage="https://..."
  userName="John"
  showBackButton={true}
  onLogout={async () => {...}}
/>
```

**Props:**
- `familyName`: Family name to display (default: "Family")
- `userImage`: User profile image URL
- `userName`: Full name for dropdown
- `showBackButton`: Show navigation back button (default: false)
- `onLogout`: Async logout handler

---

### BottomNav
Fixed bottom navigation with 5 tabs and vote badge.

```typescript
<BottomNav votingCount={3} />
```

**Props:**
- `votingCount`: Shows badge with count on Vote tab (default: 0)

**Navigation Routes:**
- Home → `/home`
- Schedule → `/schedule`
- Vote → `/vote` (with badge)
- Grocery → `/grocery`
- More → `/settings`

---

## UI Primitives

### Button
Versatile button with multiple variants and sizes.

```typescript
import { Button } from '@/components';

<Button 
  variant="primary" 
  size="md" 
  isLoading={false}
  fullWidth={false}
  onClick={() => {}}
>
  Click me
</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`
**Props:**
- `variant`: Button style (default: "primary")
- `size`: Button size (default: "md")
- `fullWidth`: Take full width (default: false)
- `isLoading`: Show spinner and disable (default: false)

---

### Card
Flexible container with multiple style variants.

```typescript
<Card variant="default" interactive={true} onClick={() => {}}>
  Content here
</Card>
```

**Variants:** `default` (with shadow), `elevated` (more shadow), `flat` (minimal)
**Props:**
- `variant`: Card style (default: "default")
- `interactive`: Add hover/tap effects (default: false)
- `onClick`: Click handler for interactive cards

---

### Badge
Small tag/label component with category colors.

```typescript
<Badge variant="dinner" size="md">
  Dinner
</Badge>
```

**Variants:** `breakfast`, `lunch`, `dinner`, `snack`, `primary`, `secondary`, `accent`, `neutral`
**Sizes:** `sm`, `md`

---

### Avatar
Circular profile picture with fallback initials.

```typescript
<Avatar 
  src="https://..."
  alt="John"
  initials="JS"
  size="md"
  border={true}
/>
```

**Sizes:** `sm` (32px), `md` (40px), `lg` (56px)
**Props:**
- `src`: Image URL (optional)
- `initials`: Fallback if no image (default: "U")
- `border`: Add ring border (default: false)

---

### Modal
Bottom sheet modal that slides up from bottom.

```typescript
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  showCloseButton={true}
>
  Content here
</Modal>
```

**Props:**
- `isOpen`: Control modal visibility
- `onClose`: Called when user closes
- `title`: Modal title (optional)
- `showCloseButton`: Show X button (default: true)
- `fullHeight`: Use 90vh instead of 80vh (default: false)

---

### LoadingSpinner
Animated spinner for loading states.

```typescript
<LoadingSpinner 
  size="md"
  fullPage={false}
  label="Loading..."
/>
```

**Sizes:** `sm`, `md`, `lg`
**Props:**
- `size`: Spinner size (default: "md")
- `fullPage`: Full-page overlay backdrop (default: false)
- `label`: Optional loading text

---

### EmptyState
Placeholder for empty lists/sections.

```typescript
<EmptyState
  icon="🍽️"
  title="No meals found"
  description="Try searching or add a new meal"
  action={{
    label: "Add Meal",
    onClick: () => {}
  }}
/>
```

**Props:**
- `icon`: Emoji or React component
- `title`: Main heading
- `description`: Supporting text
- `action`: Optional action button with label and onClick

---

### StarRating
Interactive or display-only 5-star rating.

```typescript
<StarRating
  value={4}
  onChange={(value) => {}}
  readOnly={false}
  showValue={true}
  size="md"
/>
```

**Sizes:** `sm`, `md`, `lg`
**Props:**
- `value`: Current rating (0-5)
- `onChange`: Called when rating changes (optional)
- `readOnly`: Display-only mode (default: false)
- `showValue`: Show numeric value (default: true)
- `maxValue`: Max stars (default: 5)

---

### ProgressBar
Animated horizontal progress indicator.

```typescript
<ProgressBar
  percentage={65}
  height={8}
  color="primary"
  animated={true}
  showLabel={true}
/>
```

**Colors:** `primary`, `secondary`, `accent`, `success`, `warning`, `danger`
**Props:**
- `percentage`: Progress amount 0-100
- `height`: Bar height in px (default: 8)
- `color`: Bar color (default: "primary")
- `animated`: Animate fill (default: true)
- `showLabel`: Show percentage text (default: false)

---

## Food Components

### FoodCard
Display single meal option as a card.

```typescript
<FoodCard
  id="meal-1"
  name="Spaghetti Carbonara"
  category="DINNER"
  prepTime={15}
  image="https://..."
  rating={4.5}
  timesServed={8}
  variant="full"
  onClick={() => {}}
/>
```

**Variants:** `compact` (2 cols), `full` (1 col with large image)
**Props:**
- `id`, `name`, `category`: Required
- `prepTime`: Minutes to prepare
- `image`: Meal photo URL
- `rating`: Star rating 0-5
- `timesServed`: Number of times served
- `variant`: Layout style (default: "full")
- `onClick`: Click handler

---

### FoodGrid
Responsive grid of food cards with search and filter.

```typescript
<FoodGrid
  foods={[
    { id: '1', name: 'Pasta', category: 'DINNER', ... },
    ...
  ]}
  variant="full"
  showFilters={true}
  onFoodClick={(food) => {}}
/>
```

**Props:**
- `foods`: Array of food objects
- `onFoodClick`: Called when food card clicked
- `variant`: Card layout style (default: "full")
- `showFilters`: Show search/category filters (default: true)

Grid: 2 cols mobile, 3 tablet, 4 desktop

---

### AddFoodForm
Form to create new food option.

```typescript
<AddFoodForm
  isParent={true}
  isLoading={false}
  onSubmit={async (data) => {
    // { name, category, prepTime, cookTime, servings, 
    //   recipeUrl, ingredients, dietaryTags, mealType }
  }}
/>
```

**Props:**
- `isParent`: Show meal type toggle (default: false)
- `isLoading`: Show loading spinner (default: false)
- `onSubmit`: Called with form data

**Fields:**
- Meal name (required)
- Category dropdown
- Prep/cook times
- Servings
- Recipe URL
- Ingredients (add/remove rows)
- Dietary tags (searchable chips)
- Meal type toggle (parents only)

---

## Schedule Components

### WeekCalendar
Horizontal scrollable week view.

```typescript
<WeekCalendar
  startDate={new Date()}
  days={[
    { date: new Date(), dayName: 'Mon', dateNum: '1', meal: {...} },
    ...
  ]}
  onWeekChange={(date) => {}}
  onDayClick={(date) => {}}
/>
```

**Props:**
- `startDate`: First day of week
- `days`: Array of day objects with optional meal
- `onWeekChange`: Previous/next week clicked
- `onDayClick`: Day card clicked

**Day Object:**
```typescript
{
  date: Date;
  dayName: string;
  dateNum: string;
  meal?: { id, name, image?, isEatOut? };
  isLocked?: boolean;
  votesOpen?: number;
}
```

---

### DayCard
Single day meal card with details.

```typescript
<DayCard
  date={new Date()}
  meal={{
    id: '1',
    name: 'Tacos',
    category: 'DINNER',
    image: 'https://...',
    prepTime: 30
  }}
  isLocked={false}
  votesOpen={2}
  onClick={() => {}}
/>
```

**Props:**
- `date`: Date to display
- `meal`: Meal details (optional)
- `isEatOut`: Show "Eat Out Night" state
- `isLocked`: Show lock icon
- `votesOpen`: Show vote count badge
- `onClick`: Click handler

---

### MonthView
Calendar grid with tiny meal indicators.

```typescript
<MonthView
  currentMonth={new Date()}
  days={[
    { date: new Date(), category: 'DINNER', hasEatOut: false },
    ...
  ]}
  onMonthChange={(date) => {}}
  onDayClick={(date) => {}}
/>
```

**Props:**
- `currentMonth`: Month to display
- `days`: Array of day objects
- `onMonthChange`: Previous/next month
- `onDayClick`: Date clicked

Each date shows colored dot for category.

---

## Vote Components

### VoteCard
Votable food option card.

```typescript
<VoteCard
  id="meal-1"
  name="Chicken Stir Fry"
  category="DINNER"
  image="https://..."
  voteCount={3}
  isSelected={false}
  onVote={() => {}}
/>
```

**Props:**
- `id`, `name`: Required
- `category`: Meal type for badge
- `image`: Photo URL
- `voteCount`: Current vote count
- `isSelected`: Show checkmark overlay
- `onVote`: Vote button clicked

---

### VoteSlot
All votable meals for a schedule entry.

```typescript
<VoteSlot
  scheduleEntryId="sched-1"
  date={new Date()}
  foodOptions={[
    { id: '1', name: 'Pasta', category: 'DINNER', voteCount: 2 },
    ...
  ]}
  selectedVoteId="1"
  closesAt={new Date(Date.now() + 24 * 60 * 60 * 1000)}
  onVote={async (foodOptionId) => {}}
/>
```

**Props:**
- `scheduleEntryId`: Schedule entry ID
- `date`: Date of meal
- `foodOptions`: Available options
- `selectedVoteId`: Current user's vote
- `closesAt`: Voting deadline
- `onVote`: Called when option voted

---

## Grocery Components

### GrocerySection
Collapsible section of grocery items.

```typescript
<GrocerySection
  sectionName="Produce"
  items={[
    { id: '1', name: 'Tomatoes', quantity: 3, unit: 'lbs', sourceRecipes: ['Pasta'] },
    ...
  ]}
  onToggleItem={(itemId, checked) => {}}
/>
```

**Props:**
- `sectionName`: Section heading (e.g., "Dairy")
- `items`: Grocery item array
- `onToggleItem`: Checkbox toggled

---

### GroceryListView
Complete grocery list with progress bar.

```typescript
<GroceryListView
  items={[...]}
  status="SHOPPING"
  onToggleItem={(id, checked) => {}}
  onGenerateList={async () => {}}
  isLoading={false}
/>
```

**Statuses:** `DRAFT`, `SHOPPING`, `COMPLETED`
**Props:**
- `items`: All grocery items
- `status`: Current list status
- `onToggleItem`: Item checked/unchecked
- `onGenerateList`: Regenerate button clicked
- `isLoading`: Show spinner on button

---

## Stats Components

### CategoryChart
Donut chart of meal category distribution.

```typescript
<CategoryChart
  data={[
    { category: 'DINNER', count: 12 },
    { category: 'BREAKFAST', count: 8 },
    ...
  ]}
/>
```

Center shows total meal count. Legend below.

---

### TopMealsList
Ranked list of best/worst meals.

```typescript
<TopMealsList
  topMeals={[
    { id: '1', name: 'Pasta', rating: 4.8, timesServed: 10, image: '...' },
    ...
  ]}
  bottomMeals={[...]}
/>
```

**Props:**
- `topMeals`: Array of top meals
- `bottomMeals`: Array of bottom meals (optional)

Toggle between "Top 10" and "Bottom 10" tabs.

---

### RatingTrendChart
Line chart showing average rating over time.

```typescript
<RatingTrendChart
  data={[
    { period: 'Week 1', rating: 4.2 },
    { period: 'Week 2', rating: 4.5 },
    ...
  ]}
/>
```

Shows highest/lowest ratings and average.

---

## Feedback Components

### FeedbackCard
Post-meal feedback with rating and sentiment.

```typescript
<FeedbackCard
  mealId="meal-1"
  mealName="Spaghetti Carbonara"
  mealImage="https://..."
  onSubmit={async (data) => {
    // { mealId, rating, feedback: 'DOWN'|'OKAY'|'UP', comment? }
  }}
  isLoading={false}
/>
```

**Props:**
- `mealId`, `mealName`: Required
- `mealImage`: Meal photo URL
- `onSubmit`: Form submitted with data
- `isLoading`: Show spinner

Three feedback buttons: "Not Great" (thumbs down), "Okay" (neutral), "Encore!" (thumbs up)

---

## Breakfast Components

### BreakfastPrepCard
Meal prep item with storage/expiry info.

```typescript
<BreakfastPrepCard
  id="prep-1"
  name="Overnight Oats"
  image="https://..."
  batchYield={5}
  yieldUnit="servings"
  storageMethod="FRIDGE"
  shelfLifeDays={5}
  servingsRemaining={3}
  lastPrepDate={new Date()}
  onClick={() => {}}
/>
```

**Storage Methods:** `FREEZER`, `FRIDGE`, `ROOM_TEMP`, `PANTRY`
**Props:**
- `id`, `name`, `batchYield`, `yieldUnit`, `storageMethod`, `shelfLifeDays`: Required
- `image`: Prep item photo
- `servingsRemaining`: Remaining portions
- `lastPrepDate`: When prepped
- `onClick`: Card clicked

Color-coded expiry status: Green (safe), Yellow (warning), Red (expired)

---

## Usage Examples

### Complete Page Example
```typescript
'use client';

import { AppShell, FoodGrid, Button, Card } from '@/components';

export default function HomePage() {
  const foods = [/* ... */];
  
  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
    >
      <div className="space-y-4">
        <Card>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-neutral-600">What's for dinner?</p>
        </Card>
        
        <FoodGrid
          foods={foods}
          onFoodClick={(food) => console.log(food)}
        />
      </div>
    </AppShell>
  );
}
```

### Modal Example
```typescript
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>
    Add Meal
  </Button>
  
  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Add New Meal"
  >
    <AddFoodForm
      onSubmit={async (data) => {
        await api.createFood(data);
        setIsOpen(false);
      }}
    />
  </Modal>
</>
```

---

## Accessibility Features

- All interactive elements have minimum 44px tap targets
- Proper ARIA labels on buttons and inputs
- Keyboard navigation support
- Focus indicators with ring styles
- Semantic HTML structure
- Color contrast ratios meet WCAG AA standards

---

## Browser Support

- iOS Safari 13+
- Android Chrome/Firefox 90+
- Modern desktop browsers
- PWA-capable

---

## Mobile-First Design

All components are designed mobile-first with:
- Touch-friendly sizes (44px minimum)
- Optimized for 320px-480px screens
- Responsive breakpoints: mobile, tablet (768px), desktop (1024px)
- Safe area insets for notched devices
- Full viewport height support (100dvh)

---

## Animation Library

Uses Framer Motion for smooth transitions:
- Spring physics for natural feel
- Tap/click animations
- Page transitions
- Modal entrance/exit
- Loading states

All animations are performance-optimized and can be disabled via prefers-reduced-motion.

---

## Theming

All colors use Tailwind CSS custom color scale defined in `tailwind.config.ts`:
- Primary (tomato red)
- Secondary (herb green)
- Accent (butter yellow)
- Warm (golden)
- Neutral (warm grays)
- Meal categories (yellow, blue, purple, orange)

To customize, edit the `extend.colors` in the Tailwind config.
