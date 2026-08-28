// Why does this file exist? Activity orchestrates login use-case: find user -> verify password -> issue JWT.
import bcrypt from "bcryptjs";
import UserDAO from "../dao/UserDAO.js";
import { signToken } from "../../utils/jwt.js";

export default class LoginActivity {
  static async execute({ email, password }) {
    if (!email?.trim() || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await UserDAO.findUserByEmail(email.trim().toLowerCase(), {
      includePassword: true,
    });
    const passwordMatches = user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = signToken({ userId: user._id.toString() });
    const publicUser = { ...user };
    delete publicUser.password;

    return { token, user: publicUser };
  }
}
