import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function registerUser(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already Exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerifyToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    verifyToken: token,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Email does not exist");
  }

  if (!user?.isVerified) {
    throw new Error("Please verify your email first");
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user.id, userRole: user.role },
    process.env.JWT_SECRETKEY!,
    {
      expiresIn: "20m",
    },
  );

  const refreshToken = jwt.sign(
    { userId: user.id, userRole: user.role },
    process.env.JWT_REFRESH_SECRETKEY!,
    { expiresIn: "7d" },
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
    refreshToken,
  };
}

export async function logoutUser(refreshToken: string) {
  const token = await prisma.refreshToken.findUnique({
    where: {
      token: refreshToken,
    },
  });

  if (!token) {
    throw new Error("Invalid refresh token");
  }

  await prisma.refreshToken.delete({
    where: { token: refreshToken },
  });

  return { message: "Logout successfully" };
}

export async function updateRefreshToken(refreshToken: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRETKEY!,
  ) as any;

  const newAccessToken = jwt.sign(
    { userId: decoded.userId },
    process.env.JWT_SECRETKEY!,
    { expiresIn: "20m" },
  );

  const newRefreshToken = jwt.sign(
    { userId: decoded.userId },
    process.env.JWT_REFRESH_SECRETKEY!,
    { expiresIn: "7d" },
  );

  await prisma.$transaction([
    prisma.refreshToken.delete({
      where: { token: refreshToken },
    }),

    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
