import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { users, settings } from "../../schema";
import { generateToken, authenticate, AuthRequest } from "../../middlewares/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();

    const [regSetting] = await db.select().from(settings).where(eq(settings.key, "registration_enabled")).limit(1);
    if (regSetting && regSetting.value === "false") {
      res.status(403).json({ message: "New registrations are currently disabled. Please contact the admin." });
      return;
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "user",
    }).returning();

    const token = generateToken(user.id);
    res.status(201).json({
      token,
      user: { _id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: { _id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const u = req.user!;
  res.json({ _id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, avatar: u.avatar });
});

export default router;
