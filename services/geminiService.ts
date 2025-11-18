import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { WeeklyPlanSchema, UserProfile, WorkoutPlan, DayPlan } from "../types";
import { v4 as uuidv4 } from 'uuid';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInitialPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const ai = getAI();
  
  // Optimized prompt for speed and detail
  const prompt = `
    Generate a weekly workout plan for:
    ${profile.name}, ${profile.age}y, ${profile.height}cm, ${profile.weight}kg.
    Goal: ${profile.goal}.

    Requirements:
    1. 7 days (Mon-Sun). Include Rest days.
    2. 4-5 exercises per workout.
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
    You are AuraFit, an elite AI personal trainer. 
    Current Plan: ${JSON.stringify(currentPlan.weeklyRoutine.map(d => ({ day: d.day, focus: d.focus })))}
    
    If the user asks to modify the plan (e.g. "change to 3 days", "too hard"), use the 'updateWorkoutPlan' tool.
    Keep responses short and motivating.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [updatePlanTool] }],
    }
  });
};