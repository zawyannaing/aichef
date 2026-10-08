/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Sparkles,
  Utensils,
  BookOpen,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  Flame,
  Camera,
  Heart,
} from 'lucide-react';
import { Header } from './components/Header';
import { IngredientInputSection } from './components/IngredientInputSection';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookingModeModal } from './components/CookingModeModal';
import { BookmarksView } from './components/BookmarksView';
import { Recipe, GenerationResult } from './types';

export default function App() {
  const [language, setLanguage] = useState<'my' | 'en'>('my');
  const isMy = language === 'my';

  // Recipe generation state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active generated results
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.5-flash');

  // Modals & Active recipe
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [selectedRecipeForCooking, setSelectedRecipeForCooking] = useState<Recipe | null>(null);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);

  // Bookmarks (saved in localStorage)
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('kitchen_chef_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kitchen_chef_bookmarks', JSON.stringify(bookmarkedRecipes));
    } catch (e) {
      console.warn('Failed to save bookmarks:', e);
    }
  }, [bookmarkedRecipes]);

  const toggleBookmark = (recipe: Recipe) => {
    setBookmarkedRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id || r.titleMy === recipe.titleMy);
      if (exists) {
        return prev.filter((r) => r.id !== recipe.id && r.titleMy !== recipe.titleMy);
      } else {
        return [{ ...recipe, isBookmarked: true }, ...prev];
      }
    });
  };

  const isRecipeBookmarked = (recipe: Recipe) => {
    return bookmarkedRecipes.some((r) => r.id === recipe.id || r.titleMy === recipe.titleMy);
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'my' ? 'en' : 'my'));
  };

  const handleResetSearch = () => {
    setGenerationResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate recipe via Express backend calling Gemini 3.8
  const handleGenerate = async (payload: {
    ingredients: string[];
    pantryStaples: string[];
    imageBase64?: string;
    cuisineType: string;
    cookingTimeMax: string;
    servings: number;
    dietary: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage(
      isMy
        ? 'မီးဖိုချောင် ပစ္စည်းများကို စစ်ဆေးသုံးသပ်နေပါသည်...'
        : 'Analyzing kitchen ingredients...'
    );

    // Dynamic rotating status text for better user perception
    const statusInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        if (prev.includes('စစ်ဆေး')) {
          return isMy
            ? 'အရသာအရှိဆုံး မြန်မာဟင်းချက်နည်းများကို ပြင်ဆင်နေပါသည်...'
            : 'Formulating step-by-step recipes...';
        }
        if (prev.includes('ပြင်ဆင်')) {
          return isMy
            ? 'စားဖိုမှူး၏ အထူးအကြံပြုချက်နှင့် ချက်ပြုတ်ချိန်များ တွက်ချက်နေပါသည်...'
            : 'Adding chef secrets and timers...';
        }
        return isMy
          ? 'ဟင်းချက်နည်း အဆင့်ဆင့် ဖန်တီးနေပါသည်...'
          : 'Finalizing recipe details...';
      });
    }, 2800);

    try {
      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          language,
        }),
      });

      clearInterval(statusInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Failed to generate recipes');
      }

      const data = await response.json();

      if (!data.recipes || data.recipes.length === 0) {
        throw new Error(
          isMy
            ? 'ပေးထားသော ပစ္စည်းများဖြင့် ဟင်းချက်နည်း မဖန်တီးနိုင်သေးပါ။ အခြားပစ္စည်းများ ထပ်မံထည့်သွင်းပေးပါ။'
            : 'No recipes could be formulated. Please try adding more ingredients.'
        );
      }

      setGenerationResult(data);

      // Scroll smoothly to results
      setTimeout(() => {
        const resultsEl = document.getElementById('recipes-result-anchor');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      clearInterval(statusInterval);
      console.error('Recipe generation error:', err);
      setErrorMessage(
        err.message ||
          (isMy
            ? 'ဟင်းချက်နည်း ဖန်တီးရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ ပြန်လည်စမ်းသပ်ပေးပါ။'
            : 'Something went wrong while generating recipes. Please try again.')
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const filteredRecipes = generationResult?.recipes.filter((r) => {
    if (activeFilterCategory === 'all') return true;
    return r.category.includes(activeFilterCategory);
  });

  const getModelLabel = (model: string) => {
    if (model.includes('gemini-2.5-flash')) return 'OpenRouter • Gemini 2.5';
    if (model.includes('claude')) return 'OpenRouter • Claude 3.5';
    if (model.includes('gpt-4o')) return 'OpenRouter • GPT-4o';
    if (model.includes('deepseek')) return 'OpenRouter • DeepSeek';
    return 'Google Gemini Native 3.8';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-amber-200 selection:text-amber-900 font-sans">
      {/* Top Navigation */}
      <Header
        language={language}
        onToggleLanguage={handleToggleLanguage}
        bookmarkCount={bookmarkedRecipes.length}
        onOpenBookmarks={() => setShowBookmarksModal(true)}
        onNewSearch={handleResetSearch}
        activeModelLabel={getModelLabel(selectedModel)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Input Form Section */}
        <IngredientInputSection
          language={language}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">
                  {isMy ? 'အသိပေးချက်' : 'Notice'}
                </strong>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-semibold underline shrink-0"
            >
              {isMy ? 'ပိတ်မည်' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Generated Recipes Section */}
        {generationResult && generationResult.recipes && (
          <section id="recipes-result-anchor" className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Kitchen Summary & AI Chef Greeting */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                  <ChefHat className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      {isMy ? 'စားဖိုမှူး၏ အကြံပြုချက်' : 'AI Chef Advice'}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      {generationResult.recipes.length} {isMy ? 'ဟင်းချက်နည်း တွေ့ရှိသည်' : 'Recipes Available'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                    {isMy
                      ? 'သင့်မီးဖိုချောင်အတွက် အကောင်းဆုံး ဟင်းလျာများ'
                      : 'Recommended Dishes for Your Kitchen'}
                  </h2>
                  {generationResult.kitchenSummary && (
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                      {generationResult.kitchenSummary}
                    </p>
                  )}
                </div>
              </div>

              {/* Detected Ingredients tag list */}
              {generationResult.detectedIngredients && generationResult.detectedIngredients.length > 0 && (
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 sm:max-w-xs w-full">
                  <span className="text-[11px] font-bold text-amber-900 block mb-1">
                    {isMy ? 'ဓာတ်ပုံ/စာမှ တွေ့ရှိသော ပစ္စည်းများ:' : 'Identified Ingredients:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {generationResult.detectedIngredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white text-stone-700 border border-amber-200 font-medium"
                      >
                        {isMy ? ing.nameMy : ing.nameEn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recipe Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes?.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  language={language}
                  onSelectRecipe={(r) => setSelectedRecipeForDetail(r)}
                  onStartCooking={(r) => setSelectedRecipeForCooking(r)}
                  onToggleBookmark={(r) => toggleBookmark(r)}
                  isBookmarked={isRecipeBookmarked(recipe)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Home Highlights / How it Works when no results yet */}
        {!generationResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-stone-700 mt-2">
            <div className="bg-white p-5 rounded-3xl border border-amber-200/60 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-1">
                  {isMy ? '၁။ ဓာတ်ပုံရိုက်ပို့ပါ' : '1. Snap a Photo'}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {isMy
                    ? 'ရေခဲသေတ္တာ သို့မဟုတ် မီးဖိုချောင်ရှိ ဟင်းချက်စရာ ပစ္စည်းများကို ကင်မရာဖြင့် ဓာတ်ပုံရိုက်၍ တင်ပေးပါ။'
                    : 'Take a quick picture of your fridge, kitchen shelf, or market ingredients.'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200/60 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-1">
                  {isMy ? '၂။ အဆင့်ဆင့် ချက်နည်းရယူပါ' : '2. Get Instant Recipes'}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {isMy
                    ? 'ရှိသော ပစ္စည်းများဖြင့် အံဝင်ဂွင်ကျဖြစ်မည့် မြန်မာဟင်း၊ ဆီပြန်ဟင်း၊ ဟင်းချိုများကို AI က ဖော်ထုတ်ပေးမည်။'
                    : 'Gemini AI formulates step-by-step Myanmar traditional and quick home recipes.'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200/60 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-1">
                  {isMy ? '၃။ ချက်ပြုတ်မုဒ်ဖြင့် ချက်ပါ' : '3. Interactive Cooking Mode'}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {isMy
                    ? 'စာလုံးကြီးကြီး၊ အချိန်မှတ်နာရီ (Timer) နှင့် အသံဖတ်ရှုမှုဖြင့် မီးဖိုချောင်ထဲတွင် လက်တွေ့ချက်ပြုတ်နိုင်သည်။'
                    : 'Hands-free kitchen assistant mode with large text, timers, and audio alerts.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-amber-200/70 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-stone-700">
            <ChefHat className="w-4 h-4 text-amber-600" />
            <span>{isMy ? 'မီးဖိုချောင် စားဖိုမှူး AI (Kitchen Chef Myanmar)' : 'Kitchen Chef Myanmar AI'}</span>
          </div>
          <p>
            {isMy
              ? 'မီးဖိုချောင်ထဲရှိ ပစ္စည်းများဖြင့် ချက်ပြုတ်နည်း အဆင့်ဆင့် ဖန်တီးပေးသော AI အက်ပ်'
              : 'AI culinary assistant turning pantry ingredients into delicious home-cooked meals.'}
          </p>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Recipe Detail Modal */}
      {selectedRecipeForDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeForDetail}
          language={language}
          onClose={() => setSelectedRecipeForDetail(null)}
          onStartCooking={(r) => {
            setSelectedRecipeForDetail(null);
            setSelectedRecipeForCooking(r);
          }}
          onToggleBookmark={(r) => toggleBookmark(r)}
          isBookmarked={isRecipeBookmarked(selectedRecipeForDetail)}
        />
      )}

      {/* 2. Interactive Hands-free Cooking Mode Modal */}
      {selectedRecipeForCooking && (
        <CookingModeModal
          recipe={selectedRecipeForCooking}
          language={language}
          onClose={() => setSelectedRecipeForCooking(null)}
        />
      )}

      {/* 3. Bookmarks / Saved Recipes Modal */}
      {showBookmarksModal && (
        <BookmarksView
          language={language}
          bookmarkedRecipes={bookmarkedRecipes}
          onClose={() => setShowBookmarksModal(false)}
          onSelectRecipe={(r) => {
            setShowBookmarksModal(false);
            setSelectedRecipeForDetail(r);
          }}
          onStartCooking={(r) => {
            setShowBookmarksModal(false);
            setSelectedRecipeForCooking(r);
          }}
          onRemoveBookmark={(id) => {
            setBookmarkedRecipes((prev) => prev.filter((r) => r.id !== id));
          }}
        />
      )}
    </div>
  );
}
