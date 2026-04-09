# DinnerTime Component Implementation Examples

Complete, production-ready examples showing how to use the 27-component library.

## Complete Page Examples

### Home Page with Food Grid
```typescript
'use client';

import { useState } from 'react';
import { AppShell, FoodGrid, Card, Button, Modal } from '@/components';
import { AddFoodForm } from '@/components';

interface Food {
  id: string;
  name: string;
  category: string;
  prepTime?: number;
  image?: string;
  rating?: number;
  timesServed?: number;
}

export default function HomePage() {
  const [foods, setFoods] = useState<Food[]>([
    {
      id: '1',
      name: 'Spaghetti Carbonara',
      category: 'DINNER',
      prepTime: 15,
      rating: 4.5,
      timesServed: 8,
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      category: 'LUNCH',
      prepTime: 20,
      rating: 4.2,
      timesServed: 5,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFood = async (data: any) => {
    setIsLoading(true);
    try {
      // Call your API
      const newFood = { id: Date.now().toString(), ...data };
      setFoods([...foods, newFood]);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
      userImage="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
    >
      <div className="space-y-4 pb-4">
        <Card variant="flat">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              What's for Dinner?
            </h1>
            <p className="text-neutral-600">
              {foods.length} meal options available
            </p>
          </div>
        </Card>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setIsModalOpen(true)}
        >
          Add New Meal
        </Button>

        <FoodGrid
          foods={foods}
          variant="full"
          showFilters={true}
          onFoodClick={(food) => {
            console.log('Selected:', food);
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Meal"
      >
        <AddFoodForm
          isParent={true}
          isLoading={isLoading}
          onSubmit={handleAddFood}
        />
      </Modal>
    </AppShell>
  );
}
```

### Schedule Page with Week Calendar
```typescript
'use client';

import { useState } from 'react';
import { AppShell, WeekCalendar, DayCard, Card } from '@/components';
import { startOfWeek, addDays } from 'date-fns';

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    return {
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dateNum: date.getDate().toString(),
      meal: {
        id: `meal-${i}`,
        name: ['Pasta', 'Tacos', 'Chicken', 'Pizza', 'Steak', 'Fish', 'Salad'][i],
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100',
        isEatOut: i === 4,
      },
      isLocked: i < 0,
      votesOpen: i > 2 ? Math.ceil(Math.random() * 3) : 0,
    };
  });

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
    >
      <div className="space-y-4 pb-4">
        <WeekCalendar
          startDate={currentWeek}
          days={weekDays}
          onWeekChange={setCurrentWeek}
          onDayClick={setSelectedDay}
        />

        {selectedDay && (
          <Card>
            <h3 className="font-bold text-neutral-900 mb-4">
              Meal Details
            </h3>
            <DayCard
              date={selectedDay}
              meal={{
                id: '1',
                name: 'Spaghetti Carbonara',
                category: 'DINNER',
                prepTime: 30,
              }}
              votesOpen={2}
            />
          </Card>
        )}
      </div>
    </AppShell>
  );
}
```

### Voting Page
```typescript
'use client';

import { useState } from 'react';
import { AppShell, VoteSlot, Card } from '@/components';

export default function VotePage() {
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [isVoting, setIsVoting] = useState(false);

  const schedules = [
    {
      id: 'sched-1',
      date: new Date(2024, 2, 15),
      options: [
        { id: '1', name: 'Pasta Primavera', category: 'DINNER', voteCount: 3 },
        { id: '2', name: 'Grilled Salmon', category: 'DINNER', voteCount: 5 },
        { id: '3', name: 'Vegetable Stir Fry', category: 'DINNER', voteCount: 2 },
      ],
      closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: 'sched-2',
      date: new Date(2024, 2, 16),
      options: [
        { id: '4', name: 'Tacos', category: 'DINNER', voteCount: 6 },
        { id: '5', name: 'Pizza Night', category: 'DINNER', voteCount: 4 },
      ],
      closesAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  ];

  const handleVote = async (scheduleId: string, foodOptionId: string) => {
    setIsVoting(true);
    try {
      // Call your API to submit vote
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSelectedVotes((prev) => ({
        ...prev,
        [scheduleId]: foodOptionId,
      }));
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
      votingCount={schedules.length}
    >
      <div className="space-y-6 pb-4">
        <Card variant="flat">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              Family Voting
            </h1>
            <p className="text-neutral-600">
              Vote on what's for dinner
            </p>
          </div>
        </Card>

        {schedules.map((schedule) => (
          <VoteSlot
            key={schedule.id}
            scheduleEntryId={schedule.id}
            date={schedule.date}
            foodOptions={schedule.options}
            selectedVoteId={selectedVotes[schedule.id]}
            closesAt={schedule.closesAt}
            onVote={(foodId) => handleVote(schedule.id, foodId)}
          />
        ))}
      </div>
    </AppShell>
  );
}
```

### Grocery List Page
```typescript
'use client';

import { useState } from 'react';
import { AppShell, GroceryListView } from '@/components';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  section: string;
  isChecked?: boolean;
  sourceRecipes?: string[];
}

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([
    {
      id: '1',
      name: 'Tomatoes',
      quantity: 3,
      unit: 'lbs',
      section: 'Produce',
      isChecked: false,
      sourceRecipes: ['Pasta', 'Salad'],
    },
    {
      id: '2',
      name: 'Pasta',
      quantity: 1,
      unit: 'box',
      section: 'Pantry',
      isChecked: true,
      sourceRecipes: ['Pasta'],
    },
    {
      id: '3',
      name: 'Parmesan Cheese',
      quantity: 1,
      unit: 'block',
      section: 'Dairy',
      isChecked: false,
      sourceRecipes: ['Pasta'],
    },
    {
      id: '4',
      name: 'Eggs',
      quantity: 12,
      unit: 'count',
      section: 'Dairy',
      isChecked: false,
      sourceRecipes: ['Pasta'],
    },
  ]);

  const [status, setStatus] = useState<'DRAFT' | 'SHOPPING' | 'COMPLETED'>(
    'SHOPPING'
  );

  const handleToggleItem = (itemId: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isChecked: checked } : item
      )
    );
  };

  const handleGenerateList = async () => {
    // Call API to regenerate list from schedule
    console.log('Regenerating list...');
  };

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
    >
      <div className="space-y-4 pb-4">
        <GroceryListView
          items={items}
          status={status}
          onToggleItem={handleToggleItem}
          onGenerateList={handleGenerateList}
        />
      </div>
    </AppShell>
  );
}
```

### Statistics Page
```typescript
'use client';

import { AppShell, CategoryChart, TopMealsList, RatingTrendChart } from '@/components';

export default function StatsPage() {
  const categoryData = [
    { category: 'DINNER', count: 24 },
    { category: 'BREAKFAST', count: 8 },
    { category: 'LUNCH', count: 12 },
    { category: 'SNACK', count: 4 },
  ];

  const topMeals = [
    { id: '1', name: 'Spaghetti Carbonara', rating: 4.8, timesServed: 10 },
    { id: '2', name: 'Grilled Salmon', rating: 4.7, timesServed: 8 },
    { id: '3', name: 'Pad Thai', rating: 4.6, timesServed: 7 },
  ];

  const bottomMeals = [
    { id: '4', name: 'Liver & Onions', rating: 2.1, timesServed: 1 },
    { id: '5', name: 'Burnt Beans', rating: 1.9, timesServed: 2 },
  ];

  const trendData = [
    { period: 'Week 1', rating: 4.0 },
    { period: 'Week 2', rating: 4.2 },
    { period: 'Week 3', rating: 4.5 },
    { period: 'Week 4', rating: 4.3 },
    { period: 'Week 5', rating: 4.6 },
  ];

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
    >
      <div className="space-y-6 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">
          Family Statistics
        </h1>

        <CategoryChart data={categoryData} />

        <RatingTrendChart data={trendData} />

        <TopMealsList topMeals={topMeals} bottomMeals={bottomMeals} />
      </div>
    </AppShell>
  );
}
```

### Feedback Page
```typescript
'use client';

import { useState } from 'react';
import { AppShell, FeedbackCard, Card } from '@/components';

export default function FeedbackPage() {
  const [recentMeals] = useState([
    {
      id: '1',
      name: 'Spaghetti Carbonara',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);

  const handleSubmitFeedback = async (data: any) => {
    console.log('Feedback submitted:', data);
    // Call your API
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
    >
      <div className="space-y-4 pb-4">
        <Card variant="flat">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              Rate Your Meals
            </h1>
            <p className="text-neutral-600">
              Help improve our meal planning
            </p>
          </div>
        </Card>

        {recentMeals.map((meal) => (
          <FeedbackCard
            key={meal.id}
            mealId={meal.id}
            mealName={meal.name}
            mealImage={meal.image}
            onSubmit={handleSubmitFeedback}
          />
        ))}
      </div>
    </AppShell>
  );
}
```

### Breakfast Prep Tracking
```typescript
'use client';

import { AppShell, BreakfastPrepCard, Button, Card } from '@/components';

export default function BreakfastPage() {
  const prepItems = [
    {
      id: '1',
      name: 'Overnight Oats',
      image: 'https://images.unsplash.com/photo-1517139776688-4fc80606f4a2?w=100',
      batchYield: 5,
      yieldUnit: 'servings',
      storageMethod: 'FRIDGE' as const,
      shelfLifeDays: 5,
      servingsRemaining: 3,
      lastPrepDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Breakfast Burritos',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=100',
      batchYield: 10,
      yieldUnit: 'burritos',
      storageMethod: 'FREEZER' as const,
      shelfLifeDays: 30,
      servingsRemaining: 6,
      lastPrepDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <AppShell
      familyName="The Smiths"
      userName="John"
    >
      <div className="space-y-4 pb-4">
        <Card variant="flat">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">
              Breakfast Prep
            </h1>
            <p className="text-neutral-600">
              Track your meal prep items
            </p>
          </div>
        </Card>

        <Button variant="secondary" size="lg" fullWidth>
          Add New Prep Item
        </Button>

        {prepItems.map((item) => (
          <BreakfastPrepCard
            key={item.id}
            {...item}
            onClick={() => console.log('View:', item.name)}
          />
        ))}
      </div>
    </AppShell>
  );
}
```

## Common Patterns

### Modal Dialog Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open</Button>
  
  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Dialog Title"
  >
    <div className="space-y-4">
      {/* Content */}
      <Button
        fullWidth
        onClick={() => {
          // Handle action
          setIsOpen(false);
        }}
      >
        Confirm
      </Button>
    </div>
  </Modal>
</>
```

### Form Pattern with Loading
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (data: any) => {
  setIsLoading(true);
  try {
    await api.submitForm(data);
    // Success handling
  } finally {
    setIsLoading(false);
  }
};

<AddFoodForm
  isLoading={isLoading}
  onSubmit={handleSubmit}
/>
```

### Async State with Error Handling
```typescript
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await api.getData();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

return isLoading ? (
  <LoadingSpinner fullPage />
) : error ? (
  <EmptyState
    title="Error"
    description={error}
    action={{ label: 'Retry', onClick: fetchData }}
  />
) : (
  <div>{/* Render data */}</div>
);
```

### Responsive Grid
```typescript
// FoodGrid automatically handles responsive columns:
// Mobile: 2 columns
// Tablet (768px+): 3 columns  
// Desktop (1024px+): 4 columns

<FoodGrid foods={foods} variant="compact" />
```

### Filter & Search Pattern
```typescript
const [search, setSearch] = useState('');
const [selectedCategory, setSelectedCategory] = useState(null);

const filtered = foods.filter(f =>
  f.name.toLowerCase().includes(search.toLowerCase()) &&
  (!selectedCategory || f.category === selectedCategory)
);

<FoodGrid foods={filtered} showFilters={true} />
```

## TypeScript Patterns

### Component Props Interface
```typescript
interface MyComponentProps {
  title: string;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'alternate';
  size?: 'sm' | 'md' | 'lg';
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  isLoading = false,
  onClick,
  className,
  variant = 'default',
  size = 'md',
}) => {
  return (/* ... */);
};
```

### Async Handler Types
```typescript
type AsyncHandler = (data: any) => void | Promise<void>;

interface FormProps {
  onSubmit: AsyncHandler;
  isLoading?: boolean;
}
```

## Performance Tips

1. **Use key in lists**: Always provide unique keys for mapped components
2. **Memoize callbacks**: Wrap onClick handlers in useCallback for complex lists
3. **Lazy load images**: Use image URLs that support lazy loading
4. **Debounce search**: Debounce search input for FoodGrid/filtering
5. **Pagination**: For long lists, consider implementing pagination instead of showing all items
6. **Virtual scrolling**: For very large lists, consider react-virtual

## Accessibility Checklist

- All buttons have min 44px × 44px tap targets ✓
- Form inputs have associated labels ✓
- Color contrast meets WCAG AA ✓
- Focus indicators are visible ✓
- Semantic HTML structure ✓
- ARIA labels on icons ✓
- Keyboard navigation support ✓

## Testing Helpers

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Test button click
const user = userEvent.setup();
render(<Button onClick={onClick}>Click</Button>);
await user.click(screen.getByRole('button'));

// Test form submission
render(<AddFoodForm onSubmit={onSubmit} />);
await user.type(screen.getByLabelText(/name/i), 'Pasta');
await user.click(screen.getByRole('button', { name: /submit/i }));
```

These examples cover the most common use cases. Refer to `COMPONENTS.md` for detailed API documentation.
