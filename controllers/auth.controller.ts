import { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  updateRefreshToken,
} from "../services/auth.service";
import { validation } from "../validators/register.validation";
import { loginValidation } from "../validators/login.validation";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function register(req: Request, res: Response) {
  try {
    const validatedData = validation.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        errors: validatedData.error.issues,
      });
    }

    const { email, password } = validatedData.data;

    const user = await registerUser(email, password);

    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}

export async function login(req: Request, res: Response) {
  const validatedData = loginValidation.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({
      Errors: validatedData.error.issues,
    });
  }

  try {
    const { email, password } = validatedData.data;

    const result = await loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}

export async function me(req: Request, res: Response) {
  const user = (req as any).user;

  res.json({
    message: "Authenticated",
    user,
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token required",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRETKEY!,
    ) as any;

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const tokens = await updateRefreshToken(refreshToken);

    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRETKEY!,
      { expiresIn: "20m" },
    );

    res.json({
      accessToken: newToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Invalid refresh token",
    });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required",
    });
  }

  try {
    const result = await logoutUser(refreshToken);

    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const users = prisma.user.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const totalUsers = await prisma.user.count();

    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      page,
      limit,
      totalPages,
      totalUsers,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to find user",
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      message: "Email not found",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 100);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  res.json({
    message: "Password reset token generated",
    token,
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }

  if (resetToken.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Token expired",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  res.json({
    message: "Password reset successful",
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body;

  const verifyToken = await prisma.emailVerifyToken.findUnique({
    where: { token },
  });

  if (!verifyToken) {
    return res.status(400).json({
      message: "Invalid verification token",
    });
  }

  if (verifyToken.expiresAt < new Date()) {
    return res.status(400).json({
      message: "Token expired",
    });
  }

  await prisma.user.update({
    where: { id: verifyToken.userId },
    data: { isVerified: true },
  });

  await prisma.emailVerifyToken.delete({
    where: { token },
  });

  res.json({
    message: "Email verified successfully",
  });
}
