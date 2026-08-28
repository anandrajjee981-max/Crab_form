import bcrypt from "bcryptjs";
import User from "../components/User.js";

export default class UserBuilder {
  static async build({ name, email, password }) {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    return new User({
      name: normalizedName,
      email: normalizedEmail,
      password: passwordHash,
    });
  }
}
