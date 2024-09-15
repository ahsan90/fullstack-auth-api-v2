import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  varifyResetToken,
} from "../controllers/authController";
import { validateLogin, validateResetPassword } from "../validators/index";
import authenticateJWT from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", validateLogin, login);
router.post('/logout', authenticateJWT, logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/varify-reset-token', varifyResetToken);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/refresh-access-token', authenticateJWT, refreshAccessToken)

export default router;

