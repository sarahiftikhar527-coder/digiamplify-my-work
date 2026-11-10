
import { prisma } from "../../config/db.js";
import { createNotifications } from "../notifications/notifications.service.js";
import {
  extractProfileDocumentFileName,
  buildProfileDocumentUrl,
} from "../../utils/fileUrls.js";

const PROFILE_FIELDS = [
  "fullName",
  "userName",
  "dob",
  "gender",
  "nationality",
  "language",
  "email",
  "workEmail",
  "phone",
  "emergencyNumber",
  "currentAddress",
  "permanentAddress",
  "country",
  "city",
  "education",
  "bankName",
  "annualSalary",
  "accountHolder",
  "salaryType",
  "accountNumber",
  "salary",
  "currency",
  "deductionPerAbsence",
  "bonus",
  "salaryPaymentDate",
  "jobTitle",
  "department",
  "team",
  "manager",
  "jobLevel",
  "probationPeriod",
  "dateOfJoining",
  "confirmationDate",
  "annualLeave",
  "jobType",
  "workType",
  "shift",
  "workingDays",
  "weeklyOff",
  "noticePeriod",
  "avatarUrl",
  "documents",
];

const SELF_EDITABLE_FIELDS = [
  "fullName",
  "userName",
  "dob",
  "gender",
  "nationality",
  "language",
  "workEmail",
  "phone",
  "emergencyNumber",
  "currentAddress",
  "permanentAddress",
  "country",
  "city",
  "education",
  "avatarUrl",
];

const NUMERIC_FIELDS = [
  "annualSalary",
  "salary",
  "deductionPerAbsence",
  "bonus",
  "annualLeave",
];

const INTEGER_FIELDS = ["annualLeave"];

const TEXT_LIMITS = {
  fullName: 191,
  userName: 191,
  dob: 50,
  gender: 50,
  nationality: 100,
  language: 100,
  email: 191,
  workEmail: 191,
  phone: 50,
  emergencyNumber: 50,
  country: 100,
  city: 100,
  education: 191,
  bankName: 191,
  accountHolder: 191,
  salaryType: 50,
  accountNumber: 100,
  currency: 50,
  salaryPaymentDate: 50,
  jobTitle: 100,
  department: 100,
  team: 100,
  manager: 100,
  jobLevel: 50,
  probationPeriod: 50,
  dateOfJoining: 50,
  confirmationDate: 50,
  jobType: 50,
  workType: 50,
  shift: 50,
  weeklyOff: 50,
  noticePeriod: 50,
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AVATAR_DATA_URL =
  /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const MAX_AVATAR_DATA_LENGTH = 60000;
const MAX_DOCUMENTS = 30;
const MAX_TEXT = 1000;
const ID_PATTERN = /^[0-9a-zA-Z-]{8,64}$/;

export class ProfileError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "ProfileError";
    this.statusCode = statusCode;
  }
}

const fileNameOf = (url) => {
  try {
    return extractProfileDocumentFileName(String(url || "")) || "";
  } catch {
    return "";
  }
};

const refreshUrl = (url) => {
  const value = String(url || "");

  if (!value || value.startsWith("data:")) return value;

  const name = fileNameOf(value);

  if (!name) return value;

  try {
    return buildProfileDocumentUrl(name) || value;
  } catch {
    return value;
  }
};

const stripViewFields = (doc) => {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return doc;
  }

  const { viewUrl, ...rest } = doc;
  return rest;
};

const refreshDocument = (doc) => {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return doc;
  }

  const url = refreshUrl(doc.url);

  return {
    ...doc,
    url,
    backUrl: refreshUrl(doc.backUrl),
    viewUrl: url,
  };
};

const storedDocuments = (list) =>
  Array.isArray(list) ? list.map(stripViewFields) : [];

const withFreshUrls = (value) => {
  if (!value || typeof value !== "object") return value || {};

  const output = { ...value };

  if (Array.isArray(output.documents)) {
    output.documents = output.documents.map(refreshDocument);
  }

  if (typeof output.avatarUrl === "string") {
    output.avatarUrl = refreshUrl(output.avatarUrl);
  }

  return output;
};

const cleanAvatar = (submitted, knownUrls = []) => {
  if (submitted === null || submitted === undefined) return "";

  if (typeof submitted !== "string") {
    throw new ProfileError("avatarUrl must be text.", 400);
  }

  const url = submitted.trim();

  if (!url) return "";

  if (fileNameOf(url)) return url;

  if (
    knownUrls.some(
      (known) => known && String(known).trim() === url
    )
  ) {
    return url;
  }

  if (AVATAR_DATA_URL.test(url)) {
    if (url.length <= MAX_AVATAR_DATA_LENGTH) return url;

    throw new ProfileError(
      "This photo is too large. Please upload it using the photo upload button.",
      400
    );
  }

  throw new ProfileError(
    "Please upload your profile photo using the upload button.",
    400
  );
};

const sameAvatar = (a, b) => {
  const first = String(a || "");
  const second = String(b || "");

  if (first === second) return true;

  const firstName = fileNameOf(first);

  return Boolean(firstName) && firstName === fileNameOf(second);
};

const cleanTextField = (field, value) => {
  let text = value;

  if (text === null || text === undefined) return "";

  if (typeof text === "number" || typeof text === "boolean") {
    text = String(text);
  }

  if (typeof text !== "string") {
    throw new ProfileError(`${field} must be text.`, 400);
  }

  text = text.trim();

  const limit = TEXT_LIMITS[field];

  if (limit && text.length > limit) {
    throw new ProfileError(
      `${field} must be at most ${limit} characters.`,
      400
    );
  }

  return text;
};

const cleanNumberField = (field, value) => {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new ProfileError(
      `${field} must be a valid non-negative number.`,
      400
    );
  }

  return INTEGER_FIELDS.includes(field) ? Math.round(number) : number;
};

const DAY_LOOKUP = new Map(
  WEEK_DAYS.map((day) => [day.toLowerCase(), day])
);

const dayFromText = (text) =>
  DAY_LOOKUP.get(
    String(text ?? "").trim().slice(0, 3).toLowerCase()
  );

const dayFromItem = (item) => {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    return dayFromText(
      item.day ?? item.name ?? item.label ?? item.value
    );
  }

  return dayFromText(item);
};

const daysFromText = (text) => {
  const parts = String(text ?? "")
    .split(/\s*(?:-|–|—|\bto\b)\s*/i)
    .map((part) => dayFromText(part));

  if (parts.length === 2 && parts[0] && parts[1]) {
    const from = WEEK_DAYS.indexOf(parts[0]);
    const to = WEEK_DAYS.indexOf(parts[1]);
    const range = [];

    for (let index = from; ; index = (index + 1) % WEEK_DAYS.length) {
      range.push(WEEK_DAYS[index]);

      if (index === to) break;
    }

    return range;
  }

  return String(text ?? "")
    .split(/[\s,;|]+/)
    .map(dayFromText)
    .filter(Boolean);
};

const cleanWorkingDays = (value) => {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  let found = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string") {
        found.push(...daysFromText(item));
      } else {
        const day = dayFromItem(item);
        if (day) found.push(day);
      }
    }
  } else if (typeof value === "string") {
    found = daysFromText(value);
  } else if (typeof value === "object") {
    for (const [key, enabled] of Object.entries(value)) {
      const day = dayFromText(key);
      if (day && enabled) found.push(day);
    }
  }

  const days = WEEK_DAYS.filter((day) => found.includes(day));

  if (days.length === 0) {
    const sentNothingUseful = Array.isArray(value)
      ? value.length > 0
      : typeof value === "string"
        ? value.trim().length > 0
        : Object.keys(value || {}).length > 0;

    return sentNothingUseful ? undefined : [];
  }

  return days;
};

const cleanSavedDocuments = (value) => {
  if (value === null || value === undefined) return [];

  if (!Array.isArray(value)) {
    throw new ProfileError("Documents must be a list.", 400);
  }

  if (value.length > MAX_DOCUMENTS) {
    throw new ProfileError("Too many documents.", 400);
  }

  return value.map((doc) => {
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
      throw new ProfileError(
        "Each document must be an object.",
        400
      );
    }

    return stripViewFields(doc);
  });
};

const safeUser = (user) => ({
  _id: user?.id || "",
  id: user?.id || "",
  name: user?.name || "",
  email: user?.email || "",
  role: user?.role || "",
  avatarUrl: refreshUrl(user?.avatarUrl || ""),
});

const toProfileResponse = (user, profile) => {
  const saved = profile || {};
  const userData = safeUser(user);

  return withFreshUrls({
    ...saved,
    userId: userData.id,
    user: userData,
    fullName: saved.fullName || userData.name || "",
    email: saved.email || userData.email || "",
    avatarUrl: saved.avatarUrl || userData.avatarUrl || "",
    documents: Array.isArray(saved.documents) ? saved.documents : [],
  });
};

const findUser = async (userId) => {
  const id = String(userId || "").trim();

  if (!id || !ID_PATTERN.test(id)) {
    throw new ProfileError("Invalid employee ID.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      status: true,
      isDeleted: true,
    },
  });

  if (!user || user.isDeleted) {
    throw new ProfileError("Employee not found.", 404);
  }

  return user;
};

export const listEmployees = async () => {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
      status: "active",
      role: {
        notIn: ["admin", "superadmin"],
      },
    },
    include: {
      profile: true,
    },
    orderBy: [
      { name: "asc" },
      { email: "asc" },
    ],
  });

  return users.map((user) => {
    const profile = user.profile || {};

    const name =
      profile.fullName ||
      user.name ||
      user.email ||
      "Unnamed Employee";

    return {
      _id: user.id,
      id: user.id,
      userId: user.id,
      name,
      fullName: name,
      email: profile.email || user.email || "",
      role: user.role || "",
      avatarUrl: refreshUrl(
        profile.avatarUrl || user.avatarUrl || ""
      ),
      department: profile.department || user.department || "",
      jobTitle: profile.jobTitle || user.designation || "",
      salary: Number(profile.salary || 0),
      annualSalary: Number(profile.annualSalary || 0),
      bankName: profile.bankName || "",
      accountNumber: profile.accountNumber || "",
      accountHolder: profile.accountHolder || "",
      salaryType: profile.salaryType || "Monthly",
      currency: profile.currency || "PKR",
      bonus: Number(profile.bonus || 0),
      deductionPerAbsence: Number(
        profile.deductionPerAbsence || 0
      ),
      salaryPaymentDate: profile.salaryPaymentDate || "",
    };
  });
};

export const getProfileByUserId = async (userId) => {
  const user = await findUser(userId);

  const profile = await prisma.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  return toProfileResponse(user, profile);
};

export const updateProfileByUserId = async (
  userId,
  payload,
  options = {}
) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new ProfileError(
      "A valid profile object is required.",
      400
    );
  }

  const user = await findUser(userId);

  const allowedFields = options.approved
    ? [...SELF_EDITABLE_FIELDS, "documents"]
    : options.selfService
      ? SELF_EDITABLE_FIELDS
      : PROFILE_FIELDS;

  const update = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      update[field] = payload[field];
    }
  }

  if (Object.keys(update).length === 0) {
    throw new ProfileError(
      "No editable profile fields were provided.",
      400
    );
  }

  const existing = await prisma.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  for (const field of Object.keys(update)) {
    if (field === "avatarUrl") {
      update.avatarUrl = cleanAvatar(update.avatarUrl, [
        existing?.avatarUrl,
        user.avatarUrl,
      ]);
    } else if (field === "documents") {
      update.documents = cleanSavedDocuments(update.documents);
    } else if (field === "workingDays") {
      const days = cleanWorkingDays(update.workingDays);

      if (days === undefined) {
        delete update.workingDays;
      } else {
        update.workingDays = days;
      }
    } else if (NUMERIC_FIELDS.includes(field)) {
      update[field] = cleanNumberField(field, update[field]);
    } else {
      update[field] = cleanTextField(field, update[field]);
    }
  }

  if (Object.keys(update).length === 0) {
    throw new ProfileError(
      "No editable profile fields were provided.",
      400
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        ...update,
      },
      update,
    });

    let updatedUser = user;

    if (Object.prototype.hasOwnProperty.call(update, "avatarUrl")) {
      updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatarUrl: update.avatarUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
        },
      });
    }

    return {
      user: updatedUser,
      profile,
    };
  });

  return toProfileResponse(result.user, result.profile);
};

/* Employee profile change requests */

export const CHANGE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const REQUEST_FIELDS = [...SELF_EDITABLE_FIELDS, "documents"];

const sameValue = (a, b) =>
  JSON.stringify(a ?? "") === JSON.stringify(b ?? "");

const toPlainRequest = (row) => {
  if (!row) return null;

  const owner = row.user || null;
  const reviewer = row.reviewedBy || null;

  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    changes: withFreshUrls(row.changes),
    previous: withFreshUrls(row.previous),
    reviewNote: row.reviewNote || "",
    reviewedAt: row.reviewedAt || null,
    reviewedBy: reviewer
      ? {
          id: reviewer.id,
          name: reviewer.name || reviewer.email || "",
        }
      : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    employee: owner
      ? {
          id: owner.id,
          name: owner.name || owner.email || "",
          email: owner.email || "",
        }
      : null,
  };
};

const REQUEST_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const cleanDocuments = (submitted, currentDocuments) => {
  if (!Array.isArray(submitted)) {
    throw new ProfileError("Documents must be a list.", 400);
  }

  if (submitted.length > MAX_DOCUMENTS) {
    throw new ProfileError("Too many documents.", 400);
  }

  const current = Array.isArray(currentDocuments)
    ? currentDocuments
    : [];

  const currentById = new Map(
    current.map((doc) => [String(doc?.id), doc])
  );

  return submitted.map((doc) => {
    const id = String(doc?.id || "");

    if (id && currentById.has(id)) {
      return stripViewFields(currentById.get(id));
    }

    const url = String(doc?.url || "");

    if (!fileNameOf(url)) {
      throw new ProfileError(
        "A new document must be uploaded through the profile upload first.",
        400
      );
    }

    return {
      id: id || undefined,
      label: String(
        doc?.label || doc?.fileName || "Document"
      ).slice(0, 191),
      kind: "file",
      fileName: String(
        doc?.fileName || doc?.label || ""
      ).slice(0, 191),
      url,
      backFileName: "",
      backUrl: "",
      uploadedOn: String(
        doc?.uploadedOn || new Date().toISOString()
      ),
      status: "pending",
    };
  });
};

export const getMyChangeRequest = async (userId) => {
  const row = await prisma.profileChangeRequest.findFirst({
    where: {
      userId: String(userId),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: REQUEST_INCLUDE,
  });

  return toPlainRequest(row);
};

export const createChangeRequest = async (userId, payload) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new ProfileError(
      "A valid profile object is required.",
      400
    );
  }

  const user = await findUser(userId);

  const pending = await prisma.profileChangeRequest.findFirst({
    where: {
      userId: user.id,
      status: CHANGE_STATUS.PENDING,
    },
  });

  if (pending) {
    throw new ProfileError(
      "You already have a change request waiting for admin approval.",
      409
    );
  }

  const current = await getProfileByUserId(user.id);

  const changes = {};
  const previous = {};

  for (const field of REQUEST_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) {
      continue;
    }

    let next = payload[field];
    let before;

    if (field === "documents") {
      next = cleanDocuments(next, current.documents);
      before = storedDocuments(current.documents);
    } else if (field === "avatarUrl") {
      next = cleanAvatar(next, [
        current.avatarUrl,
        user.avatarUrl,
      ]);

      before = current.avatarUrl || "";

      if (sameAvatar(before, next)) continue;
    } else {
      if (next === null || next === undefined) next = "";

      if (typeof next !== "string") {
        throw new ProfileError(`${field} must be text.`, 400);
      }

      next = next.trim();

      if (next.length > MAX_TEXT) {
        throw new ProfileError(`${field} is too long.`, 400);
      }

      const limit = TEXT_LIMITS[field];

      if (limit && next.length > limit) {
        throw new ProfileError(
          `${field} must be at most ${limit} characters.`,
          400
        );
      }

      before = current[field] ?? "";
    }

    if (sameValue(before, next)) continue;

    changes[field] = next;
    previous[field] = before;
  }

  if (Object.keys(changes).length === 0) {
    throw new ProfileError(
      "You have not changed anything.",
      400
    );
  }

  const created = await prisma.profileChangeRequest.create({
    data: {
      userId: user.id,
      changes,
      previous,
      status: CHANGE_STATUS.PENDING,
    },
    include: REQUEST_INCLUDE,
  });

  const name =
    current.fullName ||
    current.user?.name ||
    "An employee";

  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ["admin", "superadmin"],
      },
      status: "active",
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  try {
    if (admins.length) {
      await createNotifications(
        admins.map((admin) => admin.id),
        {
          from: user.id,
          type: "profile",
          tag: "HR & Admin",
          title: "Profile change request",
          message: `${name} wants to update their profile.`,
          details:
            "Open Approvals > Profile Approvals to approve or reject.",
          link: "/admin/approvals?section=profile",
          linkLabel: "Review Request",
        }
      );
    }
  } catch (error) {
    console.error(
      "Profile request notification failed:",
      error?.message
    );
  }

  return toPlainRequest(created);
};

export const listChangeRequests = async ({ status } = {}) => {
  const where = {};

  if (status && status !== "all") {
    where.status = String(status);
  }

  const rows = await prisma.profileChangeRequest.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
    include: REQUEST_INCLUDE,
  });

  return rows.map(toPlainRequest);
};

export const countPendingChangeRequests = () =>
  prisma.profileChangeRequest.count({
    where: {
      status: CHANGE_STATUS.PENDING,
    },
  });

const notifyEmployee = async (
  request,
  admin,
  approved,
  note
) => {
  try {
    await createNotifications([request.userId], {
      from: String(admin.id),
      type: "profile",
      tag: "HR & Admin",
      title: approved
        ? "Profile changes approved"
        : "Profile changes rejected",
      message: approved
        ? "Your profile changes were approved and saved."
        : "Your profile changes were not approved.",
      details: note || "",
      link: "/profile",
      linkLabel: "Open Profile",
    });
  } catch (error) {
    console.error(
      "Profile decision notification failed:",
      error?.message
    );
  }
};

export const reviewChangeRequest = async (
  requestId,
  admin,
  { approve, note = "" }
) => {
  const id = String(requestId || "");
  const reviewNote = String(note || "").trim().slice(0, 500);

  const claimed = await prisma.profileChangeRequest.updateMany({
    where: {
      id,
      status: CHANGE_STATUS.PENDING,
    },
    data: {
      status: approve
        ? CHANGE_STATUS.APPROVED
        : CHANGE_STATUS.REJECTED,
      reviewedById: String(admin.id),
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  if (claimed.count === 0) {
    const exists = await prisma.profileChangeRequest.findUnique({
      where: { id },
    });

    throw new ProfileError(
      exists
        ? "This request has already been reviewed."
        : "Change request not found.",
      exists ? 409 : 404
    );
  }

  const row = await prisma.profileChangeRequest.findUnique({
    where: { id },
    include: REQUEST_INCLUDE,
  });

  if (approve) {
    try {
      await updateProfileByUserId(
        row.userId,
        row.changes,
        { approved: true }
      );
    } catch (error) {
      await prisma.profileChangeRequest.update({
        where: { id },
        data: {
          status: CHANGE_STATUS.PENDING,
          reviewedById: null,
          reviewedAt: null,
          reviewNote: "",
        },
      });

      throw error;
    }
  }

  await notifyEmployee(row, admin, approve, reviewNote);

  return toPlainRequest(row);
};
