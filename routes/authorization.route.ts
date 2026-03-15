import { Router } from "express";
import { authorization } from "../middleware/authorization.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { getAllUsers } from "../controllers/auth.controller";

const router = Router();

router.get("/users", authenticate, authorization("ADMIN"), getAllUsers);

export default router;
