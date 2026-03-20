import { Router, Response } from "express";
import { ServiceRequest } from "../../models/ServiceRequest";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import mongoose from "mongoose";

const router = Router();

router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, serviceName, description, requirements } = req.body;
    if (!serviceName || !description) {
      res.status(400).json({ message: "Service name and description are required" });
      return;
    }
    const request = new ServiceRequest({
      user: req.user!._id,
      serviceId: serviceId || undefined,
      serviceName,
      description,
      requirements,
    });
    await request.save();
    await request.populate("user", "name email");
    res.status(201).json(formatRequest(request));
  } catch {
    res.status(500).json({ message: "Failed to submit request" });
  }
});

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await ServiceRequest.find({ user: req.user!._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(requests.map(formatRequest));
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await ServiceRequest.findOne({
      _id: req.params["id"],
      user: req.user!._id,
    }).populate("user", "name email");
    if (!request) {
      res.status(404).json({ message: "Request not found" });
      return;
    }
    res.json(formatRequest(request));
  } catch {
    res.status(500).json({ message: "Failed to fetch request" });
  }
});

function formatRequest(req: any) {
  const obj = req.toObject ? req.toObject() : req;
  let daysRemaining: number | undefined;
  if (obj.subscriptionEndsAt) {
    const msLeft = new Date(obj.subscriptionEndsAt).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }
  return { ...obj, daysRemaining };
}

export { formatRequest };
export default router;
