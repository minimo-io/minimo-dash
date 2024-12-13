import bcrypt from "bcrypt";
import Database from "better-sqlite3";

// Initialize SQLite database
const db = new Database("src/databases/portfolio.db");

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const stmt = db.prepare(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      );
      stmt.run(email, hashedPassword);
      return { success: true, message: "User registered successfully." };
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        return { error: "Email already in use." };
      }
      return { error: "An unexpected error occurred." };
    }
  },
};
