import { NextResponse } from "next/server";
import { getCurrentUser, SessionUser } from "./auth";

export async function getSessionUser(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    role: user.role,
    teamId: user.teamId,
    orgCompanyId: user.orgCompanyId,
  };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message?: string) {
  return NextResponse.json({ error: message ?? "Forbidden" }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message?: string) {
  return NextResponse.json({ error: message ?? "Internal Server Error" }, { status: 500 });
}
