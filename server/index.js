import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(express.json());
app.use(cors());

// Simulated user — securely hashed password
const USERS = [
  {
    userId: "Admin", // ✅ simple username, no email
    passwordHash: await bcrypt.hash("Rangwala", 10),
  },
];

// POST /api/login
app.post("/api/login", async (req, res) => {
  const { userId, password } = req.body; // ✅ changed
  const user = USERS.find((u) => u.userId === userId);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Auth API running on http://localhost:${PORT}`));
