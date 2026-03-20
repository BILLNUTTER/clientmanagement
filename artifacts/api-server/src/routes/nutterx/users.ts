import { Router, Response } from "express";
import { User } from "../../models/User";
import { authenticate, AuthRequest } from "../../middlewares/auth";

const router = Router();

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params["id"]).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
