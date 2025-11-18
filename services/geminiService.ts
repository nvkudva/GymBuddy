import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { WeeklyPlanSchema, UserProfile, WorkoutPlan, DayPlan, FitnessGoal } from "../types";
import { v4 as uuidv4 } from 'uuid';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInitialPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const ai = getAI();
  
  let goalStrategy = "";
  switch (profile.goal) {
    case FitnessGoal.MUSCLE_BUILDING:
      goalStrategy = "Focus on hypertrophy (8-12 reps) and strength. Use split routines (e.g., Push/Pull/Legs or Upper/Lower). Prioritize compound movements with progressive overload.";
      break;
    case FitnessGoal.WEIGHT_LOSS:
      goalStrategy = "Focus on high intensity, elevated heart rate, and caloric burn. Use circuit training, AMRAPs, or supersets with short rest periods. Whole body workouts recommended.";
      break;
    case FitnessGoal.RUNNING:
      goalStrategy = "Complement running with specific strength training. Focus on single-leg stability, glute activation, core strength, and injury prevention. Include active recovery.";
      break;
    case FitnessGoal.FLEXIBILITY:
      goalStrategy = "Focus on increasing range of motion and core stability. Incorporate Yoga flows, Pilates exercises, and deep stretching sessions. Low impact.";
      break;
    case FitnessGoal.FITNESS:
    default:
      goalStrategy = "Balanced mix of strength and cardiovascular health. Moderate intensity for general well-being, mobility, and longevity.";
      break;
  }

  // Optimized prompt for speed and detail
  const prompt = `
    Generate a weekly workout plan for:
    ${profile.name}, ${profile.age}y, ${profile.height}cm, ${profile.weight}kg.
    Primary Goal: ${profile.goal}.

    TRAINING STRATEGY:
    ${goalStrategy}

    Requirements:
    1. 7 days (Mon-Sun). Include appropriate Rest Days based on intensity.
    2. 4-6 exercises per workout day.
    3. Include target muscle, suggested weight (conservative start), and rest time.
    4. JSON output only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: WeeklyPlanSchema,
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Hydrate with IDs and default completed state
    const hydratedData: DayPlan[] = rawData.map((day: any) => ({
      ...day,
      exercises: day.exercises.map((ex: any) => ({
        ...ex,
        id: uuidv4(),
        isCompleted: false
      }))
    }));

    return { weeklyRoutine: hydratedData };

  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

// Function definition for the tool
const updatePlanTool: FunctionDeclaration = {
  name: 'updateWorkoutPlan',
  description: 'Updates the user\'s workout plan based on their request.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      changesDescription: {
        type: Type.STRING,
        description: "A summary of what changes are being made."
      },
      newWeeklyRoutine: WeeklyPlanSchema
    },
    required: ['changesDescription', 'newWeeklyRoutine']
  }
};

export const createChatSession = (currentPlan: WorkoutPlan) => {
  const ai = getAI();
  
  const systemInstruction = `
    You are AuraFit, an elite AI personal trainer and holistic health expert. 
    
    Your expertise is broad and includes:
    1. Gym Workouts, Technique, and Programming.
    2. Nutrition, Dieting (Macros, Meal Plans), and Weight Management.
    3. Supplements (Protein, Creatine, Vitamins, etc.).
    4. Pain Management, Mobility, and Basic Physiotherapy/Rehab tips.
    5. General Wellness, Sleep, and Stress Management.

    Current Plan Context: ${JSON.stringify(currentPlan.weeklyRoutine.map(d => ({ day: d.day, focus: d.focus })))}
    
    If the user asks to modify the *actual* workout plan (e.g. "change to 3 days", "too hard", "swap leg day"), use the 'updateWorkoutPlan' tool.
    
    For any questions about diet, pain, or supplements, provide expert, scientifically grounded advice.
    For serious medical issues or severe pain, always advise consulting a doctor.
    
    Keep responses motivating, concise, and friendly.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [updatePlanTool] }],
    }
  });
};