import { Router, Request, Response } from "express";
import { Service } from "../../models/Service";
import { authenticate, requireAdmin, AuthRequest } from "../../middlewares/auth";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params["id"]);
    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }
    res.json(service);
  } catch {
    res.status(500).json({ message: "Failed to fetch service" });
  }
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, features, icon, category, popular } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: "Title and description are required" });
      return;
    }
    const service = new Service({ title, description, price, features: features || [], icon, category, popular: popular || false });
    await service.save();
    res.status(201).json(service);
  } catch {
    res.status(500).json({ message: "Failed to create service" });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(req.params["id"], req.body, { new: true });
    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }
    res.json(service);
  } catch {
    res.status(500).json({ message: "Failed to update service" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Service.findByIdAndDelete(_req.params["id"]);
    res.json({ message: "Service deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete service" });
  }
});

export default router;
