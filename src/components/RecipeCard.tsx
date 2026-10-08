import React from 'react';
import {
  Clock,
  Flame,
  Bookmark,
  ChefHat,
  ChevronRight,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  language: 'my' | 'en';
  onSelectRecipe: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
  onToggleBookmark: (recipe: Recipe) => void;
  isBookmarked: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  language,
  onSelectRecipe,
  onStartCooking,
  onToggleBookmark,
  isBookmarked,
}) => {
  const isMy = language === 'my';

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  // Difficulty badge color
  const getDifficultyColor = (diff: string) => {
    if (diff.includes('လွယ်ကူ') || diff.toLowerCase().includes('easy')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (diff.includes('အလယ်') || diff.toLowerCase().includes('medium')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Header Card Bar */}
        <div className="p-5 pb-3 bg-gradient-to-b from-amber-50/70 to-white border-b border-amber-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-600 text-white shadow-xs">
                {recipe.category || (isMy ? 'မြန်မာဟင်း' : 'Myanmar Dish')}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                  recipe.difficulty || ''
                )}`}
              >
                {recipe.difficulty}
              </span>
              {recipe.pantryMatchScore && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {recipe.pantryMatchScore}% {isMy ? 'ကိုက်ညီ' : 'Match'}
                </span>
              )}
            </div>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(recipe);
              }}
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-500 hover:text-amber-600 hover:bg-amber-50'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark recipe'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Titles */}
          <h3 className="mt-3 text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug">
            {recipe.titleMy}
          </h3>
          {recipe.titleEn && (
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {recipe.titleEn}
            </p>
          )}

          {recipe.tagline && (
            <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
              {recipe.tagline}
            </p>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="px-5 py-3 grid grid-cols-3 gap-2 border-b border-stone-100 bg-stone-50/50 text-center">
          <div className="p-1.5 rounded-xl bg-white border border-stone-200/80">
            <span className="text-[10px] text-stone-500 block">{isMy ? 'ကြာချိန်' : 'Total Time'}</span>
            <span className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-600" />
              {totalTime > 0 ? `${totalTime} ${isMy ? 'မိနစ်' : 'min'}` : `${recipe.cookTimeMinutes} min`}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-white border border-stone-200/80">
            <span className="text-[10px] text-stone-500 block">{isMy ? 'လူဦးရေ' : 'Servings'}</span>
            <span className="text-xs font-bold text-stone-800 block mt-0.5">
              {recipe.servings} {isMy ? 'ယောက်စာ' : 'servings'}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-white border border-stone-200/80">
            <span className="text-[10px] text-stone-500 block">{isMy ? 'အဆင့်' : 'Steps'}</span>
            <span className="text-xs font-bold text-stone-800 block mt-0.5">
              {recipe.steps?.length || 0} {isMy ? 'ဆင့်' : 'steps'}
            </span>
          </div>
        </div>

        {/* Ingredients Summary */}
        <div className="p-5 space-y-3">
          <div>
            <span className="text-xs font-bold text-stone-700 block mb-1.5">
              {isMy ? 'ပါဝင်သော အဓိကပစ္စည်းများ:' : 'Main Ingredients:'}
            </span>
            <div className="flex flex-wrap gap-1">
              {recipe.ingredients?.slice(0, 5).map((ing, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200"
                >
                  {isMy ? ing.itemMy : ing.itemEn || ing.itemMy}
                </span>
              ))}
              {recipe.ingredients && recipe.ingredients.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 font-semibold">
                  +{recipe.ingredients.length - 5} {isMy ? 'မျိုး' : 'more'}
                </span>
              )}
            </div>
          </div>

          {/* Missing items note if any */}
          {recipe.missingOrOptionalIngredients && recipe.missingOrOptionalIngredients.length > 0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-xl border border-amber-200/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {isMy ? 'ထပ်ဆောင်းထည့်နိုင်သော ပစ္စည်း:' : 'Optional staple:'}{' '}
                {recipe.missingOrOptionalIngredients.join('၊ ')}
              </span>
            </div>
          )}

          {/* Chef Tip sneak peek */}
          {recipe.chefTips && (
            <div className="text-[11px] text-stone-600 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200 line-clamp-2">
              💡 {recipe.chefTips}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 flex gap-2">
        <button
          type="button"
          onClick={() => onSelectRecipe(recipe)}
          className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-center border border-stone-200 flex items-center justify-center gap-1"
        >
          <span>{isMy ? 'အသေးစိတ်ကြည့်ရန်' : 'View Recipe'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onStartCooking(recipe)}
          className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/20 text-center flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isMy ? 'ချက်ပြုတ်စတင်မည်' : 'Cook Now'}</span>
        </button>
      </div>
    </div>
  );
};
