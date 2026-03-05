import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export type AuthResult =
  | { user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; error: null }
  | { user: null; error: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function requireRole(...roles: Role[]): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;
  if (!roles.includes(result.user!.role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: result.user!, error: null };
}

export const CAN_WRITE_ROLES = [Role.ADMIN, Role.MANAGER] as const;
