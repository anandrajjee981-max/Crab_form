import UserBuilder from "../builder/UserBuilder.js";
import UserDAO from "../dao/UserDAO.js";

export default class RegisterActivity {
  static async execute({ name, email, password }) {
    if (!name?.trim() || !email?.trim() || !password) {
      const error = new Error("Name, email, and password are required");
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 8) {
      const error = new Error("Password must be at least 8 characters"); 
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserDAO.findUserByEmail(normalizedEmail);

    if (existingUser) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    const user = await UserBuilder.build({ name, email, password });
    const savedUser = await UserDAO.createUser(user);
    const publicUser = savedUser.toObject();
    delete publicUser.password;

    return publicUser;
  }
}
