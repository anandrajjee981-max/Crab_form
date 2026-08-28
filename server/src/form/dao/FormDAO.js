// Why does this file exist? DAO exposes meaningful data operations, delegates to Accessor, hides persistence details.
import FormAccessor from "../accessor/FormAccessor.js";

export default class FormDAO {
  static async createForm(formComponent) {
    return FormAccessor.create(formComponent.toPersistence());
  }
  static async findById(id) {
    return FormAccessor.findById(id);
  }
  static async findBySlug(slug) {
    return FormAccessor.findBySlug(slug);
  }
  static async findByOwner(owner_id) {
    return FormAccessor.findByOwner(owner_id);
  }
  // Aliases for requested naming getMyAllForm / getmyallform
  static async getMyAllForm(owner_id) {
    return FormAccessor.findByOwner(owner_id);
  }
  static async getMyAllForms(owner_id) {
    return FormAccessor.findByOwner(owner_id);
  }
  static async getmyallform(owner_id) {
    return FormAccessor.findByOwner(owner_id);
  }
  static async updateForm(id, update) {
    return FormAccessor.findByIdAndUpdate(id, update);
  }
  static async deleteForm(id) {
    return FormAccessor.deleteById(id);
  }
  static async existsSlug(slug) {
    return FormAccessor.existsSlug(slug);
  }
}
