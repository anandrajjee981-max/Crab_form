// Why does this file exist? Fetches user data for ResponseModel filling + exposes getUserData endpoint.
import UserDAO from "../../auth/dao/UserDAO.js";

export default class GetUserDataActivity {
  static async execute(userId) {
    if (!userId) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    const user = await UserDAO.findUserById(userId);
    if (!user) {
      const e = new Error("User not found");
      e.statusCode = 404;
      throw e;
    }
    return user;
  }

  // alias for requested naming
  static async getUserData(userId) {
    return this.execute(userId);
  }
}
