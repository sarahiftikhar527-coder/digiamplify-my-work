
import ApiError from "../../utils/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { getConversation, getMessages } from "./chat.service.js";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-5-5";

// ---------------------------------------------------------------------------
// Simple per-user rate limit (20 requests / minute)
// ---------------------------------------------------------------------------

const hits = new Map();

function checkRateLimit(userId) {
  const now = Date.now();

  const recent = (hits.get(userId) || []).filter(
    (time) => now - time < 60_000
  );

  if (recent.length >= 20) {
    throw new ApiError(
      429,
      "Too many AI requests. Please wait a moment."
    );
  }

  recent.push(now);
  hits.set(userId, recent);
}

// ---------------------------------------------------------------------------
// Message classification
// ---------------------------------------------------------------------------

function classifyMessage(message = "") {
  const text = String(message).toLowerCase();

  if (!text.trim()) return "general";

  // Fine, penalty, warning
  if (
    /\b(fine|fined|penalty|penalized|penalised|warning|disciplinary action)\b/i.test(
      text
    )
  ) {
    return "warning";
  }

  // Task deadlines and overdue work
  if (
    /\b(deadline|due date|last date|submit today|submission date|overdue|over due|task is due|complete.*today|finish.*today|pending task|task deadline)\b/i.test(
      text
    )
  ) {
    return "deadline";
  }

  // Termination or final working day
  if (
    /\b(last working day|last day at work|employment is ending|termination|terminated|your last day with|leaving the company)\b/i.test(
      text
    )
  ) {
    return "last_working_day";
  }

  // Congratulations and achievements
  if (
    /\b(congratulations|congrats|well done|great job|excellent work|achievement|promotion|promoted|appreciate your hard work)\b/i.test(
      text
    )
  ) {
    return "congratulations";
  }

  // Bonus and rewards
  if (
    /\b(bonus|incentive|reward|salary increase|pay raise)\b/i.test(
      text
    )
  ) {
    return "bonus";
  }

  // Task assignment
  if (
    /\b(assigned|assignment|new task|task assigned|please handle|please complete|work on this|take responsibility)\b/i.test(
      text
    )
  ) {
    return "task";
  }

  // Leave
  if (
    /\b(leave approved|leave has been approved|holiday approved|vacation approved)\b/i.test(
      text
    )
  ) {
    return "leave_approved";
  }

  if (
    /\b(leave request|request for leave|apply for leave|leave application)\b/i.test(
      text
    )
  ) {
    return "leave_request";
  }

  // Meetings
  if (
    /\b(meeting|conference|call|zoom|teams meeting|join us)\b/i.test(
      text
    )
  ) {
    return "meeting";
  }

  // Reports and documents
  if (
    /\b(report|documentation|document|spreadsheet|presentation)\b/i.test(
      text
    )
  ) {
    return "report";
  }

  // Performance feedback
  if (
    /\b(improve|improvement|poor performance|performance issue|not satisfied|mistake|incorrect|error)\b/i.test(
      text
    )
  ) {
    return "feedback";
  }

  // Birthday wishes
  if (
    /\b(happy birthday|birthday wishes|many happy returns)\b/i.test(
      text
    )
  ) {
    return "birthday";
  }

  // Thank-you messages
  if (
    /\b(thank you|thanks|appreciate your effort|appreciate your work)\b/i.test(
      text
    )
  ) {
    return "thanks";
  }

  // Questions
  if (
    /\b(can you|could you|would you|please confirm|let me know|are you available|do you)\b/i.test(
      text
    )
  ) {
    return "question";
  }

  return "general";
}

// ---------------------------------------------------------------------------
// Employee replies to admin messages
// ---------------------------------------------------------------------------

function employeeReplySuggestions(message) {
  const category = classifyMessage(message);

  switch (category) {
    case "warning":
      return [
        "I am really sorry for this mistake. It won't happen again, and I will be more careful from now on.",
        "I sincerely apologize. I understand the issue and will make sure to follow the rules properly.",
        "I apologize for the inconvenience. I will improve my punctuality and make sure this does not happen again."
      ];

    case "deadline":
      return [
        "Okay, understood! I will complete the task and submit it before the deadline.",
        "Sure! I am working on it and will make sure it is completed on time.",
        "Understood. I will prioritize this task and share the completed work today."
      ];

    case "last_working_day":
      return [
        "I understand. Could you please share the details and any necessary next steps with me?",
        "Thank you for informing me. Please let me know the handover process and any pending responsibilities.",
        "Understood. I would appreciate some clarification regarding the next steps."
      ];

    case "congratulations":
      return [
        "Thank you so much! I truly appreciate your recognition and support.",
        "Thank you! This means a lot to me. I will continue working hard and giving my best.",
        "I really appreciate your kind words. Thank you for recognizing my efforts!"
      ];

    case "bonus":
      return [
        "Thank you so much for the bonus! I truly appreciate your support and recognition.",
        "I am really grateful for this reward. Thank you for appreciating my hard work.",
        "Thank you! This motivates me to work even harder and perform better."
      ];

    case "task":
      return [
        "Sure! I have understood the task and will start working on it.",
        "Okay, I will take responsibility for this task and keep you updated on the progress.",
        "Understood. I will complete the assigned task as required."
      ];

    case "leave_approved":
      return [
        "Thank you so much for approving my leave. I really appreciate it.",
        "Thank you for the approval. I will make sure my pending work is properly managed.",
        "I appreciate your support. Thank you for approving my request."
      ];

    case "leave_request":
      return [
        "I understand. Please let me know if you need any additional information from my side.",
        "Sure, I will provide the required details. Thank you for considering my request.",
        "Thank you for your response. I will follow the leave application process."
      ];

    case "meeting":
      return [
        "Sure! I will attend the meeting at the scheduled time.",
        "Understood. Thank you for informing me. I will be there on time.",
        "Absolutely! Please share the meeting details if anything else is required."
      ];

    case "report":
      return [
        "Sure! I will prepare the report and share it with you as soon as possible.",
        "Understood. I will complete the document and submit it within the given time.",
        "Okay, I will make the necessary updates and send you the final report."
      ];

    case "feedback":
      return [
        "Thank you for your feedback. I understand and will work on improving my performance.",
        "I apologize for the mistake. I will take your feedback seriously and make sure to improve.",
        "Thank you for bringing this to my attention. I will be more careful and work on these areas."
      ];

    case "birthday":
      return [
        "Thank you so much for your lovely wishes!",
        "Thank you! I really appreciate your kind words.",
        "Thanks a lot! That means so much to me."
      ];

    case "thanks":
      return [
        "You're most welcome! I am always happy to help.",
        "My pleasure! I will continue doing my best.",
        "Thank you! I am glad I could contribute."
      ];

    case "question":
      return [
        "Sure, I will check and get back to you shortly.",
        "Of course! I will review it and share an update with you.",
        "Understood. I will confirm the details and let you know."
      ];

    default:
      return [
        "Okay, understood. I will take care of it and keep you updated.",
        "Thank you for informing me. I will follow the instructions accordingly.",
        "Noted! I will make sure to handle this properly."
      ];
  }
}

// ---------------------------------------------------------------------------
// Admin replies to employee messages
// ---------------------------------------------------------------------------

function adminReplySuggestions(message) {
  const category = classifyMessage(message);

  switch (category) {
    case "warning":
      return [
        "Thank you for acknowledging the issue. Please make sure it does not happen again.",
        "I appreciate your understanding. Kindly follow the company policies going forward.",
        "Understood. Please maintain punctuality and avoid repeating this situation."
      ];

    case "deadline":
      return [
        "Thank you for the update. Please make sure the task is completed within the deadline.",
        "Alright. Keep me informed about your progress.",
        "Please prioritize this task and share the final result once completed."
      ];

    case "congratulations":
      return [
        "You're welcome! Keep up the excellent work.",
        "You deserve it. Continue giving your best!",
        "Well done again. I look forward to seeing more great work from you."
      ];

    case "bonus":
      return [
        "You're welcome! Your hard work and dedication are appreciated.",
        "You have earned it. Keep up the good work!",
        "We appreciate your contribution to the team."
      ];

    case "task":
      return [
        "Thank you. Please keep me updated on the progress.",
        "Great. Make sure you follow the given requirements.",
        "Alright. Let me know if you need any assistance."
      ];

    case "meeting":
      return [
        "Thank you. See you at the scheduled time.",
        "Great. Please be on time.",
        "Looking forward to discussing this with you."
      ];

    case "report":
      return [
        "Thank you. Please share the report once it is ready.",
        "Alright. Make sure all the required details are included.",
        "Please double-check the information before submitting it."
      ];

    case "feedback":
      return [
        "Thank you for understanding. I look forward to seeing your improvement.",
        "I appreciate your response. Please apply the feedback in your future work.",
        "Good. Let me know if you need any guidance."
      ];

    default:
      return [
        "Thank you for the update. Please keep me informed.",
        "Understood. Let me know if you need any assistance.",
        "Alright, please proceed accordingly."
      ];
  }
}

// ---------------------------------------------------------------------------
// Suggestions when the user is composing a new message
// ---------------------------------------------------------------------------

function writingSuggestions({ text, role }) {
  const source = String(text || "").toLowerCase();
  const fromAdmin = role === ROLES.ADMIN;
  const has = (pattern) => pattern.test(source);

  if (fromAdmin) {
    if (has(/fine|fined|penalty|warning|late|attendance/)) {
      return [
        "Please ensure that you follow the company's attendance policy. Repeated violations may result in disciplinary action.",
        "This is a formal reminder to maintain punctuality and follow the office timings.",
        "Please make sure this issue does not happen again. Further violations may result in a fine."
      ];
    }

    if (has(/deadline|last date|due date|overdue/)) {
      return [
        "Please make sure this task is completed and submitted before today's deadline.",
        "Today is the final date for this task. Kindly prioritize it and share your completed work on time.",
        "Please provide an update on the task and ensure it is completed within the given deadline."
      ];
    }

    if (has(/congrat|bonus|reward|achievement|promotion/)) {
      return [
        "Congratulations on your achievement! Your hard work and dedication are truly appreciated.",
        "Great work! You have earned this recognition. Keep up the excellent performance.",
        "Congratulations! We appreciate your valuable contribution to the team."
      ];
    }

    if (has(/task|assign|project/)) {
      return [
        "A new task has been assigned to you. Please review the requirements and complete it within the given timeline.",
        "Please take responsibility for this task and keep me updated on your progress.",
        "Kindly review the assigned work and let me know if you need any clarification."
      ];
    }

    if (has(/meeting|call|schedule/)) {
      return [
        "Please attend the scheduled meeting on time.",
        "I would like to arrange a meeting to discuss our current progress. Please confirm your availability.",
        "Please join the meeting at the scheduled time."
      ];
    }

    if (has(/thank/)) {
      return [
        "Thank you for your hard work and dedication. Your efforts are appreciated.",
        "I appreciate your contribution and continued support.",
        "Thank you for being a valuable part of the team."
      ];
    }

    return [
      "Hello! I hope you are doing well. Please share an update on your current work.",
      "Thank you for your efforts. Please keep me informed about your progress.",
      "Let me know if you need any assistance or clarification."
    ];
  }

  if (has(/sorry|apolog|mistake|late|fine/)) {
    return [
      "I sincerely apologize for the mistake. I will be more careful and make sure it does not happen again.",
      "I am sorry for the inconvenience. I will take responsibility and improve from now on.",
      "I understand my mistake and will make sure to follow the instructions properly."
    ];
  }

  if (has(/deadline|task|submit|complete/)) {
    return [
      "Understood! I will complete the task within the given deadline.",
      "I am working on it and will share the completed work as soon as possible.",
      "Sure! I will prioritize this and keep you updated."
    ];
  }

  if (has(/thank/)) {
    return [
      "Thank you so much! I really appreciate your support.",
      "I am grateful for your help and guidance.",
      "Thanks a lot! I truly appreciate it."
    ];
  }

  if (has(/leave|holiday|sick|unwell/)) {
    return [
      "I would like to request leave due to a personal matter. Please let me know if any further details are required.",
      "I am not feeling well and would like to request leave for today. Thank you for understanding.",
      "I would appreciate your approval for my leave request."
    ];
  }

  if (has(/meeting|call/)) {
    return [
      "Sure, I am available. Please let me know the scheduled time.",
      "Thank you for the invitation. I will attend the meeting.",
      "Could you please share the meeting details?"
    ];
  }

  return [
    "Hello! I hope you are doing well. I wanted to discuss something with you.",
    "Thank you for the update. I will take care of it and keep you informed.",
    "I appreciate your guidance. Please let me know if anything else is required."
  ];
}

// ---------------------------------------------------------------------------
// Real AI (Claude)
// ---------------------------------------------------------------------------

function buildPrompt({
  draft,
  instruction,
  history,
  user,
  conversationType,
  replyMode
}) {
  const writerRole =
    user.role === ROLES.ADMIN
      ? "an admin/manager writing to an employee"
      : "an employee replying to an admin or writing to colleagues";

  const transcript = history.length
    ? history
        .map((item) => `${item.name}: ${item.text}`)
        .join("\n")
    : "(no previous messages)";

  let task;

  if (instruction) {
    task = `Write a message based on this instruction: "${instruction}".`;
  } else if (draft) {
    task = `The user has typed this draft: "${draft}". Give 3 improved versions that preserve the meaning.`;
  } else if (replyMode) {
    task =
      "Generate 3 natural replies to the latest message from the other person in the conversation.";
  } else {
    task =
      "Generate 3 useful, natural starter messages appropriate for this company chat.";
  }

  return `
You are an intelligent workplace chat reply assistant.

The current user is ${writerRole}.
Their role is ${user.role}.
Conversation type: ${conversationType}.

RECENT CONVERSATION:
${transcript}

CURRENT DRAFT:
${draft || "(empty)"}

USER INSTRUCTION:
${instruction || "(none)"}

TASK:
${task}

IMPORTANT RULES FOR REPLIES:

1. Always understand the latest incoming message before writing suggestions.
2. If an admin congratulates an employee, the employee must thank the admin.
3. If an admin announces a bonus, the employee must express appreciation.
4. If an admin warns about a fine, lateness, or a policy violation, the employee should apologize professionally and promise improvement.
5. If an admin says a task deadline is today, the employee should acknowledge it and confirm that they will complete it on time.
6. If an admin says a task is overdue, the employee should apologize for the delay and explain that they are working to complete it.
7. If an admin assigns a task, the employee should confirm that they understand and will complete it.
8. If an admin approves leave, the employee should thank the admin.
9. If an admin requests a meeting, the employee should confirm attendance or ask for details.
10. If an admin gives negative feedback, the employee should acknowledge the feedback and respond professionally.
11. If an admin asks a question, answer the question naturally where the conversation provides enough information.
12. Do not repeat the admin's message as though the employee wrote it.
13. Do not suggest congratulations when the employee should be apologizing or acknowledging a deadline.
14. Never invent facts, completed work, payments, approvals, dates, or promises that are not supported by the conversation.
15. If the message says "today", preserve the meaning of today. Do not invent another date.
16. If the user is an admin, generate appropriate admin messages instead of employee replies.
17. If the user has typed a draft, improve that draft rather than replying to an unrelated message.

STYLE:
- Natural, confident, warm, professional English.
- Short and ready-to-send chat messages.
- Each suggestion should be 1 to 3 sentences.
- All three suggestions must be meaningfully different.
- Do not include headings, explanations, or quotation marks around suggestions.

OUTPUT:
Return ONLY valid JSON in this exact structure:
{"suggestions":["First suggestion","Second suggestion","Third suggestion"]}
`;
}

function parseSuggestions(raw) {
  const cleaned = String(raw || "")
    .replace(/```json|```/gi, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) return [];

  try {
    const parsed = JSON.parse(
      cleaned.slice(start, end + 1)
    );

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

async function askClaude(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) return [];

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || DEFAULT_MODEL,
      max_tokens: 700,
      system:
        "You are a professional workplace chat assistant. Read the conversation carefully and generate context-aware replies. Never repeat the incoming message as the reply. Output only valid JSON.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }),
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) {
    throw new Error(
      `AI request failed with status ${response.status}`
    );
  }

  const data = await response.json();

  const responseText = (data.content || [])
    .map((block) =>
      block.type === "text" ? block.text : ""
    )
    .join("");

  return parseSuggestions(responseText);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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

  let history = [];
  let conversationType = "direct";
  let lastIncoming = "";

  if (data.conversationId) {
    const { conversation } = await getConversation(
      data.conversationId,
      user
    );

    conversationType = conversation.type;

    const { messages } = await getMessages(
      data.conversationId,
      user
    );

    history = messages
      .filter((message) => message.text)
      .slice(-8)
      .map((message) => ({
        name:
          String(message.sender.id) === userId
            ? "Me"
            : message.sender.name,
        text: message.text.slice(0, 400),
        mine: String(message.sender.id) === userId
      }));

    lastIncoming =
      [...history]
        .reverse()
        .find((item) => !item.mine)?.text || "";
  }

  // Empty draft + incoming message = reply mode.
  // Typed draft = improve the user's own message.
  const replyMode =
    !draft &&
    !instruction &&
    Boolean(lastIncoming);

  let suggestions = [];
  let source = "template";

  // Try real AI first.
  try {
    suggestions = await askClaude(
      buildPrompt({
        draft,
        instruction,
        history,
        user,
        conversationType,
        replyMode
      })
    );

    if (suggestions.length) {
      source = "ai";
    }
  } catch (error) {
    console.error(
      "[chat-ai] falling back to templates:",
      error?.message
    );
  }

  // Use context-aware fallback templates if AI is unavailable.
  if (!suggestions.length) {
    if (instruction || draft) {
      suggestions = writingSuggestions({
        text: instruction || draft,
        role: user.role
      });
    } else if (lastIncoming) {
      suggestions =
        user.role === ROLES.ADMIN
          ? adminReplySuggestions(lastIncoming)
          : employeeReplySuggestions(lastIncoming);
    } else {
      suggestions = writingSuggestions({
        text: "",
        role: user.role
      });
    }
  }

  return {
    suggestions,
    source
  };
}
