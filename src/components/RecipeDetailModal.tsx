import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  Flame,
  ChefHat,
  Bookmark,
  Share2,
  CheckSquare,
  Square,
  Play,
  Copy,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  language: 'my' | 'en';
  onClose: () => void;
  onStartCooking: (recipe: Recipe) => void;
  onToggleBookmark: (recipe: Recipe) => void;
  isBookmarked: boolean;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  language,
  onClose,
  onStartCooking,
  onToggleBookmark,
  isBookmarked,
}) => {
  if (!recipe) return null;

  const isMy = language === 'my';
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyRecipe = () => {
    const textLines = [
      `🍳 ${recipe.titleMy} (${recipe.titleEn || ''})`,
      `⏱️ ချက်ပြုတ်ချိန်: ${recipe.cookTimeMinutes} မိနစ် | ပြင်ဆင်ချိန်: ${recipe.prepTimeMinutes} မိနစ်`,
      `👥 လူဦးရေ: ${recipe.servings} ယောက်`,
      '',
      '📌 လိုအပ်သော ပစ္စည်းများ:',
      ...recipe.ingredients.map(
        (ing) => `• ${ing.itemMy} - ${ing.amount}${ing.note ? ` (${ing.note})` : ''}`
      ),
      '',
      '👨‍🍳 အဆင့်ဆင့် ချက်ပြုတ်နည်း:',
      ...recipe.steps.map(
        (st) =>
          `အဆင့် ${st.stepNumber}: ${st.title}\n${st.instruction}${
            st.timerMinutes ? ` [ကြာချိန်: ${st.timerMinutes} မိနစ်]` : ''
          }`
      ),
      '',
      recipe.chefTips ? `💡 စားဖိုမှူး အကြံပြုချက်: ${recipe.chefTips}` : '',
      '\n- မီးဖိုချောင် စားဖိုမှူး AI ဖြင့် ဖန်တီးထားပါသည် -',
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-amber-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
              {recipe.category}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
              {recipe.difficulty}
            </span>
            {recipe.pantryMatchScore && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white">
                {recipe.pantryMatchScore}% {isMy ? 'ကိုက်ညီမှု' : 'Match'}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {recipe.titleMy}
          </h2>
          {recipe.titleEn && (
            <p className="text-sm text-amber-100 font-medium">{recipe.titleEn}</p>
          )}

          {recipe.tagline && (
            <p className="text-xs sm:text-sm text-amber-100/90 mt-2 leading-relaxed">
              {recipe.tagline}
            </p>
          )}

          {/* Quick Metrics */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-200" />
              <span>
                {isMy ? 'စုစုပေါင်း' : 'Total'}: {totalTime} {isMy ? 'မိနစ်' : 'mins'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-200" />
              <span>
                {recipe.servings} {isMy ? 'ယောက်စာ' : 'servings'}
              </span>
            </div>
            {recipe.estimatedCalories && (
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-200" />
                <span>{recipe.estimatedCalories}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {/* Ingredients Section with interactive checklist */}
          <div className="bg-amber-50/70 rounded-2xl p-4 sm:p-5 border border-amber-200/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" />
                <span>{isMy ? 'လိုအပ်သော ပစ္စည်းများ (Checklist)' : 'Ingredients Checklist'}</span>
              </h3>
              <span className="text-xs text-stone-500">
                {isMy ? 'ပြင်ဆင်ပြီးပါက အမှန်ခြစ်နိုင်သည်' : 'Tap to check off as you prep'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = Boolean(checkedIngredients[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-300 text-stone-500 line-through'
                        : 'bg-white border-stone-200 hover:border-amber-400 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold truncate">
                        {isMy ? ing.itemMy : ing.itemEn || ing.itemMy}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 shrink-0 font-medium">
                      {ing.amount}
                    </div>
                  </div>
                );
              })}
            </div>

            {recipe.missingOrOptionalIngredients && recipe.missingOrOptionalIngredients.length > 0 && (
              <div className="mt-3 p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isMy ? 'မဖြစ်မနေ မလိုသော်လည်း ထည့်လျှင်ပိုကောင်းသော ပစ္စည်းများ: ' : 'Optional additions: '}
                  <strong>{recipe.missingOrOptionalIngredients.join('၊ ')}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h3 className="font-bold text-base text-stone-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>{isMy ? 'အဆင့်ဆင့် ချက်ပြုတ်နည်းများ' : 'Step-by-Step Cooking Guide'}</span>
            </h3>

            <div className="space-y-4">
              {recipe.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                        {step.title}
                      </h4>
                    </div>

                    {step.timerMinutes && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {step.timerMinutes} {isMy ? 'မိနစ်' : 'min'}
                      </span>
                    )}
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm pl-8 leading-relaxed">
                    {step.instruction}
                  </p>

                  {step.tip && (
                    <div className="ml-8 text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/70">
                      💡 <strong>{isMy ? 'မှတ်ချက်:' : 'Tip:'}</strong> {step.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chef Secrets & Nutrition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipe.chefTips && (
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
                <h4 className="font-bold text-orange-900 text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-orange-600" />
                  {isMy ? 'စားဖိုမှူး၏ လျှို့ဝှက်ချက် / အကြံပြုချက်' : 'Chef’s Secret Tip'}
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">{recipe.chefTips}</p>
              </div>
            )}

            {recipe.nutritionHighlights && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {isMy ? 'အာဟာရ တန်ဖိုးများ' : 'Nutrition Highlights'}
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {recipe.nutritionHighlights}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Sticky Controls */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRecipe}
              className="p-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy recipe text"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">{isMy ? 'ကူးယူပြီးပါပြီ' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>{isMy ? 'စာသား ကူးယူမည်' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(recipe)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isBookmarked
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-amber-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? (isMy ? 'သိမ်းပြီး' : 'Saved') : (isMy ? 'သိမ်းဆည်းမည်' : 'Save')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartCooking(recipe);
              }}
              className="py-2.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isMy ? 'ချက်ပြုတ်မုဒ် စတင်မည်' : 'Start Cooking Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
