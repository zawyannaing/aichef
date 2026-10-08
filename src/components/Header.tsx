import React from 'react';
import { ChefHat, Bookmark, Sparkles, Languages, Utensils, Cpu } from 'lucide-react';

interface HeaderProps {
  language: 'my' | 'en';
  onToggleLanguage: () => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onNewSearch: () => void;
  activeModelLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  bookmarkCount,
  onOpenBookmarks,
  onNewSearch,
  activeModelLabel = 'OpenRouter AI',
}) => {
  const isMy = language === 'my';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onNewSearch}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                {isMy ? 'မီးဖိုချောင် စားဖိုမှူး AI' : 'Kitchen Chef AI'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <Cpu className="w-3 h-3 text-emerald-600" />
                {activeModelLabel}
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              {isMy ? 'မီးဖိုချောင်ရှိ ပစ္စည်းများဖြင့် ဟင်းချက်နည်း အဆင့်ဆင့် ဖန်တီးပေးသူ' : 'Instant step-by-step recipes from your kitchen ingredients'}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Cook / Reset */}
          <button
            onClick={onNewSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 hover:text-amber-700 bg-stone-100 hover:bg-amber-50 rounded-xl transition-colors border border-stone-200"
            title={isMy ? 'အသစ်ရှာဖွေမည်' : 'New Recipe Search'}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span>{isMy ? 'ဟင်းအသစ်ရှာမည်' : 'New Recipe'}</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-700 hover:text-amber-700 bg-stone-100 hover:bg-amber-50 rounded-xl transition-colors border border-stone-200"
            title={isMy ? 'သိမ်းဆည်းထားသော ဟင်းများ' : 'Saved Recipes'}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{isMy ? 'မှတ်ထားသော ဟင်းများ' : 'Saved'}</span>
            {bookmarkCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-600 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors"
            title="Toggle Language"
          >
            <Languages className="w-4 h-4 text-amber-700" />
            <span className="font-semibold">{isMy ? 'EN' : 'မြန်မာ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
