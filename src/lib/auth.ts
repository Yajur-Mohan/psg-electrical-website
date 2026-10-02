import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { adminRepository } from "./db/admin-repository";

// HYDRA §6.1: bcrypt password hashes, short-lived signed JWT with a role claim,
// stored in an httpOnly cookie so client JS can never read it.

export const SESSION_COOKIE = "hydra_session";
const SESSION_HOURS = 8;

export type Session = { adminId: number; username: string; role: "admin" };

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(s);
}

export async function verifyCredentials(username: string, password: string): Promise<Session | null> {
  adminRepository.ensureSeeded();
  const admin = adminRepository.findByUsername(username);
  // Compare against a dummy hash when the user is unknown to keep timing similar
  const hash = admin?.password_hash ?? "$2b$12$5CAFHYF8DMHv.Php0XJyO.O3FxGuxZoXLhxfcR.XmuA/UKDVEujMG";
  const ok = await bcrypt.compare(password, hash);
  if (!admin || !ok) return null;
  return { adminId: admin.admin_id, username: admin.username, role: "admin" };
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ username: session.username, role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.adminId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || !payload.sub) return null;
    return { adminId: Number(payload.sub), username: String(payload.username), role: "admin" };
  } catch {
    return null;
  }
}
