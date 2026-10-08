import React from 'react';
import { ChefHat, Bookmark, Languages, Utensils, Cpu, Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={onNewSearch}
          className="flex items-center gap-2 sm:gap-3 text-left group transition-transform active:scale-95 min-w-0 flex-shrink"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-lg text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                {isMy ? 'မီးဖိုချောင် AI' : 'Kitchen Chef AI'}
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 truncate max-w-[170px]">
                <Cpu className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{activeModelLabel}</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden md:block truncate">
              {isMy ? 'မီးဖိုချောင်ရှိ ပစ္စည်းများဖြင့် ဟင်းချက်နည်း အဆင့်ဆင့် ဖန်တီးပေးသူ' : 'Smart step-by-step cooking recipes from kitchen ingredients'}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* New Cook / Reset */}
          <button
            onClick={onNewSearch}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-amber-700 bg-stone-100 hover:bg-amber-50 active:bg-amber-100 rounded-xl transition-colors border border-stone-200 cursor-pointer min-h-[38px]"
            title={isMy ? 'ဟင်းအသစ် ရှာဖွေမည်' : 'New Recipe'}
          >
            <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">{isMy ? 'ဟင်းအသစ်' : 'New'}</span>
          </button>

          {/* Bookmarks / Saved */}
          <button
            onClick={onOpenBookmarks}
            className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-amber-700 bg-stone-100 hover:bg-amber-50 active:bg-amber-100 rounded-xl transition-colors border border-stone-200 cursor-pointer min-h-[38px]"
            title={isMy ? 'မှတ်ထားသော ဟင်းများ' : 'Saved Recipes'}
          >
            <Bookmark className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">{isMy ? 'မှတ်ထားသောဟင်း' : 'Saved'}</span>
            {bookmarkCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-amber-600 rounded-full shadow-xs">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer min-h-[38px]"
            title="Toggle Language (မြန်မာ / English)"
          >
            <Languages className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{isMy ? 'EN' : 'မြန်မာ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
