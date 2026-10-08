import React from 'react';
import { X, Bookmark, Trash2, Play, ChefHat, Clock } from 'lucide-react';
import { Recipe } from '../types';

interface BookmarksViewProps {
  language: 'my' | 'en';
  bookmarkedRecipes: Recipe[];
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
  onRemoveBookmark: (recipeId: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  language,
  bookmarkedRecipes,
  onClose,
  onSelectRecipe,
  onStartCooking,
  onRemoveBookmark,
}) => {
  const isMy = language === 'my';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-amber-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {isMy ? 'သိမ်းဆည်းထားသော ဟင်းချက်နည်းများ' : 'Saved Recipes'}
              </h2>
              <p className="text-xs text-stone-500">
                {bookmarkedRecipes.length} {isMy ? 'ခု သိမ်းဆည်းထားသည်' : 'recipes bookmarked'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {bookmarkedRecipes.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-stone-700">
                {isMy ? 'သိမ်းဆည်းထားသော ဟင်းချက်နည်း မရှိသေးပါ' : 'No saved recipes yet'}
              </p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                {isMy
                  ? 'ဟင်းချက်နည်းကတ်ပေါ်ရှိ အမှတ်အသား (Bookmark) ခလုတ်ကို နှိပ်၍ အချိန်မရွေး ပြန်ကြည့်နိုင်ရန် သိမ်းထားနိုင်ပါသည်။'
                  : 'Bookmark favorite recipes to quickly view or cook them anytime.'}
              </p>
            </div>
          ) : (
            bookmarkedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onSelectRecipe(recipe);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {recipe.category}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.cookTimeMinutes} {isMy ? 'မိနစ်' : 'min'}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 group-hover:text-amber-800 transition-colors text-base">
                    {recipe.titleMy}
                  </h4>
                  {recipe.titleEn && (
                    <p className="text-xs text-stone-500">{recipe.titleEn}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartCooking(recipe);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isMy ? 'ချက်မည်' : 'Cook'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(recipe.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
