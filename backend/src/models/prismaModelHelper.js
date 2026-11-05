import { prisma } from "../config/db.js";

function cleanId(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === "object" && val._id) return String(val._id);
  if (typeof val === "object" && val.id) return String(val.id);
  if (typeof val === "object" && typeof val.toString === "function") {
    const s = val.toString();
    if (s && s !== "[object Object]") return s;
  }
  return String(val);
}

export function translateValue(val) {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    return val.map(translateValue);
  }

  if (typeof val === "object" && !(val instanceof Date)) {
    const keys = Object.keys(val);
    const hasOperators = keys.some((k) => k.startsWith("$"));

    if (hasOperators) {
      const out = {};
      for (const [k, v] of Object.entries(val)) {
        if (k === "$in") out.in = Array.isArray(v) ? v.map(cleanId) : [cleanId(v)];
        else if (k === "$nin") out.notIn = Array.isArray(v) ? v.map(cleanId) : [cleanId(v)];
        else if (k === "$ne") out.not = cleanId(v);
        else if (k === "$gt") out.gt = v;
        else if (k === "$gte") out.gte = v;
        else if (k === "$lt") out.lt = v;
        else if (k === "$lte") out.lte = v;
        else if (k === "$regex") out.contains = String(v);
        else if (k === "$exists") {
          return v ? { not: null } : null;
        }
      }
      return out;
    }
  }

  return val;
}

export function translateWhere(filter = {}, fieldMap = {}) {
  if (!filter || typeof filter !== "object") return {};
  const where = {};

  for (const [key, value] of Object.entries(filter)) {
    if (key === "$or" && Array.isArray(value)) {
      where.OR = value.map((v) => translateWhere(v, fieldMap));
      continue;
    }
    if (key === "$and" && Array.isArray(value)) {
      where.AND = value.map((v) => translateWhere(v, fieldMap));
      continue;
    }

    if (key === "members.user" || key.startsWith("members.")) {
      const targetUser = String(value?._id || value?.id || value);
      where.members = {
        string_contains: targetUser,
      };
      continue;
    }

    let targetField = key;
    if (key === "_id") targetField = "id";
    if (fieldMap[key]) targetField = fieldMap[key];

    // Handle MongoDB style sub-properties like 'documents.url'
    if (targetField.includes(".")) {
      const rootField = targetField.split(".")[0];
      targetField = fieldMap[rootField] || rootField;
    }

    where[targetField] = translateValue(value);
  }

  return where;
}

export function translateOrderBy(sortSpec) {
  if (!sortSpec) return undefined;
  const orderBy = [];

  if (typeof sortSpec === "string") {
    const parts = sortSpec.trim().split(/\s+/);
    for (const part of parts) {
      if (part.startsWith("-")) {
        const field = part.slice(1) === "_id" ? "id" : part.slice(1);
        orderBy.push({ [field]: "desc" });
      } else {
        const field = part === "_id" ? "id" : part;
        orderBy.push({ [field]: "asc" });
      }
    }
  } else if (typeof sortSpec === "object") {
    for (const [k, v] of Object.entries(sortSpec)) {
      const field = k === "_id" ? "id" : k;
      const dir = v === -1 || v === "desc" || v === "DESC" ? "desc" : "asc";
      orderBy.push({ [field]: dir });
    }
  }

  return orderBy.length > 0 ? orderBy : undefined;
}

function makeSubdocArray(arr) {
  if (!Array.isArray(arr)) return arr;
  const enhancedArr = [...arr];

  enhancedArr.id = function (subId) {
    const target = String(subId);
    return this.find((item) => String(item.id || item._id) === target) || null;
  };

  return enhancedArr;
}

const JSON_COLUMNS = new Set([
  "workingDays",
  "documents",
  "members",
  "messages",
  "admins",
  "clearedFor",
  "employeeIds",
]);

export function sanitizePayloadForPrisma(rawPayload = {}, fieldMap = {}) {
  const payload = {};

  for (const [k, v] of Object.entries(rawPayload)) {
    if (typeof v === "function") continue;
    if (
      k === "_id" ||
      k === "id" ||
      k === "save" ||
      k === "toJSON" ||
      k === "toObject" ||
      k.startsWith("$")
    ) {
      continue;
    }
    payload[k] = v;
  }

  // Reverse mapping for fieldMap: if schema expects `userId` and input has `user`,
  // extract `userId` and remove `user`.
  for (const [mKey, pKey] of Object.entries(fieldMap)) {
    if (payload[mKey] !== undefined) {
      const val = payload[mKey];
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        payload[pKey] = cleanId(val.id || val._id || val);
      } else if (payload[pKey] === undefined) {
        payload[pKey] = cleanId(val);
      }
      delete payload[mKey];
    }
  }

  // Strip populated objects or relations from scalar columns
  for (const [k, v] of Object.entries(payload)) {
    if (JSON_COLUMNS.has(k)) continue;
    if (v instanceof Date) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      delete payload[k];
    }
  }

  return payload;
}

export function wrapDoc(doc, delegate, fieldMap = {}) {
  if (!doc || typeof doc !== "object") return doc;

  const reverseFieldMap = {};
  for (const [mKey, pKey] of Object.entries(fieldMap)) {
    reverseFieldMap[pKey] = mKey;
  }

  const enhanced = { ...doc };
  enhanced.id = doc.id;
  enhanced._id = doc.id;

  for (const [pKey, mKey] of Object.entries(reverseFieldMap)) {
    if (doc[pKey] !== undefined && enhanced[mKey] === undefined) {
      enhanced[mKey] = doc[pKey];
    }
  }

  // Populate compatibility helpers: ensure both relation name and ID field are accessible
  if (doc.employee && typeof doc.employee === "object") {
    enhanced.employee = doc.employee;
    enhanced.employeeId = doc.employee;
  }
  if (doc.user && typeof doc.user === "object") {
    enhanced.user = doc.user;
    enhanced.userId = doc.user;
  }
  if (doc.createdBy && typeof doc.createdBy === "object") {
    enhanced.createdBy = doc.createdBy;
    enhanced.createdById = doc.createdBy;
  }
  if (doc.reviewedBy && typeof doc.reviewedBy === "object") {
    enhanced.reviewedBy = doc.reviewedBy;
    enhanced.reviewedById = doc.reviewedBy;
  }
  if (doc.assignedTo && typeof doc.assignedTo === "object") {
    enhanced.assignedTo = doc.assignedTo;
    enhanced.assignedToId = doc.assignedTo;
  }
  if (doc.assignedBy && typeof doc.assignedBy === "object") {
    enhanced.assignedBy = doc.assignedBy;
    enhanced.assignedById = doc.assignedBy;
  }

  // Handle embedded JSON arrays if present
  if (Array.isArray(enhanced.messages)) {
    enhanced.messages = makeSubdocArray(enhanced.messages);
  }
  if (Array.isArray(enhanced.members)) {
    enhanced.members = enhanced.members.map((m) => {
      if (m && typeof m === "object") {
        return {
          ...m,
          user: {
            id: String(m.user?._id || m.user?.id || m.user),
            _id: String(m.user?._id || m.user?.id || m.user),
            equals: (other) =>
              String(m.user?._id || m.user?.id || m.user) ===
              String(other?._id || other?.id || other),
          },
        };
      }
      return m;
    });
  }

  enhanced.save = async function () {
    const { id, _id, save, toJSON, toObject, ...dataToUpdate } = this;
    const cleanPayload = sanitizePayloadForPrisma(dataToUpdate, fieldMap);

    const updated = await prisma[delegate].update({
      where: { id: this.id },
      data: cleanPayload,
    });
    Object.assign(this, updated);
    this.id = updated.id;
    this._id = updated.id;
    return this;
  };

  enhanced.toJSON = function () {
    const copy = { ...this };
    delete copy.save;
    delete copy.toJSON;
    delete copy.toObject;
    return copy;
  };

  enhanced.toObject = enhanced.toJSON;

  return enhanced;
}

async function populateChatUsers(chatDocs) {
  if (!chatDocs || chatDocs.length === 0) return;
  const userIds = new Set();
  for (const chat of chatDocs) {
    if (Array.isArray(chat.members)) {
      for (const m of chat.members) {
        const uid = String(m?.user?._id || m?.user?.id || m?.user || "");
        if (uid && uid !== "undefined") userIds.add(uid);
      }
    }
    if (Array.isArray(chat.admins)) {
      for (const a of chat.admins) {
        const uid = String(a?._id || a?.id || a || "");
        if (uid && uid !== "undefined") userIds.add(uid);
      }
    }
    if (Array.isArray(chat.messages)) {
      for (const msg of chat.messages) {
        const senderId = String(
          msg?.sender?._id || msg?.sender?.id || msg?.sender || ""
        );
        if (senderId && senderId !== "undefined") userIds.add(senderId);
      }
    }
  }

  if (userIds.size === 0) return;

  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      status: true,
    },
  });

  const userMap = new Map();
  for (const u of users) {
    userMap.set(u.id, {
      ...u,
      _id: u.id,
      equals: (other) => u.id === String(other?._id || other?.id || other),
    });
  }

  for (const chat of chatDocs) {
    if (Array.isArray(chat.members)) {
      chat.members = chat.members.map((m) => {
        const uid = String(m?.user?._id || m?.user?.id || m?.user || "");
        const populated = userMap.get(uid);
        if (populated) {
          return { ...m, user: populated };
        }
        return m;
      });
    }
    if (Array.isArray(chat.admins)) {
      chat.admins = chat.admins.map((a) => {
        const uid = String(a?._id || a?.id || a || "");
        return userMap.get(uid) || a;
      });
    }
    if (Array.isArray(chat.messages)) {
      chat.messages = chat.messages.map((msg) => {
        const senderId = String(
          msg?.sender?._id || msg?.sender?.id || msg?.sender || ""
        );
        const populated = userMap.get(senderId);
        if (populated) {
          return { ...msg, sender: populated };
        }
        return msg;
      });
    }
  }
}

async function populateAnnouncementUsers(docs) {
  if (!docs || docs.length === 0) return;
  const userIds = new Set();
  for (const d of docs) {
    if (Array.isArray(d.employeeIds)) {
      for (const id of d.employeeIds) {
        const uid = String(id?._id || id?.id || id || "");
        if (uid) userIds.add(uid);
      }
    }
  }
  if (userIds.size === 0) return;
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      designation: true,
    },
  });
  const map = new Map(users.map((u) => [u.id, { ...u, _id: u.id }]));
  for (const d of docs) {
    if (Array.isArray(d.employeeIds)) {
      d.employeeIds = d.employeeIds.map((id) => {
        const uid = String(id?._id || id?.id || id || "");
        return map.get(uid) || id;
      });
    }
  }
}

class QueryChain {
  constructor(delegate, operation, queryParams, fieldMap = {}) {
    this.delegate = delegate;
    this.operation = operation;
    this.queryParams = queryParams || {};
    this.fieldMap = fieldMap;
    this._selectFields = null;
    this._sort = null;
    this._skip = null;
    this._take = null;
    this._includes = {};
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  populate(field, selectStr) {
    if (field) {
      let rootField = String(field).split(".")[0];
      // Skip non-relational JSON fields (such as 'members', 'admins', 'messages' on Chat, or 'employeeIds' on Announcement)
      if (
        (this.delegate === "chat" &&
          ["members", "admins", "messages", "clearedFor"].includes(rootField)) ||
        (this.delegate === "announcement" && rootField === "employeeIds")
      ) {
        return this;
      }

      // Map relation names if field is named after scalar ID
      if (rootField === "employeeId") {
        rootField = "employee";
      } else if (rootField === "userId") {
        rootField = "user";
      }

      if (selectStr && typeof selectStr === "string") {
        const selectObj = {};
        selectStr.split(/\s+/).forEach((f) => {
          if (f) selectObj[f] = true;
        });
        this._includes[rootField] = { select: selectObj };
      } else {
        this._includes[rootField] = true;
      }
    }
    return this;
  }

  sort(sortSpec) {
    this._sort = sortSpec;
    return this;
  }

  skip(n) {
    this._skip = Number(n);
    return this;
  }

  limit(n) {
    this._take = Number(n);
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    const args = { ...this.queryParams };

    if (this._sort) {
      args.orderBy = translateOrderBy(this._sort);
    }
    if (this._skip !== null && !isNaN(this._skip)) {
      args.skip = this._skip;
    }
    if (this._take !== null && !isNaN(this._take)) {
      args.take = this._take;
    }

    if (Object.keys(this._includes).length > 0) {
      try {
        args.include = this._includes;
      } catch {
        // Fall back gracefully if relations not present in schema
      }
    }

    let chatTargetUser = null;
    if (this.delegate === "chat") {
      delete args.include;
      if (args.where?.members) {
        chatTargetUser = String(
          args.where.members.string_contains || args.where.members
        );
        delete args.where.members;
      }
      if (args.where && Object.keys(args.where).length === 0) {
        delete args.where;
      }
    }

    let result;
    try {
      if (this.delegate === "chat" && chatTargetUser) {
        const allChats = await prisma.chat.findMany(args);
        const filtered = allChats.filter((c) => {
          const rawMembers = Array.isArray(c.members) ? c.members : [];
          return rawMembers.some(
            (m) =>
              String(m?.user?._id || m?.user?.id || m?.user) === chatTargetUser
          );
        });
        result =
          this.operation === "findFirst" || this.operation === "findUnique"
            ? filtered[0] || null
            : filtered;
      } else {
        result = await prisma[this.delegate][this.operation](args);
      }
    } catch (err) {
      if (this.delegate === "chat") {
        const fallbackArgs = { ...args };
        delete fallbackArgs.where;
        delete fallbackArgs.include;
        const allChats = await prisma[this.delegate].findMany(fallbackArgs);
        const targetUserId =
          chatTargetUser ||
          String(
            this.queryParams?.where?.members?.string_contains ||
              this.queryParams?.where?.members ||
              ""
          );
        let filtered = allChats;
        if (targetUserId) {
          filtered = allChats.filter((c) => {
            const rawMembers = Array.isArray(c.members) ? c.members : [];
            return rawMembers.some(
              (m) =>
                String(m?.user?._id || m?.user?.id || m?.user) === targetUserId
            );
          });
        }
        result =
          this.operation === "findFirst" || this.operation === "findUnique"
            ? filtered[0] || null
            : filtered;
      } else {
        throw err;
      }
    }

    if (Array.isArray(result)) {
      const docs = result.map((row) =>
        wrapDoc(row, this.delegate, this.fieldMap)
      );
      if (this.delegate === "chat") {
        await populateChatUsers(docs);
      } else if (this.delegate === "announcement") {
        await populateAnnouncementUsers(docs);
      }
      return docs;
    }
    const single = result
      ? wrapDoc(result, this.delegate, this.fieldMap)
      : null;
    if (single && this.delegate === "chat") {
      await populateChatUsers([single]);
    } else if (single && this.delegate === "announcement") {
      await populateAnnouncementUsers([single]);
    }
    return single;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

export function createPrismaModel(delegate, fieldMap = {}) {
  const model = {
    find(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      return new QueryChain(delegate, "findMany", { where }, fieldMap);
    },

    findOne(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      return new QueryChain(delegate, "findFirst", { where }, fieldMap);
    },

    findById(id) {
      return new QueryChain(
        delegate,
        "findUnique",
        { where: { id: cleanId(id) } },
        fieldMap
      );
    },

    async exists(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      const found = await prisma[delegate].findFirst({
        where,
        select: { id: true },
      });
      return found ? { id: found.id, _id: found.id } : null;
    },

    async countDocuments(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      return prisma[delegate].count({ where });
    },

    async count(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      return prisma[delegate].count({ where });
    },

    async create(data = {}) {
      const payload = sanitizePayloadForPrisma(data, fieldMap);
      const created = await prisma[delegate].create({ data: payload });
      return wrapDoc(created, delegate, fieldMap);
    },

    async createMany(items = []) {
      const data = items.map((item) => sanitizePayloadForPrisma(item, fieldMap));
      return prisma[delegate].createMany({ data });
    },

    async insertMany(items = []) {
      return this.createMany(items);
    },

    async findByIdAndUpdate(id, update = {}, options = {}) {
      const clean = cleanId(id);
      const dataToSet = update.$set ? { ...update.$set } : { ...update };
      const payload = sanitizePayloadForPrisma(dataToSet, fieldMap);

      const updated = await prisma[delegate].update({
        where: { id: clean },
        data: payload,
      });
      return wrapDoc(updated, delegate, fieldMap);
    },

    async findOneAndUpdate(filter = {}, update = {}, options = {}) {
      const where = translateWhere(filter, fieldMap);
      const existing = await prisma[delegate].findFirst({ where });
      if (!existing) {
        if (options && options.upsert) {
          const rawPayload = {
            ...filter,
            ...(update.$setOnInsert || {}),
            ...(update.$set || update),
          };
          const payload = sanitizePayloadForPrisma(rawPayload, fieldMap);
          return this.create(payload);
        }
        return null;
      }

      return this.findByIdAndUpdate(existing.id, update, options);
    },

    async updateOne(filter = {}, update = {}, options = {}) {
      const where = translateWhere(filter, fieldMap);
      const existing = await prisma[delegate].findFirst({
        where,
        select: { id: true },
      });
      if (!existing) {
        if (options?.upsert) {
          const rawPayload = {
            ...filter,
            ...(update.$setOnInsert || {}),
            ...(update.$set || update),
          };
          const payload = sanitizePayloadForPrisma(rawPayload, fieldMap);
          const created = await this.create(payload);
          return { acknowledged: true, modifiedCount: 0, upsertedId: created.id };
        }
        return { acknowledged: true, modifiedCount: 0 };
      }

      const dataToSet = update.$set ? { ...update.$set } : { ...update };
      const payload = sanitizePayloadForPrisma(dataToSet, fieldMap);

      await prisma[delegate].update({ where: { id: existing.id }, data: payload });
      return { acknowledged: true, modifiedCount: 1 };
    },

    async updateMany(filter = {}, update = {}) {
      const where = translateWhere(filter, fieldMap);
      const dataToSet = update.$set ? { ...update.$set } : { ...update };
      const payload = sanitizePayloadForPrisma(dataToSet, fieldMap);

      const result = await prisma[delegate].updateMany({ where, data: payload });
      return { acknowledged: true, modifiedCount: result.count };
    },

    async deleteOne(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      const existing = await prisma[delegate].findFirst({ where });
      if (!existing) return { deletedCount: 0 };

      await prisma[delegate].delete({ where: { id: existing.id } });
      return { deletedCount: 1 };
    },

    async deleteMany(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      const result = await prisma[delegate].deleteMany({ where });
      return { deletedCount: result.count };
    },

    async findByIdAndDelete(id) {
      const clean = cleanId(id);
      try {
        const deleted = await prisma[delegate].delete({ where: { id: clean } });
        return wrapDoc(deleted, delegate, fieldMap);
      } catch {
        return null;
      }
    },

    async aggregate(pipeline = []) {
      if (delegate === "task") {
        const matchStage = pipeline.find((p) => p.$match)?.$match || {};
        const where = translateWhere(matchStage, fieldMap);
        const tasks = await prisma.task.findMany({
          where,
          select: { completedAt: true },
        });

        const dayCounts = {};
        for (const t of tasks) {
          if (t.completedAt) {
            const day = new Date(t.completedAt).getUTCDate();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
          }
        }
        return Object.entries(dayCounts)
          .map(([day, count]) => ({
            _id: Number(day),
            count,
          }))
          .sort((a, b) => a._id - b._id);
      }
      return [];
    },
  };

  return model;
}
