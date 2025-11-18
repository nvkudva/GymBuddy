import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessGoal } from '../types';
import { GlassCard, GlassButton, GlassInput } from './ui/GlassCard';
import { Dumbbell, Ruler, Scale, Target, Sparkles, ChevronRight, ArrowRight, Flame, Heart, Zap, Wind, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const goalDetails: Record<string, { icon: React.ReactNode, desc: string, color: string }> = {
    [FitnessGoal.MUSCLE_BUILDING]: { icon: <Dumbbell className="w-5 h-5" />, desc: "Build mass & strength", color: "text-purple-500" },
    [FitnessGoal.WEIGHT_LOSS]: { icon: <Flame className="w-5 h-5" />, desc: "Burn fat & tone up", color: "text-orange-500" },
    [FitnessGoal.FITNESS]: { icon: <Heart className="w-5 h-5" />, desc: "Health & longevity", color: "text-red-500" },
    [FitnessGoal.RUNNING]: { icon: <Zap className="w-5 h-5" />, desc: "Endurance & speed", color: "text-yellow-500" },
    [FitnessGoal.FLEXIBILITY]: { icon: <Wind className="w-5 h-5" />, desc: "Mobility & yoga", color: "text-blue-500" }
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '', 
    name: '',
    age: 25,
    height: 175,
    weight: 70,
    goal: FitnessGoal.FITNESS
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Analyzing biometrics...",
    "Calculating metabolic rate...",
    "Structuring weekly split...",
    "Selecting optimal exercises...",
    "Assigning rest periods...",
    "Finalizing your Gym Buddy plan..."
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500); 
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [isLoading]);

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    // Simulate auth delay
    setTimeout(() => {
      setProfile(prev => ({ ...prev, name: 'Vijay' }));
      setIsLoggingIn(false);
      setStep(3); // Skip manual name entry
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const completeProfile = { ...profile, id: profile.id || uuidv4() };
    onComplete(completeProfile);
  };

  const isStepValid = () => {
    if (step === 1) return true; // Login options
    if (step === 2) return profile.name.trim().length > 0;
    if (step === 3) return profile.age > 10 && profile.height > 50 && profile.weight > 20;
    return true;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden text-gray-900 dark:text-white">
        <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-purple-500 animate-spin" style={{ animationDuration: '1s' }}></div>
                <div className="absolute inset-3 rounded-full border-b-4 border-r-4 border-blue-500 animate-spin-reverse" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-purple-500 dark:text-white opacity-90 animate-pulse" />
                </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-200 dark:to-blue-200 animate-pulse">
              Building Your Routine
            </h2>
            
            <div className="h-8 overflow-hidden relative w-full max-w-xs">
                {loadingSteps.map((stepText, index) => (
                   <div 
                     key={index}
                     className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform
                        ${index === loadingStep ? 'opacity-100 translate-y-0' : index < loadingStep ? 'opacity-0 -translate-y-full' : 'opacity-0 translate-y-full'}
                     `}
                   >
                     <span className="text-gray-500 dark:text-white/70 font-mono text-sm">{stepText}</span>
                   </div>
                ))}
            </div>

            <div className="w-64 h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-6 overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                 style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
               />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <GlassCard className="w-full max-w-xl p-8 md:p-12 animate-fade-in-up relative overflow-hidden">
        
        {/* Wizard Progress Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
           <div className="flex items-center gap-3">
               <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                   <Dumbbell className="w-6 h-6 text-white" />
               </div>
               <div>
                   <h1 className="text-xl font-bold text-gray-900 dark:text-white">Setup Profile</h1>
                   <p className="text-gray-500 dark:text-white/50 text-xs">Step {step} of {totalSteps}</p>
               </div>
           </div>
           
           {/* Step Indicators */}
           <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div 
                    key={s} 
                    className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-purple-500' : s < step ? 'w-2 bg-green-500' : 'w-2 bg-gray-200 dark:bg-white/20'}`} 
                />
              ))}
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10 min-h-[300px] flex flex-col justify-between">
          
          {/* Step 1: Login / Signup */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in text-center">
               <div className="mb-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Gym Buddy</h2>
                  <p className="text-gray-600 dark:text-white/60">Your AI-powered personal trainer. <br/>Sign in to sync your progress.</p>
               </div>

               <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group"
                  >
                    <GoogleIcon />
                    {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
                  </button>

                  <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400">or continue as guest</span>
                      </div>
                  </div>

                  <GlassButton 
                    type="button"
                    onClick={handleNext} 
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    Start Setup <ArrowRight className="w-4 h-4" />
                  </GlassButton>
               </div>
            </div>
          )}

          {/* Step 2: Name */}
          {step === 2 && (
             <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What should we call you?</h2>
                   <p className="text-gray-500 dark:text-white/50">This helps us personalize your experience.</p>
                </div>
                <div className="pt-4">
                   <label className="text-sm text-gray-600 dark:text-white/60 mb-1 block">First Name</label>
                   <GlassInput 
                     value={profile.name}
                     onChange={(e) => handleChange('name', e.target.value)}
                     placeholder="e.g. Vijay"
                     autoFocus
                   />
                </div>
             </div>
          )}

          {/* Step 3: Stats */}
          {step === 3 && (
             <div className="space-y-6 animate-fade-in">
                 <div className="text-center">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Stats</h2>
                   <p className="text-gray-500 dark:text-white/50">Required to calculate your optimal training volume.</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60 mb-1">
                            <Sparkles className="w-4 h-4 text-purple-500" /> Age
                        </label>
                        <GlassInput 
                            type="number" 
                            value={profile.age} 
                            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60 mb-1">
                                <Ruler className="w-4 h-4 text-blue-500" /> Height (cm)
                            </label>
                            <GlassInput 
                                type="number" 
                                value={profile.height} 
                                onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)} 
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60 mb-1">
                                <Scale className="w-4 h-4 text-green-500" /> Weight (kg)
                            </label>
                            <GlassInput 
                                type="number" 
                                value={profile.weight} 
                                onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)} 
                            />
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* Step 4: Goal */}
          {step === 4 && (
             <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-2">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Primary Goal</h2>
                   <p className="text-gray-500 dark:text-white/50">We'll design your program around this.</p>
                </div>
                
                <div className="grid gap-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    {Object.values(FitnessGoal).map((goal) => (
                        <button
                            key={goal}
                            type="button"
                            onClick={() => handleChange('goal', goal)}
                            className={`
                                w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 group
                                ${profile.goal === goal 
                                    ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-50 ring-1 ring-purple-500' 
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/30'}
                            `}
                        >
                            <div className={`p-2 rounded-full ${profile.goal === goal ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 group-hover:text-purple-500 group-hover:bg-purple-500/10'}`}>
                                {goalDetails[goal]?.icon || <Target className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className={`text-sm font-semibold ${profile.goal === goal ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>{goal}</div>
                                <div className="text-xs text-gray-500 dark:text-white/50">{goalDetails[goal]?.desc}</div>
                            </div>
                            {profile.goal === goal && <div className="ml-auto text-purple-500"><Check className="w-4 h-4" /></div>}
                        </button>
                    ))}
                </div>
             </div>
          )}

          {/* Navigation Buttons */}
          {step > 1 && (
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                <GlassButton 
                    type="button" 
                    variant="secondary" 
                    onClick={handleBack}
                    className="flex-1"
                >
                    Back
                </GlassButton>
                <GlassButton 
                    type="submit" 
                    disabled={!isStepValid()}
                    onClick={step === totalSteps ? undefined : (e) => { e.preventDefault(); handleNext(); }}
                    className="flex-[2]"
                >
                    {step === totalSteps ? (
                        <>Lets Go <Sparkles className="w-4 h-4" /></>
                    ) : (
                        <>Next Step <ChevronRight className="w-4 h-4" /></>
                    )}
                </GlassButton>
            </div>
          )}

        </form>
      </GlassCard>
    </div>
  );
};

export default Onboarding;