import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // requests per window per user

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

const sanitizeStr = (s: unknown, maxLen = 80): string =>
  String(s ?? "").replace(/[\r\n<>`]/g, " ").slice(0, maxLen);
const sanitizeNum = (n: unknown): number => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

const SYSTEM_PROMPT = `You are TypeFlow Assistant — a friendly, concise AI helper embedded in a typing practice website called TypeFlow. Your job is to help users get the most out of the platform.

## What TypeFlow Offers
- **Speed Test** (/test): Timed typing tests (15s, 30s, 60s, 120s) with words, quotes, or custom text. Shows WPM, accuracy, raw WPM.
- **Lessons** (/lessons): Structured typing lessons focusing on specific key groups (home row, numbers, etc.)
- **Practice** (/practice): Focused practice mode for weak keys and custom text.
- **Race** (/race): Real-time multiplayer typing races against other users.
- **Games** (/games): Fun typing games — Speed Chase, Typing Defense, Word Rain.
- **Daily Challenge** (/challenge): A new challenge each day with XP rewards.
- **Tournaments** (/tournaments): Competitive events with leaderboards and prizes.
- **Stats** (/stats): Detailed analytics — WPM trends, accuracy charts, test history.
- **Leaderboard** (/leaderboard): Global rankings by WPM, accuracy, and XP.
- **Achievements** (/achievements): Unlock badges by hitting milestones.
- **Certificates** (/certificates): Earn certificates for reaching WPM/accuracy goals.
- **Friends** (/friends): Add friends and compare stats.
- **Chat** (/chat): Global community chat room.
- **Custom Word Lists** (/word-lists): Create and share custom word lists.
- **Reminders** (/reminders): Set practice reminders to maintain streaks.
- **Settings** (/settings): Themes, sounds, text preferences, keyboard layout, data export/import.
- **Profile** (/profile): View and edit your profile, see your level, XP, and stats.

## How to Help Users

### Improving Typing Speed
- Recommend starting with Lessons to build proper technique
- Suggest Practice mode to work on weak keys
- Encourage daily challenges for consistency
- Recommend 15s tests for sprints, 60s for building stamina

### Fixing Mistakes
- Point users to the Stats page to identify weak keys
- Suggest Practice mode focused on problem characters
- Recommend slower, deliberate practice before speed
- Tip: accuracy > speed. Master accuracy first, speed follows.

### Staying Motivated
- Mention streaks and daily challenges
- Highlight achievements they can unlock
- Suggest setting practice reminders (/reminders)
- Encourage joining races and tournaments for competition

### Setting Reminders
- Direct users to /reminders to set practice reminders
- They can choose time and days of the week
- Browser notifications must be enabled

### Navigation Help
- When users ask "where can I..." or "how do I...", provide the specific page/feature
- Use the routes listed above to guide them

## Guidelines
- Keep responses short and helpful (2-4 sentences usually)
- Use markdown for formatting when listing steps
- Be encouraging and positive about their typing journey
- If asked about something outside TypeFlow, politely redirect to typing-related help
- Never make up features that don't exist
- When suggesting pages, mention the page name (e.g., "Head to **Stats** to see your progress")`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Per-user rate limit
    const userId = String(claimsData.claims.sub || "");
    const now = Date.now();
    const entry = rateLimitMap.get(userId);
    if (entry && now - entry.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      entry.count += 1;
    } else {
      rateLimitMap.set(userId, { count: 1, windowStart: now });
    }

    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please clear the chat and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build personalized system prompt with user stats
    let systemPrompt = SYSTEM_PROMPT;
    if (userContext) {
      const parts: string[] = ["\n\n## Current User Stats"];
      if (userContext.username) parts.push(`- **Username**: ${sanitizeStr(userContext.username, 50)}`);
      if (userContext.bestWpm != null) parts.push(`- **Best WPM**: ${sanitizeNum(userContext.bestWpm)}`);
      if (userContext.bestAccuracy != null) parts.push(`- **Best Accuracy**: ${sanitizeNum(userContext.bestAccuracy)}%`);
      if (userContext.totalTests != null) parts.push(`- **Total Tests**: ${sanitizeNum(userContext.totalTests)}`);
      if (userContext.totalWords != null) parts.push(`- **Total Words Typed**: ${sanitizeNum(userContext.totalWords)}`);
      if (userContext.level != null) parts.push(`- **Level**: ${sanitizeNum(userContext.level)}`);
      if (userContext.xp != null) parts.push(`- **XP**: ${sanitizeNum(userContext.xp)}`);
      if (userContext.streak != null) parts.push(`- **Current Streak**: ${sanitizeNum(userContext.streak)} days`);
      if (userContext.skillTier) parts.push(`- **Tier**: ${sanitizeStr(userContext.skillTier, 20)}`);
      if (Array.isArray(userContext.weakKeys) && userContext.weakKeys.length > 0) {
        const safeKeys = userContext.weakKeys.slice(0, 10).map((k: any) => {
          const key = sanitizeStr(k?.key, 3) || "?";
          const rate = sanitizeNum(k?.errorRate);
          return `"${key}" (${rate}% errors)`;
        });
        parts.push(`- **Weak Keys** (highest error rate): ${safeKeys.join(", ")}`);
      }
      parts.push("\nUse these stats to give personalized advice. Reference their specific weak keys, suggest appropriate WPM targets, and acknowledge their progress.");
      systemPrompt += parts.join("\n");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service is temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
