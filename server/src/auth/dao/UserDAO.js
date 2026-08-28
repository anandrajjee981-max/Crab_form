import UserAccessor from "../accessor/UserAccessor.js";

export default class UserDAO {
  static async createUser(user) {
    return UserAccessor.create(user.toPersistence());
  }

  static async findUserByEmail(email, options) {
    return UserAccessor.findByEmail(email, options);
  }

  static async findUserById(id) {
    return UserAccessor.findById(id);
  }
}
