import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Flame,
  ChefHat,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { Recipe } from '../types';
import { playKitchenChime, playTickSound } from '../utils/audio';

interface CookingModeModalProps {
  recipe: Recipe | null;
  language: 'my' | 'en';
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  language,
  onClose,
}) => {
  if (!recipe) return null;

  const isMy = language === 'my';
  const steps = recipe.steps || [];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Timer State for current step
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Initialize or reset timer whenever step changes
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerRunning(false);
    setTimerFinished(false);

    if (currentStep?.timerMinutes && currentStep.timerMinutes > 0) {
      setTimerSeconds(currentStep.timerMinutes * 60);
    } else {
      setTimerSeconds(0);
    }

    // Cancel any active speech when switching steps
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentStepIndex, currentStep]);

  // Handle countdown interval
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            setTimerFinished(true);
            playKitchenChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  // Toggle timer
  const toggleTimer = () => {
    if (timerFinished && timerSeconds === 0) {
      // Reset if already finished
      if (currentStep?.timerMinutes) {
        setTimerSeconds(currentStep.timerMinutes * 60);
        setTimerFinished(false);
        setIsTimerRunning(true);
      }
      return;
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerRunning(false);
    setTimerFinished(false);
    if (currentStep?.timerMinutes) {
      setTimerSeconds(currentStep.timerMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
  };

  const addMinuteToTimer = () => {
    setTimerSeconds((prev) => prev + 60);
    setTimerFinished(false);
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Text to speech
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert(isMy ? 'သင့် Browser တွင် အသံဖတ်ရှုမှု မထောက်ပံ့ပါ' : 'Speech synthesis not supported');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${currentStep.title}. ${currentStep.instruction}. ${
      currentStep.tip ? `မှတ်ချက်: ${currentStep.tip}` : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;

    // Check available voices for Burmese or fallback
    const voices = window.speechSynthesis.getVoices();
    const burmeseVoice = voices.find((v) => v.lang.startsWith('my') || v.lang.includes('burmese'));
    if (burmeseVoice) {
      utterance.voice = burmeseVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Navigation
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      playKitchenChime();
    }
  };

  const handlePrev = () => {
    if (isFinished) {
      setIsFinished(false);
      return;
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col text-white animate-in fade-in duration-200">
      {/* Top Navbar */}
      <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>{isMy ? 'မီးဖိုချောင် လက်ထောက် မုဒ်' : 'Cooking Assistant Mode'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white truncate max-w-xs sm:max-w-md">
              {recipe.titleMy}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          title="Exit Cooking Mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-400">
                  <span>
                    {isMy
                      ? `အဆင့် ${currentStepIndex + 1} / ${steps.length}`
                      : `Step ${currentStepIndex + 1} of ${steps.length}`}
                  </span>
                  <span>
                    {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% {isMy ? 'ပြီးစီး' : 'Complete'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{
                      width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Step Card */}
              <div className="bg-stone-900/90 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl relative">
                {/* Voice Read aloud button */}
                <button
                  type="button"
                  onClick={handleSpeak}
                  className={`absolute top-6 right-6 p-2.5 rounded-2xl border transition-all ${
                    isSpeaking
                      ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read instruction aloud'}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="pr-12">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-900/60 text-amber-300 border border-amber-700 mb-3">
                    {isMy ? `အဆင့် ${currentStep?.stepNumber}` : `Step ${currentStep?.stepNumber}`}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {currentStep?.title}
                  </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-800">
                  <p className="text-stone-200 text-base sm:text-xl leading-relaxed sm:leading-loose">
                    {currentStep?.instruction}
                  </p>
                </div>

                {currentStep?.tip && (
                  <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">{isMy ? 'စားဖိုမှူး အကြံပေးချက်:' : 'Chef Note:'}</strong>{' '}
                      {currentStep.tip}
                    </div>
                  </div>
                )}
              </div>

              {/* Kitchen Countdown Timer (If step has duration or manual timer) */}
              {(currentStep?.timerMinutes || timerSeconds > 0) && (
                <div
                  className={`rounded-3xl p-5 sm:p-6 border transition-all ${
                    timerFinished
                      ? 'bg-emerald-950/60 border-emerald-600 animate-bounce'
                      : isTimerRunning
                      ? 'bg-amber-950/40 border-amber-600/80'
                      : 'bg-stone-900/80 border-stone-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          timerFinished
                            ? 'bg-emerald-600 text-white'
                            : isTimerRunning
                            ? 'bg-amber-600 text-white animate-pulse'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 block font-semibold">
                          {isMy ? 'ချက်ပြုတ်ချိန် ချိန်စက်' : 'Step Kitchen Timer'}
                        </span>
                        <span
                          className={`text-3xl sm:text-4xl font-mono font-black tracking-wider ${
                            timerFinished
                              ? 'text-emerald-400'
                              : isTimerRunning
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}
                        >
                          {formatTime(timerSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleTimer}
                        className={`py-2.5 px-5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${
                          timerFinished
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : isTimerRunning
                            ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20'
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>{isMy ? 'ခေတ္တရပ်မည်' : 'Pause'}</span>
                          </>
                        ) : timerFinished ? (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>{isMy ? 'ပြန်လည်စတင်မည်' : 'Restart'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>{isMy ? 'အချိန်စတင်မည်' : 'Start Timer'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={addMinuteToTimer}
                        className="py-2.5 px-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700"
                        title="Add 1 minute"
                      >
                        +1 {isMy ? 'မိနစ်' : 'min'}
                      </button>

                      <button
                        type="button"
                        onClick={resetTimer}
                        className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700"
                        title="Reset"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {timerFinished && (
                    <div className="mt-3 text-center text-xs font-bold text-emerald-400 animate-pulse">
                      🔔 {isMy ? 'အချိန်ပြည့်ပါပြီ! နောက်တစ်ဆင့်သို့ ဆက်သွားနိုင်ပါသည်' : 'Time is up! Ready for next step'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Celebration Screen when done! */
            <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 border border-amber-600/60 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-orange-600/30">
                <PartyPopper className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-1">
                  {isMy ? 'ဂုဏ်ယူပါသည်' : 'Congratulations'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {isMy ? 'ဟင်းချက်ပြီးစီးပါပြီ!' : 'Cooking Completed!'}
                </h3>
                <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-md mx-auto">
                  {isMy
                    ? `${recipe.titleMy} ကို အောင်မြင်စွာ ချက်ပြုတ်ပြီးပါပြီ။ မိသားစုနှင့်အတူ အရသာရှိရှိ သုံးဆောင်နိုင်ပါပြီ။`
                    : `Your delicious ${recipe.titleMy} is now ready to serve and enjoy.`}
                </p>
              </div>

              {recipe.chefTips && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-left text-xs sm:text-sm text-amber-200">
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>{isMy ? 'စားသုံးရန် အကြံပြုချက်:' : 'Serving Recommendation:'}</span>
                  </div>
                  <p>{recipe.chefTips}</p>
                </div>
              )}

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFinished(false);
                    setCurrentStepIndex(0);
                  }}
                  className="py-3 px-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm"
                >
                  {isMy ? 'အစမှ ပြန်လည်ကြည့်မည်' : 'Review from Start'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30"
                >
                  {isMy ? 'ချက်ပြုတ်မုဒ်မှ ထွက်မည်' : 'Exit to Recipes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Step Navigation Controls */}
      {!isFinished && (
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="py-3 px-5 rounded-2xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 font-bold text-sm flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{isMy ? 'ရှေ့တစ်ဆင့်' : 'Previous Step'}</span>
          </button>

          <div className="text-center">
            <span className="text-xs text-stone-400 block font-medium">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
          >
            <span>
              {currentStepIndex === steps.length - 1
                ? isMy
                  ? 'ပြီးစီးပါပြီ'
                  : 'Finish Cooking'
                : isMy
                ? 'နောက်တစ်ဆင့်'
                : 'Next Step'}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
