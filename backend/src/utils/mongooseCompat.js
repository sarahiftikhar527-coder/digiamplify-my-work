import crypto from "node:crypto";

export function isValidId(id) {
  if (!id) return false;
  const s = String(id).trim();
  // Accepts UUIDs, hex ObjectIds, or standard alphanumeric IDs
  return s.length >= 8 && s.length <= 128;
}

export class MockObjectId {
  constructor(val) {
    this.value = val ? String(val) : crypto.randomUUID();
  }
  toString() {
    return this.value;
  }
}

export const mongoose = {
  isValidObjectId: (id) => isValidId(id),
  Types: {
    ObjectId: MockObjectId,
  },
  models: {},
  model: () => ({}),
  Schema: class MockSchema {
    index() {}
    set() {}
    virtual() {
      return { get() {} };
    }
  },
};

export default mongoose;

