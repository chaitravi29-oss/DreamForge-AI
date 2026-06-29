import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded GenAI client to handle missing keys gracefully on startup
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Highly customized offline fallback roadmap generator when API quota is exhausted
function generateOfflineRoadmap(goal: string, difficulty: string, timeframe: string) {
  const goalLower = goal.toLowerCase();
  let category = "Skill Acquisition";
  let mentorName = "Sage Zenith";
  let mentorPersonality = "An exceptionally supportive, multi-disciplinary expert specializing in accelerated skill acquisition and deliberate practice.";
  let skills = [
    { name: "Deliberate Practice", description: "Engaging in structured, focused exercises slightly above your current comfort level." },
    { name: "Metacognitive Reflection", description: "Evaluating your own learning process, identifying errors, and adjusting methods." },
    { name: "Stamina & Routine Building", description: "Developing a robust, resilient habit loop to maintain continuous momentum." }
  ];
  let milestones: any[] = [];
  let recommendations = [
    "Select a dedicated, distraction-free environment for your daily practice blocks.",
    "Break down your goal into micro-habits that take less than 10 minutes to complete.",
    "Record your practice sessions to evaluate alignment and track visual/auditory progress."
  ];

  // 1. Technology, Programming, Web Development category
  if (
    goalLower.includes("code") || 
    goalLower.includes("program") || 
    goalLower.includes("learn") && (
      goalLower.includes("react") || 
      goalLower.includes("vue") || 
      goalLower.includes("js") || 
      goalLower.includes("python") || 
      goalLower.includes("ts") || 
      goalLower.includes("typescript") || 
      goalLower.includes("developer") || 
      goalLower.includes("web") || 
      goalLower.includes("software") || 
      goalLower.includes("java") || 
      goalLower.includes("c++") || 
      goalLower.includes("rust") || 
      goalLower.includes("html") || 
      goalLower.includes("css") || 
      goalLower.includes("backend") || 
      goalLower.includes("frontend") || 
      goalLower.includes("fullstack")
    )
  ) {
    category = "Technology";
    mentorName = "Ada Byte";
    mentorPersonality = "A brilliant software engineer and systems architect who breaks down complex technical stacks into beautiful, bite-sized components.";
    skills = [
      { name: "Technical Syntax & Logic", description: `Understanding and writing precise, error-free structures for ${goal}.` },
      { name: "System Architecture", description: "Designing scalable, efficient systems and understanding how different modules communicate." },
      { name: "Debugging & Problem Solving", description: "Reading error traces, isolating bugs, and using developer tools effectively." }
    ];
    recommendations = [
      `Set up a pristine development workspace and install all recommended plugins for ${goal}.`,
      "Build tiny, throwaway prototypes for every new concept you learn to build muscle memory.",
      "Read official documentation and explore open-source code repositories to study clean patterns."
    ];
    milestones = [
      {
        id: "m1",
        title: "Foundation & Core Syntax",
        description: `Mastering the essential building blocks, logic, and fundamental vocabulary of ${goal}.`,
        targetWeek: 1,
        tasks: [
          { id: "t1_1", text: "Read the official getting started documentation and write 3 basic scripts/programs.", timeframe: "daily" },
          { id: "t1_2", text: "Complete 5 interactive practice exercises or basic syntax drills.", timeframe: "weekly" },
          { id: "t1_3", text: "Summarize core syntax rules and set up an organized directory for all project files.", timeframe: "monthly" }
        ]
      },
      {
        id: "m2",
        title: "Intermediate Concepts & Module Integration",
        description: `Connecting components, managing state/data flow, and structural organization for ${goal}.`,
        targetWeek: 3,
        tasks: [
          { id: "t2_1", text: "Write modular functions/modules and document them clearly.", timeframe: "daily" },
          { id: "t2_2", text: "Build a small, functional applet or utility from scratch containing at least 3 parts.", timeframe: "weekly" },
          { id: "t2_3", text: "Perform a code review of your own code, refactoring nested logic into clean helpers.", timeframe: "monthly" }
        ]
      },
      {
        id: "m3",
        title: "Advanced Capabilities & Real-World Simulation",
        description: "Optimizing performance, handling asynchronous events, and error resilience.",
        targetWeek: 5,
        tasks: [
          { id: "t3_1", text: "Optimize a previously built module for speed, readability, or file size.", timeframe: "daily" },
          { id: "t3_2", text: "Integrate an external module or database, managing latency and potential network failures.", timeframe: "weekly" },
          { id: "t3_3", text: "Deploy your solution or package it into a clean, distributable format.", timeframe: "monthly" }
        ]
      },
      {
        id: "m4",
        title: "Capstone Craftsmanship & Mastery",
        description: `Polishing a robust portfolio piece, implementing robust error handling, and calibrating your system.`,
        targetWeek: 8,
        tasks: [
          { id: "t4_1", text: "Conduct strict stress-tests on your project and document all edge cases.", timeframe: "daily" },
          { id: "t4_2", text: "Draft comprehensive readme/usage guidelines and publish the final repository.", timeframe: "weekly" },
          { id: "t4_3", text: "Calibrate your ultimate mastery score and map out your next target goal.", timeframe: "monthly" }
        ]
      }
    ];
  } 
  // 2. Fitness, Running, Athletics, Gym category
  else if (
    goalLower.includes("run") || 
    goalLower.includes("marathon") || 
    goalLower.includes("fitness") || 
    goalLower.includes("gym") || 
    goalLower.includes("weight") || 
    goalLower.includes("lose") || 
    goalLower.includes("muscle") || 
    goalLower.includes("body") || 
    goalLower.includes("health") || 
    goalLower.includes("sport") || 
    goalLower.includes("workout") || 
    goalLower.includes("diet") || 
    goalLower.includes("cardio") || 
    goalLower.includes("yoga") || 
    goalLower.includes("swim")
  ) {
    category = "Fitness & Athletics";
    mentorName = "Coach Marcus";
    mentorPersonality = "A highly supportive yet uncompromising elite athletic coach focusing on form, endurance, and mental toughness.";
    skills = [
      { name: "Aerobic/Physical Stamina", description: "Gradually conditioning the cardiorespiratory and muscular systems for high output." },
      { name: "Movement Precision & Form", description: "Performing movements with flawless technique to prevent injury and optimize energy." },
      { name: "Nutritional Calibration", description: "Fueling the body with correct macros, hydration, and timing to accelerate recovery." }
    ];
    recommendations = [
      "Purchase a high-fidelity hydration tracker and monitor daily electrolyte levels.",
      "Perform a 10-minute dynamic warmup prior to starting any physical work.",
      "Schedule exactly 8 hours of sleep per night to allow muscle fiber and neural restoration."
    ];
    milestones = [
      {
        id: "m1",
        title: "Baseline Calibration & Technique",
        description: "Establishing physical baselines and mastering injury-free execution form.",
        targetWeek: 1,
        tasks: [
          { id: "t1_1", text: "Execute 20 minutes of dynamic movement, tracking heart rate ranges.", timeframe: "daily" },
          { id: "t1_2", text: "Complete 3 specialized strength or core conditioning sessions.", timeframe: "weekly" },
          { id: "t1_3", text: "Log your body metrics, baseline endurance, and set concrete performance targets.", timeframe: "monthly" }
        ]
      },
      {
        id: "m2",
        title: "Progressive Volume & Stamina Building",
        description: "Gradually increasing physical stress and volume to trigger positive adaptation.",
        targetWeek: 3,
        tasks: [
          { id: "t2_1", text: "Perform a core skill drill and complete a dedicated hydration checklist.", timeframe: "daily" },
          { id: "t2_2", text: "Execute a long-form steady-state endurance session, progressively increasing distance/time.", timeframe: "weekly" },
          { id: "t2_3", text: "Conduct a nutritional audit to verify adequate protein intake and recovery metrics.", timeframe: "monthly" }
        ]
      },
      {
        id: "m3",
        title: "Intensity Spike & Peak Conditioning",
        description: "Introducing targeted high-intensity drills and threshold stimulation.",
        targetWeek: 5,
        tasks: [
          { id: "t3_1", text: "Execute 10 minutes of targeted high-intensity mobility/stretching.", timeframe: "daily" },
          { id: "t3_2", text: "Complete an advanced interval workout or threshold simulation session.", timeframe: "weekly" },
          { id: "t3_3", text: "Perform a full-body recovery audit, evaluating sleep hygiene and joint metrics.", timeframe: "monthly" }
        ]
      },
      {
        id: "m4",
        title: "Tapering & Peak Performance Execution",
        description: "Restoring maximum physical resources to execute the ultimate goal performance.",
        targetWeek: 8,
        tasks: [
          { id: "t4_1", text: "Log 15 minutes of quiet mental visualization of the final objective.", timeframe: "daily" },
          { id: "t4_2", text: "Execute the ultimate performance test (full distance run, main workout, or competition trial).", timeframe: "weekly" },
          { id: "t4_3", text: "Review performance metrics and establish your next athletic peak milestone.", timeframe: "monthly" }
        ]
      }
    ];
  } 
  // 3. Creative, Music, Arts, Painting category
  else if (
    goalLower.includes("music") || 
    goalLower.includes("piano") || 
    goalLower.includes("guitar") || 
    goalLower.includes("sing") || 
    goalLower.includes("draw") || 
    goalLower.includes("paint") || 
    goalLower.includes("art") || 
    goalLower.includes("write") || 
    goalLower.includes("creative") || 
    goalLower.includes("design") || 
    goalLower.includes("photo") || 
    goalLower.includes("video")
  ) {
    category = "Creative Arts & Expression";
    mentorName = "Aria Sterling";
    mentorPersonality = "An inspiring, deeply perceptive creative director and award-winning artist who nurtures original voice alongside rigorous technical mastery.";
    skills = [
      { name: "Technical Motor Skill", description: "Building precise mechanical coordination and muscle memory required for the medium." },
      { name: "Theoretical Frameworks", description: "Understanding the underlying rules of composition, color, scales, or structure." },
      { name: "Aesthetic Originality", description: "Developing an authentic style, emotional delivery, and creative composition skills." }
    ];
    recommendations = [
      "Prepare a dedicated creative space with all instruments, materials, or digital tablets ready for use.",
      "Spend 10 minutes observing or listening to masterworks in your field to calibrate your taste.",
      "Embrace small imperfections during active practice; focus purely on flow and expression."
    ];
    milestones = [
      {
        id: "m1",
        title: "Rudiments & Dexterity Drills",
        description: "Building the physical habits, scale drills, or sketch exercises that form the foundation.",
        targetWeek: 1,
        tasks: [
          { id: "t1_1", text: "Practice core mechanical drills (scales, line drawing, or writing prompts) for 15 minutes.", timeframe: "daily" },
          { id: "t1_2", text: "Study one masterwork, analyzing its technical composition, contrast, or progression.", timeframe: "weekly" },
          { id: "t1_3", text: "Clean and reorganize your creative toolkit or set up a digital folder organization structure.", timeframe: "monthly" }
        ]
      },
      {
        id: "m2",
        title: "Integration & Phrase Crafting",
        description: "Assembling individual notes, lines, or paragraphs into logical, short creative phrases.",
        targetWeek: 3,
        tasks: [
          { id: "t2_1", text: "Review key mechanical transitions and practice a challenging motor drill.", timeframe: "daily" },
          { id: "t2_2", text: "Produce a complete short-form piece (a sketch, a 4-bar melody, or a 500-word scene).", timeframe: "weekly" },
          { id: "t2_3", text: "Log a recorded performance or a photo of your work to evaluate alignment metrics.", timeframe: "monthly" }
        ]
      },
      {
        id: "m3",
        title: "Dynamic Range & Complex Textures",
        description: "Introducing advanced techniques, shading, tempo alterations, or literary devices.",
        targetWeek: 5,
        tasks: [
          { id: "t3_1", text: "Practice expressive delivery (dynamics, pressure, or word choice drills) for 10 minutes.", timeframe: "daily" },
          { id: "t3_2", text: "Create a substantial work containing at least 3 distinct sections or layers of detail.", timeframe: "weekly" },
          { id: "t3_3", text: "Gather peer feedback on your current drafts and isolate 2 specific areas to refine.", timeframe: "monthly" }
        ]
      },
      {
        id: "m4",
        title: "The Showcase & Creative Portfolio Piece",
        description: "Polishing your work to a professional standard and presenting it to an audience.",
        targetWeek: 8,
        tasks: [
          { id: "t4_1", text: "Conduct a final polish or final mix/render of your masterpiece.", timeframe: "daily" },
          { id: "t4_2", text: "Share your finished piece with an audience, community, or digital archive.", timeframe: "weekly" },
          { id: "t4_3", text: "Conduct a reflective self-critique and establish your next creative horizon.", timeframe: "monthly" }
        ]
      }
    ];
  } 
  // 4. Business, Startups, Marketing category
  else if (
    goalLower.includes("startup") || 
    goalLower.includes("business") || 
    goalLower.includes("sell") || 
    goalLower.includes("marketing") || 
    goalLower.includes("money") || 
    goalLower.includes("financial") || 
    goalLower.includes("invest") || 
    goalLower.includes("entrepreneur") || 
    goalLower.includes("product") || 
    goalLower.includes("audience")
  ) {
    category = "Business & Entrepreneurship";
    mentorName = "Vance Sterling";
    mentorPersonality = "A razor-sharp venture builder and veteran strategist who values hard metrics, customer validation, and bold execution.";
    skills = [
      { name: "Market Validation", description: "Validating user demand and conducting quantitative competitor analysis." },
      { name: "Systems & Funnels", description: "Designing repeatable pathways to acquire, convert, and retain high-value leads." },
      { name: "Financial / Metric Literacy", description: "Tracking unit economics, pricing models, cash flow, and key performance indicators." }
    ];
    recommendations = [
      "Create a simple spreadsheet to track your metrics, costs, and customer validation milestones.",
      "Conduct 3 short customer research interviews to understand user paintpoints firsthand.",
      "Write a one-sentence value proposition that clearly states what problem you solve and for whom."
    ];
    milestones = [
      {
        id: "m1",
        title: "Problem Identification & Market Research",
        description: "Validating the existence of a painful problem and mapping out competitors.",
        targetWeek: 1,
        tasks: [
          { id: "t1_1", text: "Scan 3 competitor forums or reviews to list their top customer complaints.", timeframe: "daily" },
          { id: "t1_2", text: "Draft and distribute a validation survey to at least 15 target users.", timeframe: "weekly" },
          { id: "t1_3", text: "Summarize your market findings in a clean one-page strategy brief.", timeframe: "monthly" }
        ]
      },
      {
        id: "m2",
        title: "Minimum Viable Solution & Offer Pitch",
        description: "Structuring a low-cost representation of your offer and pitching it to early users.",
        targetWeek: 3,
        tasks: [
          { id: "t2_1", text: "Reach out to 2 target customers directly to share your value proposition.", timeframe: "daily" },
          { id: "t2_2", text: "Build a basic landing page, presentation deck, or physical sample demonstrating the solution.", timeframe: "weekly" },
          { id: "t2_3", text: "Calculate your pricing model and itemize all anticipated startup unit costs.", timeframe: "monthly" }
        ]
      },
      {
        id: "m3",
        title: "Acquisition & Conversion Testing",
        description: "Testing organic or paid marketing channels to acquire early conversions or leads.",
        targetWeek: 5,
        tasks: [
          { id: "t3_1", text: "Publish 1 piece of high-value educational or promotional content about your solution.", timeframe: "daily" },
          { id: "t3_2", text: "Secure your first official sign-up, preorder, or structured feedback commitment.", timeframe: "weekly" },
          { id: "t3_3", text: "Review your marketing analytics, isolating which channels produced the highest engagement.", timeframe: "monthly" }
        ]
      },
      {
        id: "m4",
        title: "Operational Launch & Delivery Mastery",
        description: "Formally launching your offering and gathering deep feedback to optimize delivery.",
        targetWeek: 8,
        tasks: [
          { id: "t4_1", text: "Check in with active leads or customers to resolve any blockers or friction.", timeframe: "daily" },
          { id: "t4_2", text: "Successfully deliver your initial product batch or complete early consulting/coaching runs.", timeframe: "weekly" },
          { id: "t4_3", text: "Calculate net revenue metrics and draft an optimization plan for next month.", timeframe: "monthly" }
        ]
      }
    ];
  } 
  // 5. Default / General Skill Acquisition
  else {
    category = "Skill Acquisition";
    mentorName = "Sage Zenith";
    mentorPersonality = "An exceptionally supportive, multi-disciplinary expert specializing in accelerated skill acquisition and deliberate practice.";
    skills = [
      { name: "Deliberate Practice", description: "Engaging in structured, focused exercises slightly above your current comfort level." },
      { name: "Metacognitive Reflection", description: "Evaluating your own learning process, identifying errors, and adjusting methods." },
      { name: "Stamina & Routine Building", description: "Developing a robust, resilient habit loop to maintain continuous momentum." }
    ];
    recommendations = [
      "Select a dedicated, distraction-free environment for your daily practice blocks.",
      "Break down your goal into micro-habits that take less than 10 minutes to complete.",
      "Record your practice sessions to evaluate alignment and track visual/auditory progress."
    ];
    milestones = [
      {
        id: "m1",
        title: "Core Deconstruction & Foundations",
        description: `Breaking down ${goal} into sub-skills and mastering the absolute basics.`,
        targetWeek: 1,
        tasks: [
          { id: "t1_1", text: "Perform 15 minutes of foundational study or active drills.", timeframe: "daily" },
          { id: "t1_2", text: "Deconstruct your target skill into 4 distinct components and map resources for them.", timeframe: "weekly" },
          { id: "t1_3", text: "Set up a clean learning environment and log your starting level metrics.", timeframe: "monthly" }
        ]
      },
      {
        id: "m2",
        title: "Guided Integration & Practice Loops",
        description: "Connecting sub-skills and performing basic integrations under self-evaluation.",
        targetWeek: 3,
        tasks: [
          { id: "t2_1", text: "Review yesterday's notes and complete one core practice drill.", timeframe: "daily" },
          { id: "t2_2", text: "Build a complete mini-exercise or intermediate application combining 2 sub-skills.", timeframe: "weekly" },
          { id: "t2_3", text: "Conduct a practice reflection audit, isolating which techniques are causing friction.", timeframe: "monthly" }
        ]
      },
      {
        id: "m3",
        title: "Self-Correction & Performance Speed",
        description: "Removing crutches/guides and practicing at a faster, more natural tempo.",
        targetWeek: 5,
        tasks: [
          { id: "t3_1", text: "Isolate and drill your weakest sub-skill for 10 minutes.", timeframe: "daily" },
          { id: "t3_2", text: "Execute a full-length simulated trial or perform a project demo entirely from memory.", timeframe: "weekly" },
          { id: "t3_3", text: "Gather feedback from an external source or cross-reference against professional standards.", timeframe: "monthly" }
        ]
      },
      {
        id: "m4",
        title: "Capstone Achievement & Mastery Forge",
        description: "Executing the target performance at a high standard and celebrating certification.",
        targetWeek: 8,
        tasks: [
          { id: "t4_1", text: "Polish the final parameters of your work or complete a strict warmup routine.", timeframe: "daily" },
          { id: "t4_2", text: "Execute the ultimate milestone trial or showcase your polished project publicly.", timeframe: "weekly" },
          { id: "t4_3", text: "Reflect on your growth journey and write a roadmap for your next big milestone.", timeframe: "monthly" }
        ]
      }
    ];
  }

  // Adjust targetWeek based on timeframe parsing if possible
  const weeksMatch = timeframe.match(/(\d+)\s*week/i);
  if (weeksMatch) {
    const totalWeeks = parseInt(weeksMatch[1], 10);
    if (!isNaN(totalWeeks) && totalWeeks >= 4) {
      milestones[0].targetWeek = 1;
      milestones[1].targetWeek = Math.max(2, Math.floor(totalWeeks * 0.3));
      milestones[2].targetWeek = Math.max(3, Math.floor(totalWeeks * 0.6));
      milestones[3].targetWeek = totalWeeks;
    }
  }

  return {
    goalName: goal,
    category,
    description: `A beautifully forged, highly structured guide designed to transform you from a beginner into a master at: "${goal}". This offline fallback roadmap is optimized for your selected difficulty (${difficulty}) and timeframe (${timeframe}).`,
    difficulty,
    estimatedTime: timeframe,
    skillsToAcquire: skills,
    milestones,
    mentorName,
    mentorPersonality,
    initialRecommendations: recommendations
  };
}

// API endpoint for generating highly detailed roadmaps
app.post("/api/generate-roadmap", async (req, res) => {
  const { goal, difficulty, timeframe } = req.body;
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  try {
    const ai = getGenAI();
    const prompt = `Analyze the goal: "${goal}". 
Create a highly personalized, structured step-by-step roadmap for a user who wants to achieve this.
The user selected their desired difficulty: "${difficulty || 'Beginner'}" and desired timeframe: "${timeframe || '8 weeks'}".
Divide the roadmap into 4-6 chronological major Milestones. Each Milestone must have 3-5 specific, actionable, and granular tasks (categorized as either "daily", "weekly", or "monthly" tasks).
Also, identify the top 3 critical skills to acquire, name a tailored AI Mentor character (matching the category of the goal, e.g., coding, design, fitness, entrepreneurship), and provide 3 smart recommendations to start.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goalName: { type: Type.STRING, description: "The formalized goal name." },
            category: { type: Type.STRING, description: "Category like 'Technology', 'Fitness', 'Business', 'Design', 'Academics', 'Music', etc." },
            description: { type: Type.STRING, description: "A high-level encouraging overview of the journey." },
            difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced." },
            estimatedTime: { type: Type.STRING, description: "Estimated completion timeline." },
            skillsToAcquire: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique identifier like 'm1', 'm2'." },
                  title: { type: Type.STRING, description: "A concise, motivating title for the milestone." },
                  description: { type: Type.STRING, description: "What this milestone achieves." },
                  targetWeek: { type: Type.INTEGER, description: "Estimated week number to achieve this." },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "Unique task id like 't1', 't2', etc." },
                        text: { type: Type.STRING, description: "Actionable, specific task to complete." },
                        timeframe: { type: Type.STRING, description: "Must be 'daily', 'weekly', or 'monthly'." }
                      },
                      required: ["id", "text", "timeframe"]
                    }
                  }
                },
                required: ["id", "title", "description", "targetWeek", "tasks"]
              }
            },
            mentorName: { type: Type.STRING, description: "Tailored AI Mentor name, matching the category." },
            mentorPersonality: { type: Type.STRING, description: "Brief description of the mentor's personality, tone, and expertise." },
            initialRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable smart recommendations to set up the environment or take the first step."
            }
          },
          required: [
            "goalName", "category", "description", "difficulty", "estimatedTime", 
            "skillsToAcquire", "milestones", "mentorName", "mentorPersonality", "initialRecommendations"
          ]
        }
      }
    });

    const roadmapData = JSON.parse(response.text?.trim() || "{}");
    res.json(roadmapData);
  } catch (error: any) {
    console.log("[Fallback System] Roadmap requested. Serving pre-curated template.");
    const fallbackRoadmap = generateOfflineRoadmap(goal, difficulty || 'Beginner', timeframe || '8 weeks');
    res.json(fallbackRoadmap);
  }
});

// API endpoint for mentor conversation
app.post("/api/mentor-chat", async (req, res) => {
  try {
    const { goalName, mentorName, mentorPersonality, messages, currentProgress, roadmap } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const ai = getGenAI();
    let roadmapContext = "";
    if (roadmap && roadmap.milestones) {
      roadmapContext = `\n\nActive Roadmap:\n`;
      roadmap.milestones.forEach((m: any, idx: number) => {
        roadmapContext += `Milestone ${idx + 1}: ${m.title} (Target Week ${m.targetWeek}) - ${m.isCompleted ? 'Completed' : 'In Progress'}\n`;
        roadmapContext += `  Description: ${m.description}\n`;
        if (m.tasks) {
          m.tasks.forEach((t: any) => {
            roadmapContext += `  - [${t.isCompleted ? 'x' : ' '}] ${t.text} (${t.timeframe})\n`;
          });
        }
      });
    }

    const systemInstruction = `You are ${mentorName || "your DreamForge AI Mentor"}. 
Your personality: ${mentorPersonality || "A highly encouraging, strategic, and experienced personal coach."}
Your user is working towards this goal: "${goalName || "Achievement of their dream"}".
Their current overall roadmap progress is: ${currentProgress || 0}%.${roadmapContext}
Support the user, answer their questions, suggest resources or tactics, and guide them with deep, high-value, domain-specific insights.
Keep your responses relatively concise, structured, encouraging, and highly actionable. Refuse to talk about unrelated topics if they stray too far, but tie everything back to helping them forge their dream. Use simple formatting with bullet points.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.log("[Fallback System] Mentor chat requested. Serving offline dialogue.");
    res.json({ 
      text: "I am currently meditating on your parameters and calibrating your next high-value study block. Let's focus on completing today's core tasks to keep your consistent streak alive!" 
    });
  }
});

// Check if Gemini API is configured
app.get("/api/config-check", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ hasKey });
});

// API endpoint for generating AI motivation quotes contextually
app.post("/api/generate-quote", async (req, res) => {
  try {
    const { goalName } = req.body;
    const ai = getGenAI();
    const prompt = `Generate a single highly inspiring, contextually relevant motivational quote for a person pursuing the goal: "${goalName || 'unleashing their potential and forging their dreams'}". 
Keep it highly specific to the theme of the goal (e.g. if it is coding, relate to builders; if running, relate to stamina). 
Return the output as a clean JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The inspirational quote text." },
            author: { type: Type.STRING, description: "The author of the quote (real or a fitting expert persona)." }
          },
          required: ["text", "author"]
        }
      }
    });

    const quoteData = JSON.parse(response.text?.trim() || "{}");
    res.json(quoteData);
  } catch (error: any) {
    console.log("[Fallback System] Quote requested. Serving offline quote.");
    res.json({
      text: "The forge does not test the steel for its weakness, but to reveal its ultimate, unbreakable potential.",
      author: "Master Smith of DreamForge"
    });
  }
});

// API endpoint for generating high-fidelity daily action plans
app.post("/api/daily-action-plan", async (req, res) => {
  try {
    const { goalName, difficulty, timeframe } = req.body;
    if (!goalName) {
      return res.status(400).json({ error: "Goal name is required" });
    }

    const ai = getGenAI();
    const prompt = `Create a highly tactical, motivating hour-by-hour daily action plan tailored to a user pursuing this goal: "${goalName}" at "${difficulty || 'Beginner'}" difficulty over a timeline of "${timeframe || '8 weeks'}". 
The plan should cover 4 core focus blocks or rituals for the day, detailing concrete activities they should perform to build consistency. 
Return the output as a JSON object containing an array of plan blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "Time slot or day part, e.g., '07:30 AM', 'Midday Focus', 'Evening Review'." },
                  title: { type: Type.STRING, description: "A crisp, motivating title of the task." },
                  description: { type: Type.STRING, description: "Actionable details on what to study, build, or practice." },
                  duration: { type: Type.STRING, description: "Estimated duration, e.g., '30 mins', '1 hour'." }
                },
                required: ["time", "title", "description", "duration"]
              }
            }
          },
          required: ["plan"]
        }
      }
    });

    const planData = JSON.parse(response.text?.trim() || "{}");
    res.json(planData);
  } catch (error: any) {
    console.log("[Fallback System] Daily action plan requested. Serving offline plan.");
    res.json({
      plan: [
        { time: "Morning Ritual", title: "Core Mental Warmup", description: "Review your active milestone objectives and map out your top priority for today's study block.", duration: "15 mins" },
        { time: "Deep Work Focus", title: "Core Skill Drills", description: "Dedicate uninterrupted block to hands-on practice, coding, writing, or active exercise specified in your current week.", duration: "60 mins" },
        { time: "Reflective Learning", title: "Concept Reinforcement", description: "Read recommended resources, research difficult concepts encountered, or summarize your findings.", duration: "30 mins" },
        { time: "Evening Check-in", title: "Forge Log Update", description: "Mark today's subtasks as completed, log your earned score points, and prepare tomorrow's schedule.", duration: "10 mins" }
      ]
    });
  }
});

// API endpoint for generating best YouTube videos, online courses, books, articles, and practice websites for a goal
app.post("/api/recommend-resources", async (req, res) => {
  try {
    const { goalName, category, difficulty } = req.body;
    if (!goalName) {
      return res.status(400).json({ error: "Goal name is required" });
    }

    const ai = getGenAI();
    const prompt = `You are a world-class educational curator. Based on the user's goal: "${goalName}" (Category: "${category || 'General'}", Difficulty: "${difficulty || 'Beginner'}"), recommend the absolute best learning resources available on the internet.
You must provide exactly:
- 2 YouTube Videos or Channels (e.g. specific channels or famous tutorial videos)
- 2 Online Courses (from Coursera, Udemy, edX, or free ones)
- 2 Books (classic or modern high-quality books)
- 2 Articles or Documentation resources (e.g. MDN web docs, famous blog posts, medium articles)
- 2 Practice Websites or Interactive Tools (e.g. LeetCode, GitHub, Duolingo, Codecademy, Kaggle, etc. where they can practice hands-on)

Make the titles, creator/platform names, and descriptions highly specific and genuine. For URLs, output high-fidelity, real URLs (like "https://youtube.com", "https://coursera.org", etc., or direct search/topic links). Do not use placeholders for URLs.
Provide concise description detailing why this resource is an absolute must-have for achieving "${goalName}".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique identifier, e.g. 'res_yt_1', 'res_course_1', etc." },
                  type: { type: Type.STRING, description: "Must be exactly one of: 'video', 'course', 'book', 'article', 'website'." },
                  title: { type: Type.STRING, description: "Title of the video, course, book, article, or practice website." },
                  url: { type: Type.STRING, description: "The actual website URL or a targeted search link on the correct domain." },
                  description: { type: Type.STRING, description: "Brief description of the resource and why it's recommended." },
                  durationOrLength: { type: Type.STRING, description: "Estimated completion time, duration, or page count, e.g. '15 mins read', '10 hours video', '350 pages'." },
                  creatorOrPlatform: { type: Type.STRING, description: "Platform name or creator, e.g. 'Coursera / Google', 'Web Dev Simplified', 'O'Reilly Media', 'LeetCode'." }
                },
                required: ["id", "type", "title", "url", "description", "durationOrLength", "creatorOrPlatform"]
              }
            }
          },
          required: ["resources"]
        }
      }
    });

    const resourcesData = JSON.parse(response.text?.trim() || "{}");
    res.json(resourcesData);
  } catch (error: any) {
    console.log("[Fallback System] Resource recommendations requested. Serving offline list.");
    res.json({
      resources: [
        {
          id: "fallback_1",
          type: "video",
          title: "Introduction & Fundamentals Video Course",
          url: "https://youtube.com",
          description: "A highly-rated introductory session detailing core principles and standard roadmaps for beginner to intermediate builders.",
          durationOrLength: "45 mins",
          creatorOrPlatform: "FreeCodeCamp on YouTube"
        },
        {
          id: "fallback_2",
          type: "course",
          title: "Comprehensive Complete Masterclass",
          url: "https://coursera.org",
          description: "Interactive structure with high-fidelity assignments and community feedback, perfect for professional calibration.",
          durationOrLength: "15 hours",
          creatorOrPlatform: "Coursera"
        },
        {
          id: "fallback_3",
          type: "book",
          title: "Atomic Habits",
          url: "https://books.google.com",
          description: "The definitive guide to building consistent daily habits and rituals, unlocking peak focus and compounding growth.",
          durationOrLength: "320 pages",
          creatorOrPlatform: "James Clear"
        },
        {
          id: "fallback_4",
          type: "article",
          title: "The Ultimate Getting Started Guide",
          url: "https://medium.com",
          description: "Step-by-step breakdown of common pitfalls, expert setups, and resources to accelerate your skill acquisition journey.",
          durationOrLength: "10 mins read",
          creatorOrPlatform: "Medium"
        },
        {
          id: "fallback_5",
          type: "website",
          title: "Interactive Hands-On Practice Labs",
          url: "https://github.com",
          description: "Real-world exercises, code repositories, and sandboxed challenges designed to solidify your practical proficiency.",
          durationOrLength: "Self-paced",
          creatorOrPlatform: "GitHub & Practice Platforms"
        }
      ]
    });
  }
});

// Configure Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
