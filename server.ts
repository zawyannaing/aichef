import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow payloads with base64 photos
app.use(express.json({ limit: '25mb' }));

// 1. Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize base64 strings
function sanitizeBase64(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: dataUrl,
  };
}

// 2. OpenRouter API Caller
async function callOpenRouter(params: {
  systemPrompt?: string;
  userPrompt: string;
  imageBase64?: string;
  mimeType?: string;
  model?: string;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const model = params.model || process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  const userContent: any[] = [{ type: 'text', text: params.userPrompt }];

  if (params.imageBase64) {
    const { data: cleanBase64, mimeType } = sanitizeBase64(params.imageBase64);
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${cleanBase64}`,
      },
    });
  }

  const messages: any[] = [];
  if (params.systemPrompt) {
    messages.push({ role: 'system', content: params.systemPrompt });
  }
  messages.push({ role: 'user', content: userContent });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'https://aistudio.google.com',
      'X-Title': 'Kitchen Chef Myanmar AI',
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return text;
}

// 3. Google Gemini Native Fallback Caller
async function callGeminiNative(params: {
  userPrompt: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<string> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const parts: any[] = [];

  if (params.imageBase64) {
    const { data: cleanBase64, mimeType } = sanitizeBase64(params.imageBase64);
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });
  }
  parts.push({ text: params.userPrompt });

  let lastError: any = null;
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
        },
      });
      return response.text || '{}';
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini Native ${model} failed. Trying fallback...`);
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw lastError;
}

// Unified AI Dispatcher: Uses OpenRouter if key configured, otherwise native Gemini
async function dispatchAICall(params: {
  systemPrompt?: string;
  userPrompt: string;
  imageBase64?: string;
  mimeType?: string;
  preferredProvider?: string;
  model?: string;
}): Promise<string> {
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim());

  if (hasOpenRouter && params.preferredProvider !== 'gemini_native') {
    try {
      console.log(`[AI Dispatch] Using OpenRouter with model: ${params.model || process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash'}`);
      return await callOpenRouter({
        systemPrompt: params.systemPrompt,
        userPrompt: params.userPrompt,
        imageBase64: params.imageBase64,
        mimeType: params.mimeType,
        model: params.model,
      });
    } catch (openRouterErr: any) {
      console.warn('[AI Dispatch] OpenRouter call failed, falling back to Gemini native:', openRouterErr.message);
      return await callGeminiNative({
        userPrompt: params.userPrompt,
        imageBase64: params.imageBase64,
        mimeType: params.mimeType,
      });
    }
  }

  // Fallback / default to Gemini native
  console.log('[AI Dispatch] Using Gemini Native SDK');
  return await callGeminiNative({
    userPrompt: params.userPrompt,
    imageBase64: params.imageBase64,
    mimeType: params.mimeType,
  });
}

// Endpoint: AI Engine Info & status
app.get('/api/engine-status', (req, res) => {
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

  res.json({
    hasOpenRouter,
    hasGemini,
    activeProvider: hasOpenRouter ? 'openrouter' : 'gemini',
    defaultModel: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
    availableModels: [
      { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Lightning Fast & Multimodal)', provider: 'OpenRouter' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Master Culinary Prose)', provider: 'OpenRouter' },
      { id: 'openai/gpt-4o', label: 'GPT-4o (Vision & Step Precision)', provider: 'OpenRouter' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (Deep Culinary Reasoning)', provider: 'OpenRouter' },
      { id: 'gemini-native', label: 'Google Gemini Native 3.8', provider: 'Google Cloud' },
    ],
  });
});

// 1. Analyze kitchen photo to detect ingredients
app.post('/api/recipe/analyze-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', model } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const systemPrompt = `You are a culinary computer vision expert and master chef of Myanmar and Asian gastronomy.
Analyze photos of kitchen pantries, countertops, refrigerators, and market baskets.
Accurately identify all raw food materials, meats, seafood, eggs, produce, herbs, and condiments.`;

    const userPrompt = `
Examine this kitchen photo with high culinary precision.
Identify all visible food ingredients, vegetables, meats, seafood, eggs, herbs, condiments, or pantry items.
Provide the Burmese name (မြန်မာအမည်) and English name.
Return ONLY valid JSON matching this schema:
{
  "detectedIngredients": [
    {
      "nameMy": "မြန်မာအမည် (ဥပမာ- ကြက်ဥ၊ ခရမ်းချဉ်သီး၊ ကန်စွန်းရွက်)",
      "nameEn": "English name (e.g. Eggs, Tomatoes, Water spinach)",
      "category": "အသားငါး / အသီးအရွက် / ဟင်းခတ်အမွှေးအကြိုင် / ကောက်ပဲသီးနှံ / အခြား",
      "freshnessOrState": "လတ်ဆတ် / ချက်ရန်အဆင်သင့် / စသည်"
    }
  ],
  "pantrySummary": "မီးဖိုချောင်ထဲရှိ ပစ္စည်းများကို သုံးသပ်ချက် (Burmese summary of what ingredients are available in the kitchen)"
}
Return valid JSON only.
`;

    const text = await dispatchAICall({
      systemPrompt,
      userPrompt,
      imageBase64,
      mimeType,
      model,
    });

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { detectedIngredients: [] };
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Error analyzing photo:', err);
    return res.status(500).json({
      error: 'ဓာတ်ပုံမှ ဟင်းချက်ပစ္စည်းများကို ဖတ်ရှုရာတွင် အဆင်မပြေဖြစ်သွားပါသည်။ ပြန်လည်ကြိုးစားပေးပါ။',
      details: err?.message || String(err),
    });
  }
});

// 2. Generate detailed step-by-step recipes with Master Chef Prompt
app.post('/api/recipe/generate', async (req, res) => {
  try {
    const {
      ingredients = [],
      pantryStaples = [],
      imageBase64,
      mimeType = 'image/jpeg',
      cuisineType = 'အားလုံး',
      cookingTimeMax = 'မည်သည့်အချိန်မဆို',
      servings = 2,
      dietary = '',
      language = 'my',
      model,
    } = req.body;

    const ingredientsListStr = Array.isArray(ingredients) ? ingredients.join(', ') : String(ingredients);
    const pantryStaplesStr = Array.isArray(pantryStaples) ? pantryStaples.join(', ') : String(pantryStaples);

    const systemPrompt = `You are Saya/Daw Daw, a world-class Myanmar Master Chef and culinary scholar.
You possess encyclopedic knowledge of traditional Burmese home cooking (အိမ်ချက်မြန်မာဟင်း), Burmese curry foundations (ဆီပြန်ဟင်းအနှစ်), soups (ဟင်းခါး/ဟင်းချို), salads (အသုပ်), stir-fries (အကြော်), and regional ethnic cuisines (Shan, Mon, Rakhine, Bamar).
Your recipes must be appetizing, practical, deeply flavorful, culturally authentic, and written with warm, crystal-clear Burmese prose (ဗမာစကားပြေ).`;

    const userPrompt = `
KITCHEN SITUATION:
- Ingredients available (မီးဖိုချောင်ရှိ ပစ္စည်းများ): ${ingredientsListStr || 'None specified in text (inspect attached photo)'}
- Household Pantry Staples Available (အိမ်သုံး အခြေခံပစ္စည်းများ): ${pantryStaplesStr || 'ဆီ၊ ဆား၊ ဟင်းခတ်မှုန့်၊ ကြက်သွန်နီ၊ ကြက်သွန်ဖြူ၊ ငံပြာရည်၊ နနွင်းမှုန့်'}
- Desired Category (ဟင်းအမျိုးအစား): ${cuisineType}
- Maximum Cooking Time (ချက်ပြုတ်ချိန် ကန့်သတ်ချက်): ${cookingTimeMax}
- Number of Diners (စားသုံးသူ လူဦးရေ): ${servings} ယောက်
- Dietary / Allergies: ${dietary || 'None'}

MISSION & MASTER CHEF PROMPT INSTRUCTIONS:
1. Formulate 3 to 4 distinct, mouthwatering recipes utilizing these ingredients efficiently:
   - Provide genuine Myanmar culinary flair:
     * ဆီပြန်ဟင်း (Rich braised curry with aromatic onion/garlic paste and oil separation)
     * ဟင်းချို / စွပ်ပြုတ် (Soothing clear soup or pepper broth)
     * အကြော် / မွှေကြော် (Quick stir-fry retaining vibrant colors and crisp texture)
     * သုပ် / သုပ်ချက် (Authentic salad with aromatic oil and roasted powders)
   - Ensure step instructions explain practical culinary techniques:
     * ဆီသတ်နည်း (e.g. "ကြက်သွန်နီ၊ ဖြူ၊ ဂျင်းတို့ကို အနံ့မွှေးပြီး ရွှေဝါရောင်သန်းသည်အထိ မီးအလယ်အလတ်ဖြင့် ဆီသတ်ပါ")
     * အသားနယ်နှပ်နည်း (e.g. "ဆား၊ နနွင်း၊ ဟင်းခတ်မှုန့်ဖြင့် ၁၀ မိနစ်ခန့် နှပ်ထားပါ")
     * ရေထည့်တည်နည်း (e.g. "အသားမြှုပ်ရုံ ရေနွေးထည့်ပြီး အဖုံးအုပ်၍ ဆီပြန်လာသည်အထိ မီးအေးအေးဖြင့် တည်ထားပါ")
   - For every step, assign an accurate timer duration (in minutes) for countdown cooking timers.
   - Include Master Chef Secret Tips (စားဖိုမှူး၏ အထူးလျှို့ဝှက်ချက်) for elevating flavor and texture naturally.
   - Mention approximate pantry match score (0-100%).

OUTPUT REQUIREMENTS:
Output strictly valid JSON with this exact schema (no trailing commas, no markdown outside JSON):
{
  "detectedIngredients": [
    {
      "nameMy": "မြန်မာအမည်",
      "nameEn": "English name"
    }
  ],
  "kitchenSummary": "မီးဖိုချောင်ထဲရှိ ပစ္စည်းများကို အခြေခံ၍ စားဖိုမှူး၏ နွေးထွေးသော သုံးသပ်ချက်နှင့် အကြံပြုချက် (in warm, encouraging Burmese)",
  "recipes": [
    {
      "id": "recipe-1",
      "titleMy": "ဟင်းအမည် (မြန်မာလို)",
      "titleEn": "English Recipe Title",
      "tagline": "အရသာရှိပြီး မြိန်စေမည့် မြန်မာ့ရိုးရာ ဟင်းတစ်ခွက်",
      "category": "ဆီပြန်ဟင်း / ဟင်းချို / အကြော် / အသုပ် / အမြန်ဟင်း / သက်သတ်လွတ်",
      "difficulty": "လွယ်ကူ" | "အလယ်အလတ်" | "ကျွမ်းကျင်",
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 20,
      "servings": ${servings},
      "estimatedCalories": "350 kcal",
      "pantryMatchScore": 95,
      "mainIngredientsUsed": ["ကြက်သား", "အာလူး", "ကြက်သွန်"],
      "missingOrOptionalIngredients": ["နံနံပင်", "မဆလာ"],
      "ingredients": [
        {
          "itemMy": "ကြက်သား",
          "itemEn": "Chicken",
          "amount": "၃၀ သား (သို့မဟုတ် ၅၀၀ ဂရမ်)",
          "isPantryStaple": false,
          "note": "အတုံးသေးသေး တုံးထားပါ"
        },
        {
          "itemMy": "ဆီ",
          "itemEn": "Cooking Oil",
          "amount": "ထမင်းစားဇွန်း ၃ ဇွန်း",
          "isPantryStaple": true,
          "note": "မြေပဲဆီ သို့မဟုတ် နေကြာဆီ"
        }
      ],
      "steps": [
        {
          "stepNumber": 1,
          "title": "ပစ္စည်းများ ပြင်ဆင်ခြင်းနှင့် နယ်နှပ်ခြင်း",
          "instruction": "အသားကို သန့်စင်အောင်ဆေးကြောပြီး ဆား၊ ဟင်းခတ်မှုန့်၊ နနွင်းမှုန့်တို့ဖြင့် ၁၀ မိနစ်ခန့် သမအောင် နယ်ထားပါ။",
          "timerMinutes": 10,
          "tip": "အရသာ ပိုမိုစိမ့်ဝင်စေရန် ခေတ္တ နှပ်ထားပေးပါ"
        },
        {
          "stepNumber": 2,
          "title": "ဆီသတ်ခြင်း",
          "instruction": "ဒယ်အိုးထဲသို့ ဆီထည့်ပြီး ပူလာလျှင် ထောင်းထားသော ကြက်သွန်နီ၊ ကြက်သွန်ဖြူ၊ ဂျင်းနှင့် ငရုတ်သီးမှုန့်တို့ကို ထည့်၍ အနံ့မွှေးလာသည်အထိ ဆီသတ်ပါ။",
          "timerMinutes": 3,
          "tip": "မတူးစေရန် မီးအလယ်အလတ်ဖြင့် မွှေပေးပါ"
        }
      ],
      "chefTips": "ဟင်းအနှစ် ပိုမိုပျစ်ပျစ်လေးဖြစ်စေရန် ကြက်သွန်နီကို ညက်အောင်ထောင်းပြီး သေချာဆီသတ်ပေးပါ။",
      "nutritionHighlights": "ပရိုတင်းဓာတ် ကြွယ်ဝပြီး ခွန်အားပြည့်ဝစေပါသည်။",
      "flavorProfile": "ဆီပြန် မွှေးမွှေးစပ်စပ်လေး"
    }
  ]
}
`;

    const text = await dispatchAICall({
      systemPrompt,
      userPrompt,
      imageBase64,
      mimeType,
      model,
    });

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { recipes: [] };
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Error generating recipes:', err);
    return res.status(500).json({
      error: 'ဟင်းချက်နည်း ဖန်တီးရာတွင် အခက်အခဲရှိသွားပါသည်။ ပြန်လည်စမ်းသပ်ပေးပါ။',
      details: err?.message || String(err),
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openRouterKeyConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kitchen Chef AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
