import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: "Too many attempts, try after 1 min",
});
