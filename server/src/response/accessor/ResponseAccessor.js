// Why does this file exist? Accessor does Mongoose ops for responses.
import ResponseSchema from "../schema/ResponseSchema.js";

export default class ResponseAccessor {
  static async create(data) {
    return ResponseSchema.create(data);
  }
  static async findByForm(form_id) {
    return ResponseSchema.find({ form_id }).sort({ createdAt: -1 }).lean();
  }
  static async findById(id) {
    return ResponseSchema.findById(id).lean();
  }
  static async countByForm(form_id) {
    return ResponseSchema.countDocuments({ form_id });
  }

  // --- getMyFormData / get user data support ---
  static async findByRespondent(respondentId) {
    return ResponseSchema.find({ respondentId }).sort({ createdAt: -1 }).lean();
  }
  static async findByRespondentEmail(respondentEmail) {
    return ResponseSchema.find({ respondentEmail }).sort({ createdAt: -1 }).lean();
  }
  static async findByFormAndRespondent(form_id, respondentId) {
    return ResponseSchema.find({ form_id, respondentId }).sort({ createdAt: -1 }).lean();
  }
  static async findByRespondentWithLimit(respondentId, limit = 50) {
    return ResponseSchema.find({ respondentId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
  static async findByOwner(ownerId) {
    return ResponseSchema.find({ ownerId }).sort({ createdAt: -1 }).lean();
  }
  static async findByOwnerOrFormIds(ownerId, formIds) {
    return ResponseSchema.find({ $or: [{ ownerId }, { form_id: { $in: formIds } }] }).sort({ createdAt: -1 }).lean();
  }
}
