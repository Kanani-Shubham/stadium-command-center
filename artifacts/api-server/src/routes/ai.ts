import { Router, type IRouter } from "express";
import {
  AiCopilotChatBody,
  AiCrowdAnalysisBody,
  AiNavigationBody,
  AiTranslateBody,
  AiTransportationRecommendationBody,
  AiIncidentPriorityBody,
} from "@workspace/api-zod";
import { chatCompletion, requireGroq, GROQ_MODEL } from "../lib/groq";
import { aiRateLimiter } from "../lib/rateLimiter";

const router: IRouter = Router();

router.post("/ai/copilot", aiRateLimiter, async (req, res): Promise<void> => {
  const parsed = AiCopilotChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const client = requireGroq();
    const { message, history } = parsed.data;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `You are StadiumSense AI Copilot, an expert AI assistant for FIFA World Cup 2026 stadium operations.
You help stadium operators with crowd management, safety protocols, logistics, and real-time decision support.
Answer concisely and professionally. Use specific, actionable language.
You have access to information about all stadium sections, gates, transportation, and emergency protocols.
Match Phase context: be aware of pre-match, in-progress, half-time, and post-match operational demands.
Always prioritize fan safety first, then operational efficiency.`,
      },
    ];

    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 800,
      messages,
    });

    const reply = completion.choices[0]?.message?.content ?? "No response generated.";
    const tokensUsed = completion.usage?.total_tokens ?? 0;

    res.json({ reply, tokensUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "AI copilot error");
    res.status(500).json({ error: message });
  }
});

router.post("/ai/crowd-analysis", aiRateLimiter, async (req, res): Promise<void> => {
  const parsed = AiCrowdAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { gates, matchPhase } = parsed.data;
    const criticalGates = gates.filter((g) => g.density >= 0.85);
    const avgDensity = gates.reduce((s, g) => s + g.density, 0) / gates.length;
    const maxWait = Math.max(...gates.map((g) => g.waitMinutes));

    const gatesSummary = gates
      .map((g) => `${g.gateId}: ${Math.round(g.density * 100)}% full, ${g.waitMinutes}min wait`)
      .join("; ");

    const prompt = `You are a crowd safety AI for a FIFA World Cup 2026 stadium.

Current match phase: ${matchPhase}
Gate conditions: ${gatesSummary}
Critical gates (>85%): ${criticalGates.map((g) => g.gateId).join(", ") || "none"}
Average density: ${Math.round(avgDensity * 100)}%
Maximum wait time: ${maxWait} minutes

Provide a JSON response with:
- "prediction": 2-3 sentence crowd flow prediction for next 15 minutes
- "recommendations": array of 3-5 specific, actionable operator recommendations
- "riskLevel": one of "low", "medium", "high", "critical"
- "summary": one sentence executive summary

Respond ONLY with valid JSON, no markdown.`;

    const raw = await chatCompletion(
      "You are a crowd safety AI. Always respond with valid JSON only.",
      prompt,
      600,
    );

    let parsed2: {
      prediction: string;
      recommendations: string[];
      riskLevel: "low" | "medium" | "high" | "critical";
      summary: string;
    };

    try {
      parsed2 = JSON.parse(raw);
    } catch {
      parsed2 = {
        prediction: raw.slice(0, 300),
        recommendations: ["Monitor gate conditions closely", "Prepare overflow management teams"],
        riskLevel: avgDensity > 0.85 ? "critical" : avgDensity > 0.7 ? "high" : avgDensity > 0.5 ? "medium" : "low",
        summary: "AI analysis complete — review gate conditions.",
      };
    }

    res.json(parsed2);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "Crowd analysis error");
    res.status(500).json({ error: message });
  }
});

router.post("/ai/navigation", aiRateLimiter, async (req, res): Promise<void> => {
  const parsed = AiNavigationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { query, currentLocation, language } = parsed.data;

    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", es: "Spanish", fr: "French", ar: "Arabic", pt: "Portuguese",
    };
    const targetLang = langMap[language ?? "en"] ?? "English";

    const prompt = `You are a FIFA World Cup 2026 stadium navigation assistant.

Stadium layout:
- North Stand: Gates N1, N2 — nearest exits, restrooms at sections N3-N8, food court F-North
- South Stand: Gates S1, S2 — nearest exits, restrooms at sections S3-S8, food court F-South, medical station M-South  
- East Stand: Gates E1, E2 — nearest exits, restrooms at E3-E6, concession stands C-East
- West Stand: Gates W1, W2 — nearest exits, restrooms at W3-W8, food court F-West, VIP lounge, medical station M-West
- General: 4 medical points (M-North, M-South, M-East, M-West), 16 restroom clusters, 8 food courts, 3 ATMs (ATM-N, ATM-S, ATM-W), lost & found at Gate S1
- Accessibility: Accessible restrooms at every stand, accessible seating at sections A1-A4

Fan query: "${query}"
Current location: ${currentLocation ?? "unknown"}
Response language: ${targetLang}

Provide a JSON response:
- "answer": helpful navigation answer in ${targetLang}
- "nearestLocation": name of the recommended nearest facility (or null)
- "estimatedWalkMinutes": estimated walk time in minutes (or null)
- "directions": array of 2-4 step-by-step walking directions in ${targetLang}

Respond ONLY with valid JSON, no markdown.`;

    const raw = await chatCompletion(
      "You are a stadium navigation assistant. Respond with valid JSON only.",
      prompt,
      500,
    );

    let result: { answer: string; nearestLocation: string | null; estimatedWalkMinutes: number | null; directions: string[] };
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        answer: raw.slice(0, 400),
        nearestLocation: null,
        estimatedWalkMinutes: null,
        directions: [],
      };
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "Navigation AI error");
    res.status(500).json({ error: message });
  }
});

router.post("/ai/translate", aiRateLimiter, async (req, res): Promise<void> => {
  const parsed = AiTranslateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { text, targetLanguage, sourceLanguage } = parsed.data;

    const langNames: Record<string, string> = {
      en: "English", hi: "Hindi", es: "Spanish", fr: "French", ar: "Arabic", pt: "Portuguese",
    };
    const targetName = langNames[targetLanguage] ?? targetLanguage;
    const sourceName = sourceLanguage ? (langNames[sourceLanguage] ?? sourceLanguage) : "auto-detected";

    const prompt = `You are a multilingual assistant for FIFA World Cup 2026 fans.

Translate the following text to ${targetName} (source: ${sourceName}).
If the text is already a question about the stadium, also provide a helpful answer in ${targetName}.

Text to translate: "${text}"

Respond with ONLY a JSON object:
- "translatedText": the translation in ${targetName}
- "detectedSourceLanguage": detected source language code (en/hi/es/fr/ar/pt), or null if unclear

Respond ONLY with valid JSON, no markdown.`;

    const raw = await chatCompletion(
      "You are a multilingual translator. Respond with valid JSON only.",
      prompt,
      400,
    );

    let result: { translatedText: string; detectedSourceLanguage: string | null };
    try {
      result = JSON.parse(raw);
    } catch {
      result = { translatedText: raw.slice(0, 500), detectedSourceLanguage: null };
    }

    res.json({ ...result, targetLanguage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "Translation AI error");
    res.status(500).json({ error: message });
  }
});

router.post("/ai/transportation-recommendation", aiRateLimiter, async (req, res): Promise<void> => {
  const parsed = AiTransportationRecommendationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { transportModes, sustainabilityMetrics, attendanceCount, matchPhase } = parsed.data;

    const transportSummary = transportModes
      .map((m) => `${m.mode}: ${Math.round((m.currentLoad / m.capacity) * 100)}% capacity, peak in ${m.predictedPeakMinutes}min`)
      .join("; ");

    const sustainSummary = sustainabilityMetrics
      .map((m) => `${m.name}: ${m.value}${m.unit} vs target ${m.target}${m.unit}`)
      .join("; ");

    const prompt = `You are a transportation and sustainability AI advisor for FIFA World Cup 2026.

Attendance: ${attendanceCount.toLocaleString()} fans
Match phase: ${matchPhase}
Transport status: ${transportSummary}
Sustainability: ${sustainSummary}

Provide a JSON response:
- "recommendation": 2-3 sentence primary recommendation for operators
- "urgentActions": array of 2-4 specific immediate actions to take
- "sustainabilitySummary": one sentence on sustainability goal progress
- "overallStatus": "normal", "advisory", "warning", or "critical"

Respond ONLY with valid JSON, no markdown.`;

    const raw = await chatCompletion(
      "You are a transportation advisor. Respond with valid JSON only.",
      prompt,
      500,
    );

    let result: { recommendation: string; urgentActions: string[]; sustainabilitySummary: string; overallStatus: "normal" | "advisory" | "warning" | "critical" };
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        recommendation: raw.slice(0, 300),
        urgentActions: ["Monitor transport load levels"],
        sustainabilitySummary: "Sustainability metrics under review.",
        overallStatus: "advisory",
      };
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "Transportation AI error");
    res.status(500).json({ error: message });
  }
});

router.post("/ai/incident-priority", aiRateLimiter, async (req, res): Promise<void> => {
  const parsed = AiIncidentPriorityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { location, description, severity } = parsed.data;

    const prompt = `You are an emergency response AI for FIFA World Cup 2026 stadium operations.

Incident report:
- Location: ${location}
- Description: ${description}
- Reported severity: ${severity}

Stadium response resources:
- P1 (Immediate): Fire brigade, medical emergency team, security command — response in 2-3 min
- P2 (Urgent): Medical first aid, security rapid response — response in 5-8 min  
- P3 (Standard): Steward response, maintenance team — response in 10-15 min
- P4 (Routine): Customer service, information desk — response in 20+ min

Provide a JSON response:
- "suggestedPriority": "P1", "P2", "P3", or "P4"
- "priorityLabel": brief label for this priority (e.g. "Immediate Emergency Response")
- "nearestResponse": name of the nearest appropriate response unit
- "recommendation": 2-3 sentence specific action recommendation for the operator
- "estimatedResponseMinutes": realistic estimated minutes until response team arrives

Respond ONLY with valid JSON, no markdown.`;

    const raw = await chatCompletion(
      "You are an emergency response coordinator. Respond with valid JSON only.",
      prompt,
      400,
    );

    let result: { suggestedPriority: "P1" | "P2" | "P3" | "P4"; priorityLabel: string; nearestResponse: string; recommendation: string; estimatedResponseMinutes: number };
    try {
      result = JSON.parse(raw);
    } catch {
      const priorityMap: Record<string, "P1" | "P2" | "P3" | "P4"> = {
        critical: "P1", high: "P2", medium: "P3", low: "P4",
      };
      result = {
        suggestedPriority: priorityMap[severity] ?? "P3",
        priorityLabel: severity === "critical" ? "Immediate Emergency" : "Standard Response",
        nearestResponse: "Nearest response unit",
        recommendation: raw.slice(0, 300),
        estimatedResponseMinutes: severity === "critical" ? 3 : severity === "high" ? 7 : 12,
      };
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    req.log.error({ err }, "Incident priority AI error");
    res.status(500).json({ error: message });
  }
});

export default router;
