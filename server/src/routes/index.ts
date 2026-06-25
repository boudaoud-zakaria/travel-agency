import { Router } from "express";
import authRouter from "./auth";
import packagesRouter from "./packages";
import reservationsRouter from "./reservations";
import employeesRouter from "./employees";
import dashboardRouter from "./dashboard";
import schedulesRouter from "./schedules";
import activityLogsRouter from "./activity-logs";
import notificationsRouter from "./notifications";
import contactRouter from "./contact";
import testimonialsRouter from "./testimonials";
import settingsRouter from "./settings";
import customRequestsRouter from "./custom-requests";

const router = Router();

router.use("/auth", authRouter);
router.use("/packages", packagesRouter);
router.use("/reservations", reservationsRouter);
router.use("/employees", employeesRouter);
router.use("/stats", dashboardRouter);
router.use("/schedules", schedulesRouter);
router.use("/activity-logs", activityLogsRouter);
router.use("/notifications", notificationsRouter);
router.use("/contact", contactRouter);
router.use("/testimonials", testimonialsRouter);
router.use("/settings", settingsRouter);
router.use("/custom-requests", customRequestsRouter);

export default router;
