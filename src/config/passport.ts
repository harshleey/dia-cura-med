import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { BadRequestError } from "../exceptions/bad-request.exception";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req: AuthRequest, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const roleInput = (req.query.role as string) || "PATIENT";
        const role = roleInput === "DOCTOR" ? "DOCTOR" : "PATIENT";

        if (!email) {
          return done(
            null,
            false,
            new BadRequestError("No email provided by Google"),
          );
        }

        let user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
          // New user - create account
          user = await prisma.users.create({
            data: {
              username: displayName.replace(/\s+/g, ""),
              email,
              role,
              provider: "google",
              providerId: profile.id,
            },
          });
        }

        // Generate tokens (like your normal login)
        const tokens = {
          accessToken: generateAccessToken(user),
          refreshToken: generateRefreshToken(user),
        };

        return done(null, { user, tokens });
      } catch (error) {
        console.error("Google Strategy Error:", error);
        done(error, false);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, false);
});

// passport.deserializeUser(async (id: string, done) => {
//   const user = await prisma.users.findUnique({ where: { id: Number(id) } });
//   done(null, user);
// });

passport.deserializeUser((obj, done) => {
  done(null, false);
});
export default passport;
