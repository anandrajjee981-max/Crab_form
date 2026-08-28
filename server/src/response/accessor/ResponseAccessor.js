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
}
