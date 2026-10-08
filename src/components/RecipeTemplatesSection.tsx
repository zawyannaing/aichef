import React, { useState } from 'react';
import {
  BookOpen,
  Flame,
  Clock,
  Users,
  Play,
  ChevronRight,
  Sparkles,
  Bookmark,
  ChefHat,
  Filter,
} from 'lucide-react';
import { Recipe } from '../types';
import { RECIPE_TEMPLATES } from '../data/recipeTemplates';

interface RecipeTemplatesSectionProps {
  language: 'my' | 'en';
  onSelectRecipe: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
  onToggleBookmark: (recipe: Recipe) => void;
  isBookmarked: (recipe: Recipe) => boolean;
  onLoadIntoGenerator: (ingredients: string[], cuisine: string) => void;
}

export const RecipeTemplatesSection: React.FC<RecipeTemplatesSectionProps> = ({
  language,
  onSelectRecipe,
  onStartCooking,
  onToggleBookmark,
  isBookmarked,
  onLoadIntoGenerator,
}) => {
  const isMy = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelMy: 'အားလုံး (၁၀ မျိုး)', labelEn: 'All 10' },
    { id: 'မာလာ', labelMy: '🔥 မာလာရှမ်းကော', labelEn: '🔥 Mala' },
    { id: 'ဆီပြန်ဟင်း', labelMy: 'ဆီပြန်ဟင်းများ', labelEn: 'Curries' },
    { id: 'ဟင်းချို', labelMy: 'ဟင်းချို / ဟင်းခါး', labelEn: 'Soups' },
    { id: 'အကြော်', labelMy: 'အကြော်အလှော်', labelEn: 'Stir-fries' },
    { id: 'အသုပ်', labelMy: 'အသုပ်', labelEn: 'Salads' },
    { id: 'ခေါက်ဆွဲ', labelMy: 'ခေါက်ဆွဲ', labelEn: 'Noodles' },
  ];

  const filteredTemplates = RECIPE_TEMPLATES.filter((recipe) => {
    if (selectedCategory === 'all') return true;
    return recipe.category.includes(selectedCategory);
  });

  const malaRecipe = RECIPE_TEMPLATES.find((r) => r.id === 'template-mala-xiang-guo');

  return (
    <section className="mb-8 sm:mb-12 space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-amber-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{isMy ? 'အသင့်သုံး ဟင်းချက်နည်း နမူနာများ (၁၀ မျိုး)' : '10 Curated Recipe Templates'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {isMy ? 'လူကြိုက်များသော ဟင်းချက်နည်း Templates များ' : 'Popular Recipe Templates'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
            {isMy
              ? 'မာလာရှမ်းကော အပါအဝင် အဆင့်ဆင့် ချက်နည်း၊ ချိန်စက်နှင့် ပါဝင်ပစ္စည်းများ အသင့်ပါဝင်သော ရိုးရာဟင်းများ'
              : 'Complete ready-to-cook recipes with ingredients checklist, timers, and chef notes'}
          </p>
        </div>

        {/* Filter Pills with Horizontal Scroll on mobile and Wrap on tablet */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none md:flex-wrap shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-700 border border-stone-200'
              }`}
            >
              {isMy ? cat.labelMy : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Special Mala Xiang Guo Featured Hero Card (when All or Mala selected) */}
      {(selectedCategory === 'all' || selectedCategory === 'မာလာ') && malaRecipe && (
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-8 text-white shadow-xl shadow-orange-600/20 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-10 sm:opacity-15 pointer-events-none">
            <Flame className="w-48 h-48 sm:w-64 sm:h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white text-red-600 uppercase tracking-wider shadow-xs">
                🔥 {isMy ? 'အထူးအကြံပြု ဟင်းပွဲ' : 'Featured Recipe'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/25">
                {malaRecipe.difficulty}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/25">
                ⏱️ {malaRecipe.prepTimeMinutes + malaRecipe.cookTimeMinutes} {isMy ? 'မိနစ်' : 'min'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
              {malaRecipe.titleMy}
            </h3>
            <p className="text-xs sm:text-sm text-red-100 font-medium mt-0.5">
              {malaRecipe.titleEn}
            </p>

            <p className="text-xs sm:text-sm text-white/95 mt-2 leading-relaxed">
              {malaRecipe.tagline}
            </p>

            {/* Quick Ingredients preview */}
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">
              {malaRecipe.ingredients.slice(0, 5).map((ing, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 sm:py-1 rounded-lg bg-black/20 text-white font-medium"
                >
                  {isMy ? ing.itemMy : ing.itemEn}
                </span>
              ))}
              <span className="text-xs px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/20 text-white font-medium">
                +{malaRecipe.ingredients.length - 5} {isMy ? 'မျိုး' : 'more'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onStartCooking(malaRecipe)}
                className="w-full sm:w-auto py-2.5 sm:py-3 px-5 rounded-2xl bg-white hover:bg-stone-100 active:bg-stone-200 text-red-700 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>{isMy ? 'မာလာရှမ်းကော ချက်မည်' : 'Cook Mala Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRecipe(malaRecipe)}
                className="w-full sm:w-auto py-2.5 sm:py-3 px-4 rounded-2xl bg-black/25 hover:bg-black/35 active:bg-black/45 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/20 min-h-[44px]"
              >
                <span>{isMy ? 'အဆင့်ဆင့်ကြည့်ရန်' : 'View Steps'}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onLoadIntoGenerator(
                    malaRecipe.ingredients.map((ing) => ing.itemMy),
                    'မာလာ / အကြော်'
                  )
                }
                className="w-full sm:w-auto py-2.5 sm:py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                title={isMy ? 'AI ဖြင့် စိတ်ကြိုက် ပြန်ပြင်ရန်' : 'Customize with AI'}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{isMy ? 'AI ဖြင့် ပြန်လည်မွမ်းမံမည်' : 'Customize with AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => {
          const isMala = template.id === 'template-mala-xiang-guo';
          const totalTime = template.prepTimeMinutes + template.cookTimeMinutes;
          const bookmarked = isBookmarked(template);

          return (
            <div
              key={template.id}
              className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-md hover:shadow-xl ${
                isMala ? 'border-red-300 ring-2 ring-red-400/30' : 'border-amber-200/90'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="p-4 sm:p-5 pb-3 bg-gradient-to-b from-amber-50/70 to-white border-b border-amber-100">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isMala ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {template.category}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                        {template.difficulty}
                      </span>
                      {isMala && (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                          🔥 Hot
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(template)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        bookmarked
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-100 text-stone-500 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h3 className="mt-2.5 sm:mt-3 text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug">
                    {template.titleMy}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    {template.titleEn}
                  </p>

                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                    {template.tagline}
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="px-4 sm:px-5 py-2.5 grid grid-cols-3 gap-1.5 sm:gap-2 border-b border-stone-100 bg-stone-50/50 text-center">
                  <div className="p-1 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-stone-500 block">{isMy ? 'ကြာချိန်' : 'Time'}</span>
                    <span className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{totalTime} {isMy ? 'မိနစ်' : 'min'}</span>
                    </span>
                  </div>

                  <div className="p-1 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-stone-500 block">{isMy ? 'လူဦးရေ' : 'Servings'}</span>
                    <span className="text-xs font-bold text-stone-800 block mt-0.5 truncate">
                      {template.servings} {isMy ? 'ယောက်' : 'pax'}
                    </span>
                  </div>

                  <div className="p-1 rounded-xl bg-white border border-stone-200/80">
                    <span className="text-[10px] text-stone-500 block">{isMy ? 'အဆင့်' : 'Steps'}</span>
                    <span className="text-xs font-bold text-stone-800 block mt-0.5 truncate">
                      {template.steps.length} {isMy ? 'ဆင့်' : 'steps'}
                    </span>
                  </div>
                </div>

                {/* Ingredients snippet */}
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {template.ingredients.slice(0, 4).map((ing, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {isMy ? ing.itemMy : ing.itemEn}
                      </span>
                    ))}
                    {template.ingredients.length > 4 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 font-semibold">
                        +{template.ingredients.length - 4}
                      </span>
                    )}
                  </div>

                  {template.chefTips && (
                    <p className="text-[11px] text-stone-600 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100 line-clamp-2">
                      💡 {template.chefTips}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 sm:p-5 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectRecipe(template)}
                  className="flex-1 py-2 px-3 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-xl transition-colors text-center border border-stone-200 flex items-center justify-center gap-1 cursor-pointer min-h-[42px]"
                >
                  <span>{isMy ? 'ကြည့်မည်' : 'Details'}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onStartCooking(template)}
                  className={`flex-1 py-2 px-3 text-xs font-bold text-white rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer min-h-[42px] ${
                    isMala
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>{isMy ? 'ချက်မည်' : 'Cook'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
