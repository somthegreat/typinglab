import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
            { role: "system", content: SYSTEM_PROMPT },
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
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
