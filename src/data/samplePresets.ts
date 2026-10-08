export interface SamplePreset {
  id: string;
  titleMy: string;
  titleEn: string;
  descriptionMy: string;
  ingredients: string[];
  cuisine: string;
  imageEmoji: string;
  sampleImageUrl?: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'egg-tomato',
    titleMy: 'ကြက်ဥ + ခရမ်းချဉ်သီး + ကြက်သွန်',
    titleEn: 'Eggs & Tomato Home Style',
    descriptionMy: 'မြန်မာအိမ်တိုင်း အလွယ်တကူချက်စားလေ့ရှိသော ကြက်ဥခရမ်းချဉ်သီး မွှေကြော် သို့မဟုတ် ဆီပြန်ဟင်း',
    ingredients: ['ကြက်ဥ', 'ခရမ်းချဉ်သီး', 'ကြက်သွန်နီ', 'ငရုတ်သီးစိမ်း', 'နံနံပင်'],
    cuisine: 'အမြန်ဟင်း',
    imageEmoji: '🍳',
  },
  {
    id: 'pork-morning-glory',
    titleMy: 'ဝက်သား + ကန်စွန်းရွက် + ကြက်သွန်ဖြူ',
    titleEn: 'Pork & Water Spinach (ကန်စွန်းရွက်)',
    descriptionMy: 'မြန်မာထမင်းဝိုင်းတွင် နာမည်ကြီးသော ဝက်သားကန်စွန်းရွက်ကြော် သို့မဟုတ် ဝက်သားဟင်းအနှစ်',
    ingredients: ['ဝက်သား', 'ကန်စွန်းရွက်', 'ကြက်သွန်ဖြူ', 'ပဲငံပြာရည်', 'ငရုတ်သီးစိမ်း'],
    cuisine: 'မြန်မာရိုးရာ',
    imageEmoji: '🥬',
  },
  {
    id: 'chicken-potato',
    titleMy: 'ကြက်သား + အာလူး + မဆလာ',
    titleEn: 'Chicken & Potato Curry',
    descriptionMy: 'မဆလာနံ့သင်းသင်းဖြင့် အနှစ်ပျစ်ပျစ် မြန်မာ့ရိုးရာ ကြက်သားအာလူးဆီပြန်ဟင်း',
    ingredients: ['ကြက်သား', 'အာလူး', 'ကြက်သွန်နီ', 'ကြက်သွန်ဖြူ', 'ဂျင်း', 'မဆလာ'],
    cuisine: 'ဆီပြန်ဟင်း',
    imageEmoji: '🍗',
  },
  {
    id: 'fish-sour-soup',
    titleMy: 'ငါး + မန်ကျည်းမှည့် + စပါးလင်',
    titleEn: 'Fish & Tamarind Sour Soup (ငါးဟင်းချို)',
    descriptionMy: 'အစာကြေစေပြီး လျှာလည်စေသော မြန်မာ့ရိုးရာ ငါးမန်ကျည်းသီးချဉ်ရည်ဟင်း',
    ingredients: ['ငါး', 'မန်ကျည်းမှည့်', 'စပါးလင်', 'ကြက်သွန်ဖြူ', 'နံနံပင်', 'ငရုတ်သီးစိမ်း'],
    cuisine: 'ဟင်းချို',
    imageEmoji: '🐟',
  },
];

export const POPULAR_INGREDIENTS = [
  { nameMy: 'ကြက်သား', nameEn: 'Chicken', category: 'meat' },
  { nameMy: 'ဝက်သား', nameEn: 'Pork', category: 'meat' },
  { nameMy: 'ငါး', nameEn: 'Fish', category: 'meat' },
  { nameMy: 'ပုစွန်', nameEn: 'Prawn', category: 'meat' },
  { nameMy: 'ကြက်ဥ', nameEn: 'Egg', category: 'meat' },
  { nameMy: 'အမဲသား', nameEn: 'Beef', category: 'meat' },
  { nameMy: 'အာလူး', nameEn: 'Potato', category: 'veg' },
  { nameMy: 'ခရမ်းချဉ်သီး', nameEn: 'Tomato', category: 'veg' },
  { nameMy: 'ကန်စွန်းရွက်', nameEn: 'Water spinach', category: 'veg' },
  { nameMy: 'ခရမ်းသီး', nameEn: 'Eggplant', category: 'veg' },
  { nameMy: 'ဂေါ်ဖီ', nameEn: 'Cabbage', category: 'veg' },
  { nameMy: 'မုန်လာဥနီ', nameEn: 'Carrot', category: 'veg' },
  { nameMy: 'ပဲသီး', nameEn: 'Long beans', category: 'veg' },
  { nameMy: 'မှို', nameEn: 'Mushroom', category: 'veg' },
  { nameMy: 'တို့ဟူး', nameEn: 'Tofu', category: 'veg' },
  { nameMy: 'ကြက်သွန်နီ', nameEn: 'Shallot/Onion', category: 'aromatic' },
  { nameMy: 'ကြက်သွန်ဖြူ', nameEn: 'Garlic', category: 'aromatic' },
  { nameMy: 'ဂျင်း', nameEn: 'Ginger', category: 'aromatic' },
  { nameMy: 'ငရုတ်သီးစိမ်း', nameEn: 'Green Chili', category: 'aromatic' },
  { nameMy: 'နံနံပင်', nameEn: 'Coriander', category: 'aromatic' },
];

export const DEFAULT_PANTRY_STAPLES = [
  { id: 'oil', nameMy: 'ဆီ', nameEn: 'Cooking Oil', checked: true },
  { id: 'salt', nameMy: 'ဆား', nameEn: 'Salt', checked: true },
  { id: 'seasoning', nameMy: 'ဟင်းခတ်မှုန့်', nameEn: 'Seasoning powder', checked: true },
  { id: 'fish-sauce', nameMy: 'ငံပြာရည်', nameEn: 'Fish sauce', checked: true },
  { id: 'turmeric', nameMy: 'နနွင်းမှုန့်', nameEn: 'Turmeric', checked: true },
  { id: 'chili-powder', nameMy: 'ငရုတ်သီးမှုန့်', nameEn: 'Chili powder', checked: true },
  { id: 'soy-sauce', nameMy: 'ပဲငံပြာရည်', nameEn: 'Soy sauce', checked: true },
  { id: 'masala', nameMy: 'မဆလာ', nameEn: 'Garam Masala', checked: false },
];
