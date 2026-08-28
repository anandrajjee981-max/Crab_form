import UserDAO from "../dao/UserDAO.js";

export default class GetCurrentUserActivity {
  static async execute(userId) {
    const user = await UserDAO.findUserById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}
