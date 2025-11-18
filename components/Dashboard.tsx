
import React, { useState } from 'react';
import { WorkoutPlan, DayPlan, UserProfile } from '../types';
import { GlassCard, GlassBadge } from './ui/GlassCard';
import { Calendar, CheckCircle2, Trophy, Clock, Activity, TrendingUp, Dumbbell, Timer, Layers, PlayCircle, X, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  plan: WorkoutPlan;
  profile: UserProfile;
  onUpdateProgress: (updatedPlan: WorkoutPlan) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, profile, onUpdateProgress }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const initialDayIndex = Math.max(0, days.indexOf(todayName));
  const [activeDayIndex, setActiveDayIndex] = useState(initialDayIndex);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const activeDayPlan = plan.weeklyRoutine.find(d => d.day === days[activeDayIndex]) || { day: days[activeDayIndex], focus: 'Rest Day', exercises: [] };

  const toggleExercise = (e: React.MouseEvent, exerciseId: string) => {
    // Prevent opening the modal when clicking the check button
    e.stopPropagation();
    
    const newRoutine = plan.weeklyRoutine.map(day => {
      if (day.day !== days[activeDayIndex]) return day;
      return {
        ...day,
        exercises: day.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const newState = !ex.isCompleted;
            if (newState) {
               confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#6366f1', '#a855f7', '#ec4899']
              });
            }
            return { ...ex, isCompleted: newState };
          }
          return ex;
        })
      };
    });
    onUpdateProgress({ weeklyRoutine: newRoutine });
  };

  const openVideo = (exerciseName: string) => {
    setSelectedVideo(exerciseName);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const calculateCompletion = (day: DayPlan) => {
    if (!day.exercises.length) return 0;
    const completed = day.exercises.filter(e => e.isCompleted).length;
    return Math.round((completed / day.exercises.length) * 100);
  };

  const activeCompletion = calculateCompletion(activeDayPlan);
  
  // Calculate estimated duration (rough approx: 5 mins per exercise)
  const estDuration = activeDayPlan.exercises.length * 6; 
  const totalSets = activeDayPlan.exercises.reduce((acc, ex) => acc + parseInt(ex.sets || '0'), 0);

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Hi, {profile.name.split(' ')[0]}</h1>
          <p className="text-gray-500 dark:text-white/50 text-sm flex items-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-500" /> {profile.goal}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Weekly Selector (Compact on mobile) */}
        <div className="lg:col-span-4 space-y-4">
           {/* Added padding (p-2) to container to prevent ring cropping on active items */}
           <div className="flex lg:flex-col overflow-x-auto p-2 gap-3 no-scrollbar">
             {days.map((day, idx) => {
               const dayPlan = plan.weeklyRoutine.find(d => d.day === day);
               const isRest = !dayPlan?.exercises.length;
               const isActive = idx === activeDayIndex;
               const completion = dayPlan ? calculateCompletion(dayPlan) : 0;
               
               // Shorten day names for mobile, full for desktop
               const dayDisplay = day.substring(0, 3);

               return (
                 <GlassCard 
                    key={day}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`
                      cursor-pointer transition-all duration-200 min-w-[80px] lg:min-w-0 group relative
                      ${isActive 
                        ? 'ring-2 ring-purple-500 bg-purple-100 dark:bg-white/15 transform scale-[1.02] z-10' 
                        : 'hover:bg-gray-100 dark:hover:bg-white/10 border-transparent'
                      }
                    `}
                 >
                   <div className="p-3 flex flex-col lg:flex-row items-center lg:justify-between gap-2">
                      <div className="text-center lg:text-left">
                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-purple-600 dark:text-purple-300' : 'text-gray-400 dark:text-white/40'}`}>{dayDisplay}</div>
                        <div className="text-gray-900 dark:text-white font-medium text-xs lg:text-sm truncate max-w-[80px] lg:max-w-[150px] hidden lg:block">
                            {dayPlan?.focus || "Rest"}
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full mx-auto lg:hidden ${isRest ? 'bg-gray-300 dark:bg-white/10' : isActive ? 'bg-purple-400' : 'bg-gray-300 dark:bg-white/40'}`} />
                      </div>
                      
                      {!isRest && (
                        <div className="hidden lg:block">
                            {completion === 100 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                            ) : (
                                <div className="text-xs text-gray-400 dark:text-white/40 font-mono">{completion}%</div>
                            )}
                        </div>
                      )}
                   </div>
                 </GlassCard>
               );
             })}
           </div>
        </div>

        {/* Right Column: Workout Details */}
        <div className="lg:col-span-8">
          
          {/* Workout Summary Header */}
          {!activeDayPlan.exercises.length ? (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recovery Mode</h3>
              <p className="text-gray-600 dark:text-white/60 max-w-md text-sm mb-8">
                Muscles grow during rest, not just training. Take this time to recover for {days[(activeDayIndex + 1) % 7]}.
              </p>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <GlassCard className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"><Clock className="w-5 h-5"/></div>
                      <div>
                          <div className="text-xs text-gray-500 dark:text-white/50 uppercase">Duration</div>
                          <div className="text-gray-900 dark:text-white font-bold">{estDuration} min</div>
                      </div>
                  </GlassCard>
                  <GlassCard className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300"><Layers className="w-5 h-5"/></div>
                      <div>
                          <div className="text-xs text-gray-500 dark:text-white/50 uppercase">Volume</div>
                          <div className="text-gray-900 dark:text-white font-bold">{totalSets} Sets</div>
                      </div>
                  </GlassCard>
                   <GlassCard className="p-4 flex items-center gap-3 hidden md:flex">
                      <div className="p-2 rounded-lg bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300"><Activity className="w-5 h-5"/></div>
                      <div>
                          <div className="text-xs text-gray-500 dark:text-white/50 uppercase">Focus</div>
                          <div className="text-gray-900 dark:text-white font-bold truncate max-w-[100px]">{activeDayPlan.focus}</div>
                      </div>
                  </GlassCard>
              </div>

              <div className="space-y-4 pb-24 lg:pb-0">
                {activeDayPlan.exercises.map((exercise, idx) => (
                  <GlassCard 
                    key={exercise.id} 
                    onClick={() => openVideo(exercise.name)}
                    className={`group transition-all duration-300 cursor-pointer relative overflow-hidden
                      ${exercise.isCompleted 
                        ? 'opacity-60 bg-gray-200 dark:bg-black/20' 
                        : 'hover:bg-white dark:hover:bg-white/15 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10'
                      }
                    `}
                  >
                    <div className="p-5">
                       {/* Header: Name + Checkbox */}
                       <div className="flex items-start gap-4 mb-5">
                            <button 
                                onClick={(e) => toggleExercise(e, exercise.id)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 z-20 relative
                                ${exercise.isCompleted 
                                    ? 'bg-green-500 border-green-500 scale-105' 
                                    : 'border-gray-300 dark:border-white/20 hover:border-purple-400 bg-transparent hover:scale-110'
                                }`}
                            >
                                {exercise.isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                            </button>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-lg font-bold leading-tight ${exercise.isCompleted ? 'text-gray-400 dark:text-white/50 line-through' : 'text-gray-900 dark:text-white'}`}>
                                        {exercise.name}
                                    </h3>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                       <PlayCircle className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                                    </div>
                                </div>
                                {exercise.muscle && (
                                    <div className="mt-2">
                                        <GlassBadge color="blue">{exercise.muscle}</GlassBadge>
                                    </div>
                                )}
                            </div>
                       </div>

                       {/* Grid Stats: Responsive 2x2 grid on mobile, 4x1 on desktop */}
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 bg-gray-100 dark:bg-black/20 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                           <div className="text-center">
                               <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase mb-1 tracking-wider">Sets</div>
                               <div className="text-gray-900 dark:text-white font-mono font-bold text-sm whitespace-nowrap">{exercise.sets}</div>
                           </div>
                           <div className="text-center">
                               <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase mb-1 tracking-wider">Reps</div>
                               <div className="text-gray-900 dark:text-white font-mono font-bold text-sm whitespace-nowrap">{exercise.reps}</div>
                           </div>
                           <div className="text-center min-w-0">
                               <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase mb-1 tracking-wider">Weight</div>
                               <div className="text-gray-900 dark:text-white font-mono font-bold text-sm whitespace-nowrap truncate px-1">{exercise.weight || '-'}</div>
                           </div>
                            <div className="text-center">
                               <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase mb-1 tracking-wider">Rest</div>
                               <div className="text-gray-900 dark:text-white font-mono font-bold text-sm text-pink-500 dark:text-pink-400 whitespace-nowrap">{exercise.rest || '60s'}</div>
                           </div>
                       </div>

                       {/* Footer: Notes */}
                       {exercise.notes && (
                           <div className="mt-4 text-xs text-gray-500 dark:text-white/40 italic">
                               <span>{exercise.notes}</span>
                           </div>
                       )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeVideo}>
            <div className="w-full max-w-3xl bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h3 className="text-white font-semibold truncate flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-purple-400" />
                        {selectedVideo}
                    </h3>
                    <button onClick={closeVideo} className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="relative pt-[56.25%] bg-black">
                    <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent("How to do " + selectedVideo + " exercise")}&autoplay=1&mute=1`}
                        title={selectedVideo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="p-3 bg-white/5 flex justify-center border-t border-white/10">
                     <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedVideo + " exercise tutorial")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/50 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        Video not loading? Watch on YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
