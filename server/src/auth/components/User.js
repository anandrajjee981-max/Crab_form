/**
 * Domain user component.
 *
 * This is not a Mongoose model. It represents the user data used by the
 * application while UserSchema is responsible for persistence.
 */
export default class User {
  constructor({ name, email, password }) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  toPersistence() {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
    };
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
