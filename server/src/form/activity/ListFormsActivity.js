// Why does this file exist? Activity to list all forms for authenticated owner.
import FormDAO from "../dao/FormDAO.js";

export default class ListFormsActivity {
  static async execute({ userId, ownerId }) {
    const owner = userId || ownerId;
    if (!owner) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    return FormDAO.findByOwner(owner);
  }

  // Alias: requested as getMyAllForm / getmyallform
  static async getMyAllForm({ userId, ownerId }) {
    return this.execute({ userId, ownerId });
  }

  static async getMyAllForms({ userId, ownerId }) {
    return this.execute({ userId, ownerId });
  }
}
