import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./nutterx/auth";
import servicesRouter from "./nutterx/services";
import requestsRouter from "./nutterx/requests";
import chatsRouter from "./nutterx/chats";
import adminRouter from "./nutterx/admin";
import usersRouter from "./nutterx/users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/services", servicesRouter);
router.use("/requests", requestsRouter);
router.use("/chats", chatsRouter);
router.use("/admin", adminRouter);
router.use("/users", usersRouter);

export default router;
