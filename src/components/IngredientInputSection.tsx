import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Plus,
  X,
  Sparkles,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  HelpCircle,
  Clock,
  Users,
  Cpu,
} from 'lucide-react';
import { SAMPLE_PRESETS, POPULAR_INGREDIENTS, DEFAULT_PANTRY_STAPLES, SamplePreset } from '../data/samplePresets';
import { DetectedIngredient } from '../types';

interface IngredientInputSectionProps {
  language: 'my' | 'en';
  onGenerate: (payload: {
    ingredients: string[];
    pantryStaples: string[];
    imageBase64?: string;
    cuisineType: string;
    cookingTimeMax: string;
    servings: number;
    dietary: string;
    model?: string;
  }) => void;
  isLoading: boolean;
  loadingMessage: string;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const IngredientInputSection: React.FC<IngredientInputSectionProps> = ({
  language,
  onGenerate,
  isLoading,
  loadingMessage,
  selectedModel,
  onSelectModel,
}) => {
  const isMy = language === 'my';

  // State
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [detectedPhotoItems, setDetectedPhotoItems] = useState<DetectedIngredient[]>([]);

  // Filters & options
  const [cuisineType, setCuisineType] = useState('အားလုံး');
  const [cookingTimeMax, setCookingTimeMax] = useState('မည်သည့်အချိန်မဆို');
  const [servings, setServings] = useState(2);
  const [dietary, setDietary] = useState('');

  // Pantry staples
  const [pantryStaples, setPantryStaples] = useState<string[]>(
    DEFAULT_PANTRY_STAPLES.filter((p) => p.checked).map((p) => p.nameMy)
  );
  const [showPantryAccordion, setShowPantryAccordion] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Add text ingredient
  const handleAddIngredient = (itemToAdd?: string) => {
    const text = (itemToAdd || inputValue).trim();
    if (!text) return;

    // Check duplicates
    if (!ingredients.includes(text)) {
      setIngredients((prev) => [...prev, text]);
    }
    if (!itemToAdd) {
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Photo selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError(isMy ? 'ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင်ကိုသာ ရွေးချယ်ပေးပါ' : 'Please select an image file');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setPhotoError(isMy ? 'ဓာတ်ပုံအရွယ်အစား ၁၅MB ထက်မကျော်ရပါ' : 'Image size must be under 15MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      analyzePhoto(base64);
    };
    reader.onerror = () => {
      setPhotoError(isMy ? 'ဓာတ်ပုံဖတ်ရှုရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်' : 'Failed to read image');
    };
    reader.readAsDataURL(file);
  };

  // Quick Analyze photo to extract ingredients
  const analyzePhoto = async (base64Img: string) => {
    try {
      setIsAnalyzingPhoto(true);
      setPhotoError(null);

      const res = await fetch('/api/recipe/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Img, model: selectedModel }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze photo');
      }

      const data = await res.json();
      if (data.detectedIngredients && Array.isArray(data.detectedIngredients)) {
        setDetectedPhotoItems(data.detectedIngredients);
        const newItems = data.detectedIngredients
          .map((item: any) => item.nameMy || item.nameEn)
          .filter(Boolean);

        setIngredients((prev) => {
          const merged = new Set([...prev, ...newItems]);
          return Array.from(merged);
        });
      }
    } catch (err: any) {
      console.warn('Auto analyze photo error:', err);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setDetectedPhotoItems([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Toggle pantry staple
  const handleTogglePantryStaple = (item: string) => {
    setPantryStaples((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  // Load sample preset
  const handleApplyPreset = (preset: SamplePreset) => {
    setIngredients(preset.ingredients);
    setCuisineType(preset.cuisine);
  };

  // Trigger recipe generation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0 && !selectedImage) {
      return;
    }

    onGenerate({
      ingredients,
      pantryStaples,
      imageBase64: selectedImage || undefined,
      cuisineType,
      cookingTimeMax,
      servings,
      dietary,
      model: selectedModel,
    });
  };

  const cuisineOptions = [
    { id: 'အားလုံး', labelMy: 'အားလုံး (All)', labelEn: 'All Cuisines' },
    { id: 'မြန်မာရိုးရာ', labelMy: 'မြန်မာရိုးရာ', labelEn: 'Traditional Myanmar' },
    { id: 'ဆီပြန်ဟင်း', labelMy: 'ဆီပြန်ဟင်း (Curry)', labelEn: 'Rich Curry' },
    { id: 'ဟင်းချို', labelMy: 'ဟင်းချို/ဟင်းခါး', labelEn: 'Soup / Broth' },
    { id: 'အကြော်', labelMy: 'အကြော်အလှော်', labelEn: 'Stir-fry' },
    { id: 'အသုပ်', labelMy: 'အသုပ် (Salad)', labelEn: 'Salad' },
    { id: 'အမြန်ဟင်း', labelMy: 'အမြန်ဟင်း (< ၂၀ မိနစ်)', labelEn: 'Quick (<20 min)' },
    { id: 'သက်သတ်လွတ်', labelMy: 'သက်သတ်လွတ်', labelEn: 'Vegetarian' },
  ];

  const timeOptions = [
    { id: 'မည်သည့်အချိန်မဆို', labelMy: 'မည်သည့်အချိန်မဆို', labelEn: 'Any Time' },
    { id: '၁၅ မိနစ်အောက်', labelMy: '၁၅ မိနစ်အောက် (အမြန်)', labelEn: 'Under 15 mins' },
    { id: '၃၀ မိနစ်အောက်', labelMy: '၃၀ မိနစ်အောက်', labelEn: 'Under 30 mins' },
    { id: '၄၅ မိနစ်အောက်', labelMy: '၄၅ မိနစ်အောက်', labelEn: 'Under 45 mins' },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg border border-amber-200/80 overflow-hidden mb-6 sm:mb-8 transition-all">
      {/* Banner / Intro */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-7 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-15 text-white pointer-events-none">
          <Flame className="w-48 h-48 sm:w-60 sm:h-60" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-semibold mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{isMy ? 'မီးဖိုချောင် AI စားဖိုမှူး' : 'Kitchen AI Recipe Formulator'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 leading-snug">
            {isMy
              ? 'မီးဖိုချောင်ထဲရှိ ပစ္စည်းများကို စာရိုက်ပါ (သို့) ဓာတ်ပုံပို့ပါ'
              : 'What do you have? Type ingredients or snap a photo!'}
          </h1>
          <p className="text-amber-100/95 text-xs sm:text-sm lg:text-base leading-relaxed">
            {isMy
              ? 'သင့်အိမ် မီးဖိုချောင်ရှိ ဟင်းချက်စရာ ပစ္စည်းများကို ပို့လိုက်ရုံဖြင့် အဆင့်ဆင့် ချက်ပြုတ်နည်းများကို AI စားဖိုမှူးက အသင့်ဖန်တီးပေးပါမည်။'
              : 'Enter your kitchen ingredients or upload a photo to get delicious step-by-step Myanmar home recipes.'}
          </p>

          {/* Quick Preset Buttons (Horizontal scroll on mobile, wrap on tablet/desktop) */}
          <div className="mt-3 sm:mt-4">
            <div className="text-xs font-medium text-amber-200 mb-1.5 flex items-center gap-1">
              <span>{isMy ? 'စမ်းသပ်ရန် ဥပမာ ပစ္စည်းအတွဲများ:' : 'Quick Ingredient Combos:'}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-2.5 py-1 rounded-full border border-white/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{preset.imageEmoji}</span>
                  <span className="whitespace-nowrap">{isMy ? preset.titleMy : preset.titleEn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        {/* Dual Input Area: Photo & Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Photo / Camera Section (5 cols) */}
          <div className="lg:col-span-5 bg-amber-50/50 rounded-2xl p-3.5 sm:p-4 border border-amber-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{isMy ? '၁။ ဓာတ်ပုံရိုက်ပို့ရန် (Photo)' : '1. Photo of Ingredients'}</span>
              </span>
              <span className="text-[11px] text-stone-500">
                {isMy ? 'ရေခဲသေတ္တာ/ပစ္စည်းများ' : 'Fridge or Kitchen'}
              </span>
            </div>

            {selectedImage ? (
              <div className="relative rounded-xl overflow-hidden border border-amber-300 bg-stone-900 group">
                <img
                  src={selectedImage}
                  alt="Kitchen ingredients"
                  className="w-full h-40 sm:h-48 object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-rose-600 transition-colors shadow-md min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                    title={isMy ? 'ဖျက်မည်' : 'Remove image'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isAnalyzingPhoto && (
                  <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white px-4 text-center">
                    <Loader2 className="w-7 h-7 text-amber-400 animate-spin mb-2" />
                    <p className="text-xs font-semibold">
                      {isMy ? 'ဓာတ်ပုံထဲမှ ဟင်းချက်ပစ္စည်းများကို ရှာဖွေနေပါသည်...' : 'Detecting ingredients...'}
                    </p>
                  </div>
                )}

                <div className="p-2 sm:p-2.5 bg-amber-900/90 text-amber-100 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{isMy ? 'ဓာတ်ပုံ ထည့်သွင်းပြီးပါပြီ' : 'Photo attached'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => analyzePhoto(selectedImage)}
                    disabled={isAnalyzingPhoto}
                    className="underline hover:text-white shrink-0 text-[11px] cursor-pointer"
                  >
                    {isMy ? 'ပြန်စစ်မည်' : 'Re-scan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-amber-50/70 transition-all group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-stone-800">
                    {isMy ? 'ဓာတ်ပုံတင်ရန် နှိပ်ပါ' : 'Upload Kitchen Photo'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {isMy ? 'ဟင်းသီးဟင်းရွက်၊ အသားငါး၊ ရေခဲသေတ္တာပုံစံ' : 'PNG, JPG or WebP up to 15MB'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="min-h-[42px] py-2 px-2.5 text-xs font-bold rounded-xl bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span className="truncate">{isMy ? 'ကင်မရာရိုက်မည်' : 'Take Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[42px] py-2 px-2.5 text-xs font-bold rounded-xl bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 border border-stone-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <ImageIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{isMy ? 'ဖိုင်မှတင်မည်' : 'Browse File'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {photoError && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}
          </div>

          {/* Text Input & Added Chips Section (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-bold text-stone-800">
                  {isMy ? '၂။ ပစ္စည်းများကို စာဖြင့် ရိုက်ထည့်ရန်' : '2. Kitchen Ingredients (Text)'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {ingredients.length > 0
                    ? isMy
                      ? `${ingredients.length} မျိုး ထည့်ထားသည်`
                      : `${ingredients.length} added`
                    : isMy
                    ? 'Enter နှိပ်၍ ထည့်နိုင်သည်'
                    : 'Press Enter to add'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isMy
                      ? 'ဥပမာ - ကြက်သား၊ ခရမ်းချဉ်သီး၊ အာလူး...'
                      : 'e.g. Chicken, Tomato, Potato...'
                  }
                  className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddIngredient()}
                  disabled={!inputValue.trim()}
                  className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer min-h-[42px]"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline">{isMy ? 'ထည့်မည်' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* List of Added Ingredient Tags */}
            {ingredients.length > 0 ? (
              <div className="bg-stone-50/90 p-3 sm:p-3.5 rounded-2xl border border-stone-200">
                <div className="text-xs font-semibold text-stone-600 mb-2 flex items-center justify-between">
                  <span>{isMy ? 'လက်ရှိ ထည့်သွင်းထားသော ပစ္စည်းများ:' : 'Selected Ingredients:'}</span>
                  <button
                    type="button"
                    onClick={() => setIngredients([])}
                    className="text-[11px] text-stone-500 hover:text-rose-600 underline cursor-pointer"
                  >
                    {isMy ? 'အားလုံးဖျက်မည်' : 'Clear all'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {ingredients.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-amber-900 border border-amber-300 shadow-xs"
                    >
                      <span className="truncate max-w-[150px]">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 rounded-full cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 text-xs text-stone-500 text-center">
                {isMy
                  ? 'အထက်ပါအကွက်တွင် ဟင်းချက်ပစ္စည်း ရိုက်ထည့်ပါ သို့မဟုတ် အောက်ပါ ခလုတ်များမှ ရွေးချယ်ပါ'
                  : 'Type ingredients above, upload a photo, or tap popular ingredients below'}
              </div>
            )}

            {/* Quick Add Popular Ingredients Chips */}
            <div>
              <div className="text-xs font-bold text-stone-600 mb-1.5">
                {isMy ? 'အသုံးများသော ပစ္စည်းများကို နှိပ်၍ ထည့်နိုင်သည်:' : 'Tap to add common items:'}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {POPULAR_INGREDIENTS.map((item) => {
                  const isAdded = ingredients.includes(item.nameMy);
                  return (
                    <button
                      key={item.nameMy}
                      type="button"
                      onClick={() =>
                        isAdded
                          ? setIngredients((prev) => prev.filter((i) => i !== item.nameMy))
                          : handleAddIngredient(item.nameMy)
                      }
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer min-h-[30px] ${
                        isAdded
                          ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-3 h-3 text-amber-700 shrink-0" />
                      ) : (
                        <Plus className="w-3 h-3 text-stone-400 shrink-0" />
                      )}
                      <span>{isMy ? item.nameMy : item.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Options & Filters Bar */}
        <div className="pt-2 border-t border-stone-200 space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Cuisine Category */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMy ? 'ဟင်းအမျိုးအစား (Cuisine)' : 'Category'}
              </label>
              <select
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[40px]"
              >
                {cuisineOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {isMy ? opt.labelMy : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Cooking Time Preference */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isMy ? 'ချက်ပြုတ်ချိန်' : 'Cooking Time'}</span>
              </label>
              <select
                value={cookingTimeMax}
                onChange={(e) => setCookingTimeMax(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[40px]"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {isMy ? opt.labelMy : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Servings */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isMy ? 'လူဦးရေ (Servings)' : 'Servings'}</span>
              </label>
              <div className="flex rounded-xl border border-stone-300 overflow-hidden bg-white min-h-[40px]">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setServings(num)}
                    className={`flex-1 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${
                      servings === num
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {num} {isMy ? 'ဦး' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Engine & Model Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isMy ? 'AI စားဖိုမှူး မော်ဒယ်' : 'AI Model Engine'}</span>
              </label>
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[40px]"
              >
                <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (OpenRouter ⚡)</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (OpenRouter 👨‍🍳)</option>
                <option value="openai/gpt-4o">GPT-4o (OpenRouter 🎯)</option>
                <option value="deepseek/deepseek-chat">DeepSeek Chat (OpenRouter 🧠)</option>
                <option value="gemini-native">Google Gemini Native 3.8</option>
              </select>
            </div>
          </div>

          {/* Collapsible Pantry Staples Drawer */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-3 sm:p-4">
            <button
              type="button"
              onClick={() => setShowPantryAccordion(!showPantryAccordion)}
              className="w-full flex items-center justify-between text-left cursor-pointer min-h-[36px]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-amber-900">
                  {isMy ? 'အခြေခံ မီးဖိုချောင်သုံးပစ္စည်းများ (Pantry Staples)' : 'Standard Kitchen Staples'}
                </span>
                <span className="text-[11px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {pantryStaples.length} {isMy ? 'မျိုး' : 'selected'}
                </span>
              </div>
              <div className="text-amber-800 flex items-center gap-1 text-xs shrink-0 font-semibold">
                <span>{showPantryAccordion ? (isMy ? 'ခေါက်မည်' : 'Hide') : (isMy ? 'ပြင်ဆင်မည်' : 'Configure')}</span>
                {showPantryAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showPantryAccordion && (
              <div className="mt-3 pt-3 border-t border-amber-200/60 animate-in fade-in duration-150">
                <p className="text-xs text-stone-600 mb-2 leading-relaxed">
                  {isMy
                    ? 'အိမ်တိုင်းတွင် အလွယ်တကူရှိတတ်သော အခြေခံပစ္စည်းများဖြစ်ပြီး ဟင်းချက်ရာတွင် AI က ထည့်သွင်းအသုံးပြုပေးပါမည်။'
                    : 'Common kitchen staples AI can assume you have readily available at home.'}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {DEFAULT_PANTRY_STAPLES.map((staple) => {
                    const isChecked = pantryStaples.includes(staple.nameMy);
                    return (
                      <button
                        key={staple.id}
                        type="button"
                        onClick={() => handleTogglePantryStaple(staple.nameMy)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer min-h-[34px] ${
                          isChecked
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${isChecked ? 'bg-white text-amber-700' : 'border border-stone-400'}`}>
                          {isChecked && '✓'}
                        </span>
                        <span>{isMy ? staple.nameMy : staple.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || (ingredients.length === 0 && !selectedImage)}
            className="w-full py-3.5 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 active:scale-98 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed min-h-[48px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                <span className="truncate">{loadingMessage || (isMy ? 'ဟင်းချက်နည်းများကို ပြင်ဆင်နေပါသည်...' : 'Formulating recipes...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
                <span className="truncate">
                  {isMy
                    ? 'ဟင်းချက်နည်း အဆင့်ဆင့် ဖန်တီးမည် (Find Recipes)'
                    : 'Generate Step-by-Step Recipes'}
                </span>
              </>
            )}
          </button>
          {ingredients.length === 0 && !selectedImage && (
            <p className="text-center text-xs text-stone-500 mt-2">
              {isMy
                ? 'စတင်ရန် အထက်တွင် ပစ္စည်းတစ်ခုခု စာရိုက်ပါ သို့မဟုတ် ဓာတ်ပုံရိုက်ပို့ပါ'
                : 'Please add at least one ingredient or attach a photo to continue'}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
