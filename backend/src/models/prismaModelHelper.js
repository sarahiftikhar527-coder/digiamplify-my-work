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
        else if (k === "$gt") out.gt = v instanceof Date ? v : v;
        else if (k === "$gte") out.gte = v instanceof Date ? v : v;
        else if (k === "$lt") out.lt = v instanceof Date ? v : v;
        else if (k === "$lte") out.lte = v instanceof Date ? v : v;
        else if (k === "$regex") out.contains = String(v);
        else if (k === "$options") {
          // MySQL is case-insensitive by default in utf8mb4_unicode_ci
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

    let targetField = key;
    if (key === "_id") targetField = "id";
    if (fieldMap[key]) targetField = fieldMap[key];

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

  enhanced.save = async function () {
    const { id, _id, save, toJSON, toObject, ...dataToUpdate } = this;
    const updated = await prisma[delegate].update({
      where: { id: this.id },
      data: dataToUpdate,
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

class QueryChain {
  constructor(delegate, operation, queryParams, fieldMap = {}) {
    this.delegate = delegate;
    this.operation = operation; // 'findMany', 'findFirst', 'count', etc.
    this.queryParams = queryParams || {};
    this.fieldMap = fieldMap;
    this._selectFields = null;
    this._sort = null;
    this._skip = null;
    this._take = null;
  }

  select(fields) {
    // fields can be string "name email -passwordHash" or object
    this._selectFields = fields;
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

    const result = await prisma[this.delegate][this.operation](args);

    if (Array.isArray(result)) {
      return result.map((row) => wrapDoc(row, this.delegate, this.fieldMap));
    }
    return result ? wrapDoc(result, this.delegate, this.fieldMap) : null;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

export function createPrismaModel(delegate, fieldMap = {}) {
  return {
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

    async countDocuments(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      return prisma[delegate].count({ where });
    },

    async count(filter = {}) {
      const where = translateWhere(filter, fieldMap);
      return prisma[delegate].count({ where });
    },

    async create(data = {}) {
      const payload = {};
      for (const [k, v] of Object.entries(data)) {
        if (k === "_id") continue;
        const target = fieldMap[k] || k;
        payload[target] = v;
      }
      const created = await prisma[delegate].create({ data: payload });
      return wrapDoc(created, delegate, fieldMap);
    },

    async createMany(items = []) {
      const data = items.map((item) => {
        const payload = {};
        for (const [k, v] of Object.entries(item)) {
          if (k === "_id") continue;
          const target = fieldMap[k] || k;
          payload[target] = v;
        }
        return payload;
      });
      return prisma[delegate].createMany({ data });
    },

    async insertMany(items = []) {
      return this.createMany(items);
    },

    async findByIdAndUpdate(id, update = {}, options = {}) {
      const clean = cleanId(id);
      const dataToSet = update.$set ? { ...update.$set } : { ...update };
      const payload = {};

      for (const [k, v] of Object.entries(dataToSet)) {
        if (k === "_id" || k === "id") continue;
        const target = fieldMap[k] || k;
        payload[target] = v;
      }

      const updated = await prisma[delegate].update({
        where: { id: clean },
        data: payload,
      });
      return wrapDoc(updated, delegate, fieldMap);
    },

    async findOneAndUpdate(filter = {}, update = {}, options = {}) {
      const where = translateWhere(filter, fieldMap);
      const existing = await prisma[delegate].findFirst({ where });
      if (!existing) return null;

      return this.findByIdAndUpdate(existing.id, update, options);
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
  };
}
