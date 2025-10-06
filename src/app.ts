import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";

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

export default app;
