import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import Header from './components/Header';
import ProfileSettings from './components/ProfileSettings';
import { UserProfile, WorkoutPlan } from './types';
import { generateInitialPlan } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

// Storage Keys
const STORAGE_KEY_PROFILES = 'gymbuddy_profiles';
const STORAGE_KEY_PLANS = 'gymbuddy_plans';
const STORAGE_KEY_ACTIVE_ID = 'gymbuddy_active_user';

const App: React.FC = () => {
  // State now manages a list of profiles and a dictionary of plans
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<Record<string, WorkoutPlan>>({});
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');
  const [isAddingNewProfile, setIsAddingNewProfile] = useState(false);

  // Initial Load & Migration
  useEffect(() => {
    const savedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
    const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
    const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);

    if (savedProfiles && savedPlans) {
      // Load modern data
      const parsedProfiles = JSON.parse(savedProfiles);
      setProfiles(parsedProfiles);
      setPlans(JSON.parse(savedPlans));
      
      if (savedActiveId && parsedProfiles.find((p: UserProfile) => p.id === savedActiveId)) {
        setActiveProfileId(savedActiveId);
      } else if (parsedProfiles.length > 0) {
        setActiveProfileId(parsedProfiles[0].id);
      }
    } else {
      // Migration: Check for old single-user data
      const oldProfile = localStorage.getItem('aura_profile');
      const oldPlan = localStorage.getItem('aura_plan');

      if (oldProfile && oldPlan) {
        const parsedOldProfile = JSON.parse(oldProfile);
        // Ensure old profile has an ID
        if (!parsedOldProfile.id) parsedOldProfile.id = uuidv4();
        
        const newProfiles = [parsedOldProfile];
        const newPlans = { [parsedOldProfile.id]: JSON.parse(oldPlan) };

        setProfiles(newProfiles);
        setPlans(newPlans);
        setActiveProfileId(parsedOldProfile.id);
        
        // Save immediately to new format
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(newProfiles));
        localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(newPlans));
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, parsedOldProfile.id);
      }
    }
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    }
    if (Object.keys(plans).length > 0) {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
    }
    if (activeProfileId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProfileId);
    }
  }, [profiles, plans, activeProfileId]);

  // Computed active data
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;
  const activePlan = activeProfileId ? plans[activeProfileId] : null;

  const handleOnboardingComplete = async (userProfile: UserProfile) => {
    setIsLoading(true);
    try {
      // Ensure ID exists
      if (!userProfile.id) userProfile.id = uuidv4();

      const generatedPlan = await generateInitialPlan(userProfile);
      
      const newProfiles = [...profiles, userProfile];
      const newPlans = { ...plans, [userProfile.id]: generatedPlan };

      setProfiles(newProfiles);
      setPlans(newPlans);
      setActiveProfileId(userProfile.id);
      setIsAddingNewProfile(false);
    } catch (error) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanUpdate = (newPlan: WorkoutPlan) => {
    if (!activeProfileId) return;
    setPlans(prev => ({ ...prev, [activeProfileId]: newPlan }));
  };

  const handleUpdateProfile = async (newProfile: UserProfile, shouldRegenerate: boolean) => {
    const updatedProfiles = profiles.map(p => p.id === newProfile.id ? newProfile : p);
    setProfiles(updatedProfiles);

    if (shouldRegenerate) {
      setIsLoading(true);
      try {
        const newPlan = await generateInitialPlan(newProfile);
        setPlans(prev => ({ ...prev, [newProfile.id]: newPlan }));
        setCurrentView('dashboard');
      } catch (error) {
        console.error(error);
        alert("Profile updated, but failed to regenerate plan.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetApp = () => {
    if (window.confirm("Are you sure? This will delete the current profile and its plan.")) {
      if (!activeProfileId) return;

      const newProfiles = profiles.filter(p => p.id !== activeProfileId);
      const { [activeProfileId]: deletedPlan, ...newPlans } = plans;

      setProfiles(newProfiles);
      setPlans(newPlans);

      if (newProfiles.length > 0) {
        setActiveProfileId(newProfiles[0].id);
        setCurrentView('dashboard');
      } else {
        setActiveProfileId(null);
        localStorage.removeItem(STORAGE_KEY_PROFILES);
        localStorage.removeItem(STORAGE_KEY_PLANS);
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      }
    }
  };

  const handleSwitchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    setCurrentView('dashboard');
    setIsAddingNewProfile(false);
  };

  const handleAddNewProfile = () => {
    setIsAddingNewProfile(true);
  };

  return (
    // Abstract Colorful Mesh Gradient Background
    <div className="min-h-screen bg-black font-sans text-slate-900 relative overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Fixed Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-600/20 blur-[100px] animate-float" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Show Onboarding if no profiles OR if user is explicitly adding a new one */}
        {(!activeProfile || isAddingNewProfile) ? (
          <div className="flex-1 flex flex-col">
             {profiles.length > 0 && (
               <div className="absolute top-4 left-4 z-50">
                 <button onClick={() => setIsAddingNewProfile(false)} className="text-white/50 hover:text-white text-sm">
                   &larr; Cancel
                 </button>
               </div>
             )}
            <Onboarding onComplete={handleOnboardingComplete} isLoading={isLoading} />
          </div>
        ) : (
          <>
            <Header 
              currentProfile={activeProfile}
              allProfiles={profiles}
              onSwitchProfile={handleSwitchProfile}
              onAddProfile={handleAddNewProfile}
              onNavigate={setCurrentView}
              currentView={currentView}
            />
            
            <main className="flex-1 pt-20 pb-6 overflow-y-auto no-scrollbar">
              {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white/60">Updating your plan...</p>
                 </div>
              ) : (
                <>
                  {activePlan && currentView === 'dashboard' && (
                    <Dashboard 
                      plan={activePlan} 
                      profile={activeProfile} 
                      onUpdateProgress={handlePlanUpdate}
                    />
                  )}
                  {currentView === 'profile' && (
                    <ProfileSettings 
                      profile={activeProfile} 
                      onUpdateProfile={handleUpdateProfile}
                      onResetApp={handleResetApp}
                    />
                  )}
                </>
              )}
            </main>
            
            {activePlan && (
              <ChatAssistant 
                currentPlan={activePlan} 
                onPlanUpdate={handlePlanUpdate} 
                profileName={activeProfile.name}
              />
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-float {
          animation: float 10s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;