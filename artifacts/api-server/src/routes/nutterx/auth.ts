import { Router, Request, Response } from "express";
import { User } from "../../models/User";
import { generateToken, authenticate, AuthRequest } from "../../middlewares/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    _id: req.user!._id,
    name: req.user!.name,
    email: req.user!.email,
    role: req.user!.role,
    createdAt: req.user!.createdAt,
    avatar: req.user!.avatar,
  });
});

export default router;
