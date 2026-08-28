// Why does this file exist? Accessor performs actual Mongoose operations; only layer that touches Schema.
import FormSchema from "../schema/FormSchema.js";

export default class FormAccessor {
  static async create(data) {
    return FormSchema.create(data);
  }
  static async findById(id) {
    return FormSchema.findById(id).lean();
  }
  static async findBySlug(slug) {
    return FormSchema.findOne({ slug }).lean();
  }
  static async findByOwner(owner_id) {
    return FormSchema.find({ owner_id }).sort({ createdAt: -1 }).lean();
  }
  // Aliases for getMyAllForm naming variations
  static async getMyAllForm(owner_id) {
    return this.findByOwner(owner_id);
  }
  static async getMyAllForms(owner_id) {
    return this.findByOwner(owner_id);
  }
  static async getmyallform(owner_id) {
    return this.findByOwner(owner_id);
  }
  static async findByIdAndUpdate(id, update, options = { returnDocument: "after" }) {
    return FormSchema.findByIdAndUpdate(id, update, options).lean();
  }
  static async deleteById(id) {
    return FormSchema.findByIdAndDelete(id).lean();
  }
  static async existsSlug(slug) {
    return FormSchema.exists({ slug });
  }
}
