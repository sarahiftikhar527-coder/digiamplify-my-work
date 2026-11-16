
import ApiError from "../../utils/ApiError.js";
import { getConversation, getMessages } from "./chat.service.js";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODEL = "gemini-3.8-flash";

const RATE_LIMIT_PER_MINUTE = 30;
const REQUEST_TIMEOUT_MS = 20_000;

const MODES = new Set(["fix", "tone", "reply", "write"]);

const TONES = {
  professional:
    "professional, polite and confident (suitable for a manager or a client)",
  friendly:
    "warm, friendly and casual (like talking to a good colleague)",
  short:
    "very short and direct (one short sentence if possible)",
  detailed:
    "more detailed and complete, explaining the point clearly (2 to 4 sentences)",
};

// ---------------------------------------------------------------------------
// Simple per-user rate limit
// ---------------------------------------------------------------------------

const hits = new Map();

function checkRateLimit(userId) {
  const now = Date.now();

  const recent = (hits.get(userId) || []).filter(
    (time) => now - time < 60_000
  );

  if (recent.length >= RATE_LIMIT_PER_MINUTE) {
    throw new ApiError(
      429,
      "Too many AI requests. Please wait a moment."
    );
  }

  recent.push(now);
  hits.set(userId, recent);
}

// ---------------------------------------------------------------------------
// Basic local text fix (used only when no AI key is configured)
// ---------------------------------------------------------------------------

const WORD_FIXES = {
  plz: "please",
  pls: "please",
  thx: "thanks",
  thanx: "thanks",
  u: "you",
  ur: "your",
  r: "are",
  tmrw: "tomorrow",
  tomorow: "tomorrow",
  tmr: "tomorrow",
  msg: "message",
  dont: "don't",
  cant: "can't",
  wont: "won't",
  didnt: "didn't",
  doesnt: "doesn't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  im: "I'm",
  ive: "I've",
  recieve: "receive",
  definately: "definitely",
  seperate: "separate",
  adress: "address",
  becuase: "because",
  wich: "which",
};

const QUESTION_STARTERS =
  /^(what|when|where|why|how|who|whom|whose|which|can|could|would|will|do|does|did|is|are|am|may|should|shall|have|has)\b/i;

function basicFix(text) {
  let out = String(text || "").replace(/\s+/g, " ").trim();

  if (!out) return "";

  out = out.replace(/\s+([,.!?;:])/g, "$1");
  out = out.replace(/([,;!?])(?=[A-Za-z])/g, "$1 ");

  out = out.replace(/[A-Za-z]+/g, (word) => {
    const fixed = WORD_FIXES[word.toLowerCase()];
    return fixed === undefined ? word : fixed;
  });

  out = out.replace(
    /(^|[^A-Za-z0-9'’])i(?=$|[^A-Za-z0-9])/g,
    "$1I"
  );

  out = out.replace(
    /(^|[.!?]\s+)([a-z])/g,
    (_match, lead, letter) => lead + letter.toUpperCase()
  );

  if (/[A-Za-z0-9]$/.test(out)) {
    const lastSentence = out.split(/[.!?]\s+/).pop();
    const lastClause = lastSentence.split(/,\s*/).pop();

    const isQuestion =
      QUESTION_STARTERS.test(lastSentence) ||
      QUESTION_STARTERS.test(lastClause);

    out += isQuestion ? "?" : ".";
  }

  return out;
}

// ---------------------------------------------------------------------------
// Prompt building
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a writing assistant built into a company's internal team chat.
You help the user write chat messages that are clear, natural and ready to send.

Your most important skill is truly understanding MEANING, not matching keywords.
Read what the other person actually said and what the user actually wants to say.
Examples of understanding meaning:
- "I need a bonus" is a REQUEST for a bonus. It is not a reason to congratulate anyone.
- Only congratulate when someone has really received good news or achieved something.
- Do not apologise unless something went wrong. Do not thank unless something was given.

Always reply with valid JSON only, nothing else.`;

const GENERAL_RULES = `RULES:
1. Keep the user's intention and stance. Never flip the meaning (do not turn a request into an offer, or a refusal into agreement).
2. Never invent facts: no amounts, dates, approvals, completed work, payments or promises that are not in the conversation or in the user's text.
3. Write like a real chat message: 1 to 3 sentences, natural and human. No greeting or signature unless the user's text already has one.
4. No emojis, except at most one in a friendly tone.
5. Do not repeat the other person's message back as if the user wrote it.
6. Write in English unless the other person's recent messages are clearly in another language; in that case match that language.
7. The user's text may be rough: broken English, one word, or Roman Urdu / Urdu mixed with English. Understand it, then write clean, correct output.
8. The options must be clearly different from each other.
9. Do not add labels, explanations, headings or quotation marks around the messages.`;

function formatTranscript(history) {
  if (!history.length) return "(no previous messages)";

  return history
    .map((item) => `${item.name}: ${item.text}`)
    .join("\n");
}

function buildTask({
  mode,
  tone,
  draft,
  instruction,
  lastIncoming,
}) {
  if (mode === "fix") {
    return `Correct the spelling, grammar, punctuation and capitalization of the user's draft WITHOUT changing its meaning and without adding new information.

USER DRAFT: "${draft}"

Give exactly 3 options:
1. Only the smallest corrections needed.
2. Same meaning, but smoother and clearer.
3. Same meaning, polished and professional.`;
  }

  if (mode === "tone") {
    const description = TONES[tone] || TONES.professional;

    return `Rewrite the user's draft in a ${description} tone. Keep the same meaning and add no new facts.

USER DRAFT: "${draft}"

Give exactly 3 different versions.`;
  }

  if (mode === "write") {
    return `Write a chat message that does exactly what the user asks below. Use the conversation only for context (names, topic). Do not add details the user did not give.

USER REQUEST: "${instruction}"
${draft ? `CURRENT DRAFT (optional context): "${draft}"` : ""}

Give exactly 3 different ready-to-send versions.`;
  }

  // mode === "reply"
  if (draft) {
    return `The user wants to reply to the latest message from ${lastIncoming?.name || "the other person"}:
"${lastIncoming?.text || "(none)"}"

The user's rough note about what they want to say is: "${draft}"

First understand the note. It may be one word, broken English, or Roman Urdu. Then write 3 complete, ready-to-send replies that say exactly what the note means, fitted naturally to the message being replied to.

Examples:
- Latest message "I got the client's approval!" and note "congrats" -> "Congratulations on getting the approval! Great work."
- Latest message "Please finish the report today" and note "ok" -> "Sure, I'll finish the report and send it over today."
- Latest message "Can you join the call?" and note "cant, busy" -> "Sorry, I can't join the call right now as I'm tied up."`;
  }

  return `Write 3 different replies the user could send to the latest message from ${lastIncoming?.name || "the other person"}:
"${lastIncoming?.text || "(none)"}"

First read what that message actually says or asks, then reply appropriately:
- If it asks a question, answer only if the conversation contains the answer; otherwise acknowledge and say you will check or confirm.
- If it assigns a task or sets a deadline, acknowledge it and confirm you will do it. Do not promise a different date.
- If it is good news, congratulate. If it is bad news, a warning or criticism, respond calmly and professionally.
- If it is a request, respond to the request itself.
- If it is only a greeting or thanks, reply naturally.

Make the 3 options different: one short, one a bit more detailed, and one that asks a useful follow-up question if that makes sense.`;
}

function buildPrompt(context) {
  const {
    user,
    conversation,
    history,
    other,
  } = context;

  const writer = `${user?.name || "The user"} (role: ${
    user?.role || "member"
  })`;

  const audience =
    conversation?.type === "group"
      ? `This is the group chat "${conversation.name || "Group"}".`
      : `The user is chatting directly with ${
          other?.name || "a colleague"
        }${other?.role ? ` (role: ${other.role})` : ""}.`;

  return `The writer is ${writer}.
${audience}

RECENT CONVERSATION (oldest first):
${formatTranscript(history)}

TASK:
${buildTask(context)}

${GENERAL_RULES}

OUTPUT:
Return ONLY valid JSON in exactly this shape:
{"suggestions":["First option","Second option","Third option"]}`;
}

// ---------------------------------------------------------------------------
// Gemini response parsing
// ---------------------------------------------------------------------------

function parseSuggestions(raw) {
  const cleaned = String(raw || "")
    .replace(/```json|```/gi, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) return [];

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));

    return (
      Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : []
    )
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Gemini API
// ---------------------------------------------------------------------------

async function askGemini(apiKey, prompt, temperature) {
  const model = String(
    process.env.AI_MODEL || DEFAULT_MODEL
  ).trim();

  const url = `${GEMINI_API_URL}/${encodeURIComponent(
    model
  )}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: SYSTEM_PROMPT,
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 700,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    let detail = "";

    try {
      const errorData = await response.json();
      detail =
        errorData?.error?.message ||
        JSON.stringify(errorData).slice(0, 300);
    } catch {
      try {
        detail = (await response.text()).slice(0, 300);
      } catch {
        // Ignore response parsing errors.
      }
    }

    const error = new Error(
      `Gemini request failed with status ${response.status}${
        detail ? `: ${detail}` : ""
      }`
    );

    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  const generatedText = (
    data?.candidates?.[0]?.content?.parts || []
  )
    .map((part) => part.text || "")
    .join("")
    .trim();

  if (!generatedText) {
    const finishReason =
      data?.candidates?.[0]?.finishReason || "";

    const error = new Error(
      finishReason
        ? `Gemini returned no text. Finish reason: ${finishReason}`
        : "Gemini returned an empty response."
    );

    error.status = 502;
    throw error;
  }

  return parseSuggestions(generatedText);
}

function noticeForError(error) {
  const status = Number(error?.status) || 0;

  if (status === 400) {
    return "Gemini rejected the request. Check the model name and API request settings.";
  }

  if (status === 401 || status === 403) {
    return "The Gemini API key is invalid or does not have access. Check GEMINI_API_KEY in backend/.env.";
  }

  if (status === 404) {
    return "The Gemini model was not found. Check AI_MODEL in backend/.env.";
  }

  if (status === 429) {
    return "Gemini usage limit reached or requests are too frequent. Please try again later.";
  }

  if (status === 500 || status === 502 || status === 503) {
    return "Gemini is temporarily unavailable. Please try again in a moment.";
  }

  if (
    error?.name === "TimeoutError" ||
    error?.name === "AbortError"
  ) {
    return "AI took too long to answer. Please try again.";
  }

  return "Could not get a suggestion from Gemini AI. Please try again.";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function resolveMode(data, draft, instruction, hasIncoming) {
  const requested = String(data.mode || "")
    .trim()
    .toLowerCase();

  if (MODES.has(requested)) return requested;

  // Older clients that do not send a mode.
  if (instruction) return "write";
  if (draft) return "fix";
  if (hasIncoming) return "reply";

  return "write";
}

export async function getSuggestions(data = {}, user) {
  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  const userId = String(user._id || user.id);

  checkRateLimit(userId);

  const draft = String(data.draft || "")
    .trim()
    .slice(0, 1000);

  const instruction = String(data.instruction || "")
    .trim()
    .slice(0, 500);

  const tone = String(data.tone || "")
    .trim()
    .toLowerCase();

  let conversation = null;
  let history = [];
  let lastIncoming = null;
  let other = null;

  if (data.conversationId) {
    const result = await getConversation(
      data.conversationId,
      user
    );

    conversation = result.conversation;

    other =
      (conversation.members || []).find(
        (member) => String(member.id) !== userId
      ) || null;

    const { messages } = await getMessages(
      data.conversationId,
      user
    );

    history = messages
      .filter((message) => message.text)
      .slice(-10)
      .map((message) => ({
        id: String(message.sender?.id || ""),
        name:
          String(message.sender?.id) === userId
            ? "Me"
            : message.sender?.name || "User",
        text: String(message.text).slice(0, 400),
        mine: String(message.sender?.id) === userId,
      }));

    const latest = [...history]
      .reverse()
      .find((item) => !item.mine);

    if (latest) {
      lastIncoming = {
        name: latest.name,
        text: latest.text,
      };
    }
  }

  const mode = resolveMode(
    data,
    draft,
    instruction,
    Boolean(lastIncoming)
  );

  const context = lastIncoming
    ? {
        from: lastIncoming.name,
        text: lastIncoming.text,
      }
    : null;

  const respond = (payload) => ({
    suggestions: [],
    source: "none",
    mode,
    context,
    notice: "",
    ...payload,
  });

  // Nothing to work with yet.
  if ((mode === "fix" || mode === "tone") && !draft) {
    return respond({
      notice:
        "Type your message first, then I can fix or rewrite it.",
    });
  }

  if (mode === "write" && !instruction) {
    return respond({
      notice: "Tell me what you want to write.",
    });
  }

  if (mode === "reply" && !lastIncoming && !draft) {
    return respond({
      notice:
        "There is no message from the other person to reply to yet.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // No Gemini key: only a basic local text fix can be offered.
  if (!apiKey) {
    if (mode === "fix") {
      const fixed = basicFix(draft);

      return respond({
        suggestions: fixed ? [fixed] : [],
        source: "basic",
        notice:
          "Basic fix only. Add GEMINI_API_KEY to backend/.env for smart AI suggestions.",
      });
    }

    return respond({
      notice:
        "Gemini AI is not set up yet. Add GEMINI_API_KEY to backend/.env and restart the backend.",
    });
  }

  try {
    const suggestions = await askGemini(
      apiKey,
      buildPrompt({
        mode,
        tone,
        draft,
        instruction,
        lastIncoming,
        user,
        conversation,
        history,
        other,
      }),
      mode === "fix" ? 0.3 : 0.7
    );

    if (!suggestions.length) {
      throw new Error(
        "Gemini returned no usable suggestions."
      );
    }

    return respond({
      suggestions,
      source: "ai",
    });
  } catch (error) {
    console.error(
      "[chat-ai] Gemini request failed:",
      error?.message
    );

    if (mode === "fix") {
      const fixed = basicFix(draft);

      if (fixed) {
        return respond({
          suggestions: [fixed],
          source: "basic",
          notice: noticeForError(error),
        });
      }
    }

    return respond({
      notice: noticeForError(error),
    });
  }
}
