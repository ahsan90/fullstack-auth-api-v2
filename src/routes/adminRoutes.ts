import { Router } from "express";
import {
  getAllUsers,
  createUser,
  deleteUserById,
  getUserRoles,
  updateUserById
} from "../controllers/adminController";
import { validateCreateUser, validateUdpateUserByAdmin } from "../validators/index";
import authenticateJWT, {
  authenticateAdminUser,
} from "../middlewares/authMiddleware";
const router = Router();

router.use(authenticateJWT, authenticateAdminUser);

router.get("/users", getAllUsers);
router.post("/users", validateCreateUser, createUser);
router.put('/users/:userId', validateUdpateUserByAdmin , updateUserById)
router.delete("/users/:userId", deleteUserById);
router.get("/roles", getUserRoles);

export default router;
