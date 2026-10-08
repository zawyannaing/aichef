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
  AlertCircle,
  Clock,
  Camera,
  Bookmark,
  Languages,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Header } from './components/Header';
import { IngredientInputSection } from './components/IngredientInputSection';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookingModeModal } from './components/CookingModeModal';
import { BookmarksView } from './components/BookmarksView';
import { RecipeTemplatesSection } from './components/RecipeTemplatesSection';
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

  // Navigation tab: 'generator' | 'templates'
  const [activeTab, setActiveTab] = useState<'generator' | 'templates'>('generator');

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

  const handleLoadTemplateIntoGenerator = (ingredients: string[], cuisine: string) => {
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleGenerate({
      ingredients,
      pantryStaples: ['ဆီ', 'ဆား', 'ဟင်းခတ်မှုန့်', 'ကြက်သွန်နီ', 'ကြက်သွန်ဖြူ', 'ငံပြာရည်'],
      cuisineType: cuisine || 'အားလုံး',
      cookingTimeMax: 'မည်သည့်အချိန်မဆို',
      servings: 2,
      dietary: '',
      model: selectedModel,
    });
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'my' ? 'en' : 'my'));
  };

  const handleResetSearch = () => {
    setGenerationResult(null);
    setErrorMessage(null);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate recipe via Express backend calling Gemini / OpenRouter
  const handleGenerate = async (payload: {
    ingredients: string[];
    pantryStaples: string[];
    imageBase64?: string;
    cuisineType: string;
    cookingTimeMax: string;
    servings: number;
    dietary: string;
    model?: string;
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-12">
        {/* Navigation Tabs between AI Generator and 10 Curated Templates */}
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="bg-white p-1 rounded-2xl border border-amber-200/90 shadow-xs flex items-center gap-1 max-w-md w-full">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                activeTab === 'generator'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {isMy ? 'AI စားဖိုမှူး' : 'AI Chef'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-600/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{isMy ? 'Templates (၁၀)' : 'Templates (10)'}</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-black border border-red-200 shrink-0">
                Mala 🔥
              </span>
            </button>
          </div>
        </div>

        {/* 1. Templates Tab View */}
        {activeTab === 'templates' && (
          <div className="animate-in fade-in duration-200">
            <RecipeTemplatesSection
              language={language}
              onSelectRecipe={(r) => setSelectedRecipeForDetail(r)}
              onStartCooking={(r) => setSelectedRecipeForCooking(r)}
              onToggleBookmark={(r) => toggleBookmark(r)}
              isBookmarked={(r) => isRecipeBookmarked(r)}
              onLoadIntoGenerator={handleLoadTemplateIntoGenerator}
            />
          </div>
        )}

        {/* 2. AI Generator Tab View */}
        {activeTab === 'generator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
              <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">
                      {isMy ? 'အသိပေးချက်' : 'Notice'}
                    </strong>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-900 text-xs font-bold underline shrink-0 cursor-pointer min-h-[36px] flex items-center"
                >
                  {isMy ? 'ပိတ်မည်' : 'Dismiss'}
                </button>
              </div>
            )}

            {/* Generated Recipes Section */}
            {generationResult && generationResult.recipes && (
              <section id="recipes-result-anchor" className="space-y-5 sm:space-y-6 pt-2 animate-in fade-in duration-300">
                {/* Kitchen Summary & AI Chef Greeting */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-200/90 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                      <ChefHat className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">
                          {isMy ? 'စားဖိုမှူး၏ အကြံပြုချက်' : 'AI Chef Advice'}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {generationResult.recipes.length} {isMy ? 'မျိုး' : 'dishes'}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-stone-900 leading-snug">
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
                    <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 sm:max-w-xs w-full shrink-0">
                      <span className="text-[11px] font-bold text-amber-900 block mb-1">
                        {isMy ? 'တွေ့ရှိသော ပစ္စည်းများ:' : 'Identified Ingredients:'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

            {/* Home Highlights when no results yet */}
            {!generationResult && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 text-stone-700">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-200/60 shadow-xs flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 mb-1">
                        {isMy ? '၁။ ဓာတ်ပုံရိုက်ပို့ပါ' : '1. Snap a Photo'}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {isMy
                          ? 'ရေခဲသေတ္တာ သို့မဟုတ် မီးဖိုချောင်ရှိ ဟင်းချက်စရာ ပစ္စည်းများကို ဓာတ်ပုံရိုက်တင်ပေးပါ။'
                          : 'Take a picture of fridge or kitchen shelf ingredients.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-200/60 shadow-xs flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 mb-1">
                        {isMy ? '၂။ ချက်နည်းရယူပါ' : '2. Instant Recipes'}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {isMy
                          ? 'ရှိသောပစ္စည်းများဖြင့် အံဝင်ဂွင်ကျဖြစ်မည့် မြန်မာဟင်း၊ ဆီပြန်ဟင်းများကို AI က ဖော်ထုတ်ပေးမည်။'
                          : 'AI formulates step-by-step Myanmar traditional and quick dishes.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-200/60 shadow-xs flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 mb-1">
                        {isMy ? '၃။ အချိန်မှတ်ချက်ပါ' : '3. Kitchen Timers'}
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {isMy
                          ? 'စာလုံးကြီးကြီး၊ အချိန်မှတ်နာရီ (Timer) နှင့် အသံဖတ်ရှုမှုဖြင့် လက်တွေ့ချက်ပြုတ်နိုင်သည်။'
                          : 'Hands-free cooking assistant with step timers and voice audio.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner Callout to 10 Curated Templates */}
                <div
                  onClick={() => {
                    setActiveTab('templates');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-orange-600/20 cursor-pointer hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded-full">
                          🔥 {isMy ? 'အသင့်သုံး Templates' : 'Curated Templates'}
                        </span>
                        <span className="text-xs font-semibold text-white/90">
                          {isMy ? 'မာလာရှမ်းကော အပါအဝင် ၁၀ မျိုး' : '10 Recipes incl. Mala'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-black">
                        {isMy
                          ? 'မာလာရှမ်းကောနှင့် နာမည်ကြီး မြန်မာဟင်းချက်နည်း ၁၀ မျိုး ကြည့်ရန် နှိပ်ပါ'
                          : 'Explore 10 Ready-to-Cook Myanmar Recipes (Mala Xiang Guo)'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white text-stone-900 px-4 py-2 rounded-xl shrink-0 group-hover:bg-amber-50 transition-colors">
                    <span>{isMy ? 'ချက်နည်း ၁၀ မျိုး ကြည့်မည်' : 'View Templates'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 border-t border-amber-200/70 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 font-bold text-stone-700">
            <ChefHat className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{isMy ? 'မီးဖိုချောင် စားဖိုမှူး AI (Kitchen Chef Myanmar)' : 'Kitchen Chef Myanmar AI'}</span>
          </div>
          <p className="text-stone-400">
            {isMy
              ? 'မီးဖိုချောင်ထဲရှိ ပစ္စည်းများဖြင့် ချက်ပြုတ်နည်း အဆင့်ဆင့် ဖန်တီးပေးသော AI အက်ပ်'
              : 'AI culinary assistant turning pantry ingredients into delicious home-cooked meals.'}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices < 640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg pb-safe">
        <button
          type="button"
          onClick={() => {
            setActiveTab('generator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-bold transition-colors min-h-[44px] min-w-[64px] cursor-pointer ${
            activeTab === 'generator' ? 'text-amber-700 bg-amber-50' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="mt-0.5">{isMy ? 'AI စားဖိုမှူး' : 'AI Chef'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('templates');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-bold transition-colors min-h-[44px] min-w-[64px] cursor-pointer relative ${
            activeTab === 'templates' ? 'text-red-700 bg-red-50' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-600 rounded-full" />
          </div>
          <span className="mt-0.5">{isMy ? 'ချက်နည်း ၁၀' : 'Templates'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowBookmarksModal(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-bold text-stone-500 hover:text-stone-800 transition-colors min-h-[44px] min-w-[64px] cursor-pointer relative"
        >
          <div className="relative">
            <Bookmark className="w-4 h-4 shrink-0" />
            {bookmarkedRecipes.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {bookmarkedRecipes.length}
              </span>
            )}
          </div>
          <span className="mt-0.5">{isMy ? 'မှတ်ထားသော' : 'Saved'}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleLanguage}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-bold text-stone-500 hover:text-amber-800 transition-colors min-h-[44px] min-w-[64px] cursor-pointer"
        >
          <Languages className="w-4 h-4 shrink-0" />
          <span className="mt-0.5">{isMy ? 'EN' : 'မြန်မာ'}</span>
        </button>
      </div>

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
