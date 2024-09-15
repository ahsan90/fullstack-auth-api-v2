import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorMiddleware";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import './config/passportStrategies';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// All routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

export default app;
