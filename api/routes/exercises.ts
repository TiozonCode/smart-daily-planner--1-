import { Router } from "express";
import crypto from "crypto";
import { readDB, writeDB } from "../lib/db";
import { getAI } from "../lib/ai";

const router = Router();

router.get("/exercises", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });

  const db = readDB();
  if (!db.exercises) db.exercises = [];
  const userExercises = db.exercises.filter((ex) => ex.userId === token);
  res.json(userExercises);
});

router.post("/exercises", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { name, category, duration, calories, intensity, weight, reps, sets, distance, notes, date, completed, movements } = req.body;
  if (!name) return res.status(400).json({ error: "Exercise name must be provided" });

  const db = readDB();
  if (!db.exercises) db.exercises = [];

  const newExercise = {
    id: crypto.randomUUID(),
    userId: token,
    name,
    category: category || "strength",
    duration: parseInt(duration) || 0,
    calories: parseInt(calories) || 0,
    intensity: intensity || "medium",
    weight: parseFloat(weight) || 0,
    reps: parseInt(reps) || 0,
    sets: parseInt(sets) || 0,
    distance: parseFloat(distance) || 0,
    notes: notes || "",
    movements: Array.isArray(movements) ? movements : [],
    date: date || new Date().toISOString().split("T")[0],
    completed: completed !== undefined ? completed : true,
    createdAt: new Date().toISOString(),
  };

  db.exercises.push(newExercise);
  writeDB(db);

  res.json(newExercise);
});

router.patch("/exercises/:id", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { id } = req.params;
  const db = readDB();
  if (!db.exercises) db.exercises = [];

  const exerciseIndex = db.exercises.findIndex((e) => e.id === id && e.userId === token);
  if (exerciseIndex === -1) return res.status(404).json({ error: "Exercise log not found" });

  const existing = db.exercises[exerciseIndex];
  const updated = {
    ...existing,
    ...req.body,
    duration: req.body.duration !== undefined ? (parseInt(req.body.duration) || 0) : existing.duration,
    calories: req.body.calories !== undefined ? (parseInt(req.body.calories) || 0) : existing.calories,
    weight: req.body.weight !== undefined ? (parseFloat(req.body.weight) || 0) : existing.weight,
    reps: req.body.reps !== undefined ? (parseInt(req.body.reps) || 0) : existing.reps,
    sets: req.body.sets !== undefined ? (parseInt(req.body.sets) || 0) : existing.sets,
    distance: req.body.distance !== undefined ? (parseFloat(req.body.distance) || 0) : existing.distance,
    movements: req.body.movements !== undefined ? req.body.movements : existing.movements,
  };

  db.exercises[exerciseIndex] = updated;
  writeDB(db);

  res.json(updated);
});

router.delete("/exercises/:id", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { id } = req.params;
  const db = readDB();
  if (!db.exercises) db.exercises = [];

  const initialLength = db.exercises.length;
  db.exercises = db.exercises.filter((e) => !(e.id === id && e.userId === token));

  if (db.exercises.length === initialLength) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  writeDB(db);
  res.json({ success: true, message: "Exercise log removed successfully" });
});

router.post("/exercises/recommend", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const db = readDB();
  const userName = db.users[token]?.name || "Fitness Enthusiast";
  const tasks = db.tasks.filter((t) => t.userId === token && !t.completed);
  const totalEffort = tasks.reduce((sum, t) => sum + (t.estimatedEffort || 0), 0);

  const promptText = `
    You are an advanced AI Fitness Coach integrated into a Smart Daily Planner.
    Please analyze this user's current planner details and generate a highly personalized daily workout routine recommendation customized dynamically to their workload:
    
    User Active Workload statistics:
    - User Name: ${userName}
    - Total Incomplete Tasks: ${tasks.length}
    - Estimated Cognitive/Work effort today: ${totalEffort} minutes
    
    Please prescribe a daily exercise program. If their work effort is extremely heavy (> 120 mins), provide an active recovery stretch or yoga flow to relieve physical stress. If their cognitive load is light (< 45 mins), offer a highly energetic, challenging strength or cardio session.
    
    Provide your response strictly in the following JSON format:
    {
      "workoutName": "string representing the title of the workout routine",
      "category": "strength" or "cardio" or "flexibility" or "endurance",
      "recommendedDuration": number in minutes,
      "intensity": "low" or "medium" or "high",
      "estimatedCalories": number of expected burned energy,
      "exercisesList": [
        { "name": "exercise name", "sets": number, "reps": number, "notes": "execution coaching cues" }
      ],
      "coachingTips": "brief paragraph detailing how this physical stimulus synergizes with their daily tasks, e.g. helping destress or boosting brain power"
    }
  `;

  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "You are the advanced smart AI Physical Therapist & Athletic coach. Return a strict JSON response containing a workout that matches the current planner fatigue and cognitive stress parameters." },
          { role: "user", content: promptText }
        ],
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        return res.json(JSON.parse(text.trim()));
      }
    } catch (err) {
      console.error("Groq Workout Gen fell back to rule-engine", err);
    }
  }

  let recommendedWorkout;
  if (totalEffort > 120) {
    recommendedWorkout = {
      workoutName: "Mental Decompression Flow",
      category: "flexibility",
      recommendedDuration: 25,
      intensity: "low",
      estimatedCalories: 95,
      exercisesList: [
        { name: "Child's Pose Deep Breathing", sets: 1, reps: 5, notes: "Hold for 5 deep diaphragmatic breaths." },
        { name: "Cat-Cow Spinal Flexion", sets: 3, reps: 10, notes: "Synchronize inhalation with spinal arching." },
        { name: "Hamstring Static Stretch", sets: 2, reps: 30, notes: "Hold for 30s per leg to release desk posture tightness." },
        { name: "Supine Spinal Twist", sets: 2, reps: 8, notes: "Relieve lumbar stiffness from prolonged sitting." },
      ],
      coachingTips: `Your planner details a high cognitive workload today (${totalEffort} minutes). This low-intensity stretching sequence is scientifically curated to stimulate the parasympathetic nervous system, lowering cortisol and reversing bad desk physical postures.`,
    };
  } else if (totalEffort > 50) {
    recommendedWorkout = {
      workoutName: "Brain Boosting Oxygen Jog",
      category: "cardio",
      recommendedDuration: 30,
      intensity: "medium",
      estimatedCalories: 260,
      exercisesList: [
        { name: "Dynamic Warmup Knee Hugs", sets: 1, reps: 10, notes: "Warm up hips and fire up hamstrings." },
        { name: "Steady Pace Heart-Rate Run", sets: 1, reps: 1, notes: "Jog consistently keeping heart rate around 130 bpm." },
        { name: "Post-Run Quad Stretch", sets: 2, reps: 20, notes: "Hold walls for stability, stretching thigh muscles." },
      ],
      coachingTips: `With a moderate schedule planner workload of ${totalEffort} minutes, a quick cardio run will pump clean oxygen-rich red blood to your prefrontal cortex, enhancing tomorrow's concentration and memory retention.`,
    };
  } else {
    recommendedWorkout = {
      workoutName: "Desk Warrior Core & Strength Catalyst",
      category: "strength",
      recommendedDuration: 35,
      intensity: "high",
      estimatedCalories: 330,
      exercisesList: [
        { name: "Goblet Squats", sets: 4, reps: 12, notes: "Keep weight in heels and chest elevated." },
        { name: "Push Ups", sets: 3, reps: 15, notes: "Engage core, driving elbow pits forward." },
        { name: "Reverse Lunges", sets: 3, reps: 10, notes: "Stepping backwards control torso alignment." },
        { name: "Plank Hold Stability", sets: 3, reps: 45, notes: "Isometric plank hold, contract glutes tight." },
      ],
      coachingTips: `Your planner workload is quite light today! An intense full-body muscular conditioning circuit will increase total growth factors (BDNF), triggering massive focus and neural energy.`,
    };
  }

  res.json(recommendedWorkout);
});

export default router;
