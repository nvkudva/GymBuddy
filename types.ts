import { Type } from "@google/genai";

export enum FitnessGoal {
  MUSCLE_BUILDING = 'Muscle Building',
  WEIGHT_LOSS = 'Weight Loss',
  FITNESS = 'General Fitness',
  RUNNING = 'Running/Endurance',
  FLEXIBILITY = 'Flexibility/Yoga'
}

export interface UserProfile {
  id: string; // Unique identifier for multi-profile support
  age: number;
  height: number; // in cm
  weight: number; // in kg
  goal: FitnessGoal;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string; // e.g., "15kg" or "Bodyweight"
  rest: string; // e.g., "60s"
  muscle: string; // e.g., "Chest"
  notes: string;
  isCompleted: boolean;
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  weeklyRoutine: DayPlan[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isToolCall?: boolean;
}

// Schema for plan generation
export const ExerciseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    sets: { type: Type.STRING },
    reps: { type: Type.STRING },
    weight: { type: Type.STRING, description: "Suggested weight (e.g., '10kg' or 'Bodyweight')" },
    rest: { type: Type.STRING, description: "Rest time in seconds (e.g., '60s')" },
    muscle: { type: Type.STRING, description: "Primary muscle group targeted" },
    notes: { type: Type.STRING, description: "Brief tip for form" }
  },
  required: ["name", "sets", "reps", "weight", "rest", "muscle", "notes"]
};

export const DayPlanSchema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING, description: "e.g., Monday" },
    focus: { type: Type.STRING, description: "e.g., Chest & Triceps" },
    exercises: {
      type: Type.ARRAY,
      items: ExerciseSchema
    }
  },
  required: ["day", "focus", "exercises"]
};

export const WeeklyPlanSchema = {
  type: Type.ARRAY,
  items: DayPlanSchema
};