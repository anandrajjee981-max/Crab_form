import UserSchema from "../schema/UserSchema.js";

export default class UserAccessor {
  static async create(userData) {
    return UserSchema.create(userData);
  }

  static async findByEmail(email, { includePassword = false } = {}) {
    const query = UserSchema.findOne({ email: email.toLowerCase() });

    if (includePassword) {
      query.select("+password");
    }

    return query.lean();
  }

  static async findById(id) {
    return UserSchema.findById(id).lean();
  }
}
