import { Router } from "express";
import { authMiddleWare } from "../../middlewares/auth.middleware";
import { requireVerifiedRole } from "../../middlewares/authorize-roles.middleware";
import { getDoctorRatings, getRating, rateDoctor } from "./rating.controller";

const router = Router();

router.post(
  "/ratings",
  authMiddleWare,
  requireVerifiedRole(["PATIENT"]),
  rateDoctor,
);

router.post(
  "/doctor",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR"]),
  getDoctorRatings,
);

router.get(
  "/:ratingId",
  authMiddleWare,
  requireVerifiedRole(["DOCTOR", "PATIENT"]),
  getRating,
);
