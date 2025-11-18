import { z } from "zod";
import { CreateRatingSchema } from "./rating.validation";

export type CreateRatingDTO = z.infer<typeof CreateRatingSchema>;
