import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions, type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido nas variáveis de ambiente.");
}
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload: { userId: number }): string {
  const secret = JWT_SECRET as Secret;
  const opts = { expiresIn: JWT_EXPIRES_IN } as SignOptions;
  return jwt.sign(payload as string | object | Buffer, secret, opts) as string;
}

export function verifyToken(token: string): { userId: number } {
  const secret = JWT_SECRET as Secret;
  const decoded = jwt.verify(token, secret) as JwtPayload | string;
  if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
    throw new Error("Token inválido.");
  }
  const raw = (decoded as any).userId;
  const userId = typeof raw === "number" ? raw : Number(raw);
  if (Number.isNaN(userId)) throw new Error("Token inválido.");
  return { userId };
}

export function getTokenFromHeader(
  authorization?: string | null
): string | null {
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

export function getUserIdFromAuthHeader(authorization?: string | null): number {
  const token = getTokenFromHeader(authorization);
  if (!token) throw new Error("Token ausente");
  return verifyToken(token).userId;
}
