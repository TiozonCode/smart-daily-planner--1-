import Groq from "groq-sdk";

let ai: Groq | null = null;

export function getAI(): Groq | null {
  if (ai) return ai;
  const api_key = process.env.GROQ_API_KEY;
  if (api_key) {
    try {
      ai = new Groq({ apiKey: api_key });
      console.log("Groq client successfully initialized.");
    } catch (e) {
      console.error("Failed to initialize Groq. AI features will fallback to deterministic generation.", e);
    }
  } else {
    console.log("No GROQ_API_KEY found in env. AI prioritzation will run on simulated scheduling algorithm.");
  }
  return ai;
}
