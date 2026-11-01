import mongoose from "mongoose";
import Profile from "../../models/Profile.js";
import User from "../../models/User.js";

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
];

const NUMERIC_FIELDS = [
  "annualSalary",
  "salary",
  "deductionPerAbsence",
  "bonus",
  "annualLeave",
];

export class ProfileError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const safeUser = (user) => {
  const value = user?.toObject ? user.toObject() : user || {};

  return {
    _id: value._id,
    name:
      value.name ||
      [value.firstName, value.lastName].filter(Boolean).join(" ") ||
      value.fullName ||
      "",
    email: value.email || "",
    role: value.role || "",
  };
};

const toProfileResponse = (user, profile) => {
  const saved = profile?.toObject
    ? profile.toObject()
    : profile || {};

  const userData = safeUser(user);

  return {
    ...saved,
    user: userData,
    fullName: saved.fullName || userData.name || "",
    email: saved.email || userData.email || "",
  };
};

const findUser = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new ProfileError("Invalid employee ID.", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ProfileError("Employee not found.", 404);
  }

  return user;
};

export const listEmployees = async () => {
  const users = await User.find({
    isDeleted: false,
    status: "active",
    role: { $nin: ["admin", "superadmin"] },
  })
    .select("_id name firstName lastName fullName email role")
    .sort({ name: 1, email: 1 })
    .lean();

  if (!users.length) {
    return [];
  }

  const userIds = users.map((user) => user._id);

  const profiles = await Profile.find({
    user: { $in: userIds },
  }).lean();

  const profileMap = new Map(
    profiles.map((profile) => [
      String(profile.user),
      profile,
    ])
  );

  return users.map((user) => {
    const profile = profileMap.get(String(user._id)) || {};

    const name =
      profile.fullName ||
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.fullName ||
      user.email ||
      "Unnamed Employee";

    return {
      _id: user._id,
      userId: String(user._id),
      name,
      fullName: name,
      email: profile.email || user.email || "",
      role: user.role || "",
      department: profile.department || "",
      jobTitle: profile.jobTitle || "",
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
  const profile = await Profile.findOne({
    user: user._id,
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

  const allowedFields = options.selfService
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

  if (
    update.workingDays !== undefined &&
    (!Array.isArray(update.workingDays) ||
      update.workingDays.some(
        (day) =>
          ![
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].includes(day)
      ))
  ) {
    throw new ProfileError("Invalid working days.", 400);
  }

  if (!options.selfService) {
    for (const field of NUMERIC_FIELDS) {
      if (!(field in update)) {
        continue;
      }

      if (
        update[field] === "" ||
        update[field] === null ||
        !Number.isFinite(Number(update[field])) ||
        Number(update[field]) < 0
      ) {
        throw new ProfileError(
          `${field} must be a valid non-negative number.`,
          400
        );
      }

      update[field] = Number(update[field]);
    }
  }

  const profile = await Profile.findOneAndUpdate(
    { user: user._id },
    {
      $set: update,
      $setOnInsert: {
        user: user._id,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return toProfileResponse(user, profile);
};