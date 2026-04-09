'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface AddFoodFormProps {
  isParent?: boolean;
  onSubmit: (data: any) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export const AddFoodForm: React.FC<AddFoodFormProps> = ({
  isParent = false,
  onSubmit,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    category: 'DINNER',
    prepTime: '',
    cookTime: '',
    servings: '',
    recipeUrl: '',
    mealType: 'DINNER',
  });

  const [ingredients, setIngredients] = React.useState<Ingredient[]>([
    { id: '1', name: '', quantity: 1, unit: '' },
  ]);

  const [dietaryTags, setDietaryTags] = React.useState<string[]>([]);
  const [dietaryInput, setDietaryInput] = React.useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    const newId = Date.now().toString();
    setIngredients((prev) => [
      ...prev,
      { id: newId, name: '', quantity: 1, unit: '' },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const handleIngredientChange = (
    id: string,
    field: keyof Ingredient,
    value: any
  ) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const handleAddDietaryTag = () => {
    if (dietaryInput.trim() && !dietaryTags.includes(dietaryInput)) {
      setDietaryTags((prev) => [...prev, dietaryInput.trim()]);
      setDietaryInput('');
    }
  };

  const handleRemoveDietaryTag = (tag: string) => {
    setDietaryTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      ingredients: ingredients.filter((ing) => ing.name),
      dietaryTags,
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : undefined,
      cookTime: formData.cookTime ? parseInt(formData.cookTime) : undefined,
      servings: formData.servings ? parseInt(formData.servings) : undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-900">
          Meal Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Spaghetti Carbonara"
          required
          className={cn(
            'px-4 py-2.5 rounded-lg border border-neutral-300',
            'bg-white text-neutral-900 placeholder-neutral-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'min-h-[44px]'
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={cn(
              'px-4 py-2.5 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'min-h-[44px]'
            )}
          >
            {MEAL_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {isParent && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-900">
              Meal Type
            </label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleInputChange}
              className={cn(
                'px-4 py-2.5 rounded-lg border border-neutral-300',
                'bg-white text-neutral-900',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'min-h-[44px]'
              )}
            >
              <option value="DINNER">Dinner</option>
              <option value="BREAKFAST">Breakfast</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">
            Prep Time (min)
          </label>
          <input
            type="number"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleInputChange}
            placeholder="15"
            min="0"
            className={cn(
              'px-4 py-2.5 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900 placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'min-h-[44px]'
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">
            Cook Time (min)
          </label>
          <input
            type="number"
            name="cookTime"
            value={formData.cookTime}
            onChange={handleInputChange}
            placeholder="30"
            min="0"
            className={cn(
              'px-4 py-2.5 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900 placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'min-h-[44px]'
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">
            Servings
          </label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleInputChange}
            placeholder="4"
            min="1"
            className={cn(
              'px-4 py-2.5 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900 placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'min-h-[44px]'
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">
            Recipe URL
          </label>
          <input
            type="url"
            name="recipeUrl"
            value={formData.recipeUrl}
            onChange={handleInputChange}
            placeholder="https://..."
            className={cn(
              'px-4 py-2.5 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900 placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'min-h-[44px]'
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-900">
            Ingredients
          </label>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex gap-2 items-end"
            >
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(
                    ingredient.id,
                    'name',
                    e.target.value
                  )
                }
                placeholder="Ingredient name"
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border border-neutral-300',
                  'bg-white text-neutral-900 placeholder-neutral-500 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'min-h-[40px]'
                )}
              />
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) =>
                  handleIngredientChange(
                    ingredient.id,
                    'quantity',
                    parseFloat(e.target.value) || 0
                  )
                }
                className={cn(
                  'w-16 px-2 py-2 rounded-lg border border-neutral-300',
                  'bg-white text-neutral-900 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'min-h-[40px]'
                )}
                step="0.1"
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) =>
                  handleIngredientChange(ingredient.id, 'unit', e.target.value)
                }
                placeholder="Unit"
                className={cn(
                  'w-20 px-2 py-2 rounded-lg border border-neutral-300',
                  'bg-white text-neutral-900 placeholder-neutral-500 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'min-h-[40px]'
                )}
              />
              <button
                type="button"
                onClick={() => handleRemoveIngredient(ingredient.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-900">
          Dietary Tags
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={dietaryInput}
            onChange={(e) => setDietaryInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddDietaryTag();
              }
            }}
            placeholder="e.g., Gluten-free, Vegan..."
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg border border-neutral-300',
              'bg-white text-neutral-900 placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'min-h-[44px]'
            )}
          />
          <button
            type="button"
            onClick={handleAddDietaryTag}
            className={cn(
              'px-4 py-2.5 rounded-lg font-medium transition-colors',
              'bg-secondary-600 text-white hover:bg-secondary-700',
              'min-h-[44px] min-w-[44px]'
            )}
          >
            <Plus size={20} />
          </button>
        </div>

        {dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {dietaryTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 bg-secondary-100 text-secondary-800 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveDietaryTag(tag)}
                  className="hover:text-secondary-900"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        Add Meal
      </Button>
    </form>
  );
};

AddFoodForm.displayName = 'AddFoodForm';
