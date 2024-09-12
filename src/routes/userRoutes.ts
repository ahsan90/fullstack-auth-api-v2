import { Router } from "express";
import { register, updateUser, deleteUser, getCurrentUser} from "../controllers/userController";
import { validateRegisterUser, validateUdpateUser, validateCreateUser } from "../validators/index";
import authenticateJWT from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", validateRegisterUser, register);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/update', authenticateJWT, validateUdpateUser, updateUser);
router.delete('/delete', authenticateJWT, deleteUser)


export default router