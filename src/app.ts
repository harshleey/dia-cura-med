import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import compression from "compression";
import cookieParser from "cookie-parser";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";

import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import patientRoutes from "./modules/patients/patient.routes";
import doctorRoutes from "./modules/doctors/doctor.routes";
import profileRoutes from "./modules/profile/profile.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import chatRoutes from "./modules/chat/chat.routes";
import appointmentRoutes from "./modules/appointments/appointment.routes";

const app: Express = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());

// Basic session configuration (for development)
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "your-fallback-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Swagger setup
const swaggerDocument = YAML.load(
  path.join(__dirname, "config", "openapi.yaml"),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.get("/", express.static("public"));
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(errorHandler);

export default app;
