export interface DetectedIngredient {
  nameMy: string;
  nameEn: string;
  category?: string;
  freshnessOrState?: string;
}

export interface RecipeIngredient {
  itemMy: string;
  itemEn: string;
  amount: string;
  isPantryStaple?: boolean;
  note?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  titleMy: string;
  titleEn: string;
  tagline: string;
  category: string;
  difficulty: 'လွယ်ကူ' | 'အလယ်အလတ်' | 'ကျွမ်းကျင်' | string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  estimatedCalories: string;
  pantryMatchScore: number;
  mainIngredientsUsed: string[];
  missingOrOptionalIngredients: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  chefTips?: string;
  nutritionHighlights?: string;
  flavorProfile?: string;
  isBookmarked?: boolean;
}

export interface GenerationResult {
  detectedIngredients?: DetectedIngredient[];
  kitchenSummary?: string;
  recipes: Recipe[];
}

export interface CookingTimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  stepNumber: number;
}
