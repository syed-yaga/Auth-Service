import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(req.headers);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({
      message: "Authorization header missing",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY!);

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Invalid token",
    });
  }
}
