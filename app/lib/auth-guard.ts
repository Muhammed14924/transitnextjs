import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission, SessionUser } from "./auth";
import { Permission } from "./permissions";

export const requireAuth = async (): Promise<SessionUser | NextResponse> => {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return {
    id: user.id,
    role: user.role,
    teamId: user.teamId,
    orgCompanyId: user.orgCompanyId
  } as SessionUser;
};

export const requirePermission = async (permission: Permission): Promise<SessionUser | NextResponse> => {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const user = authResult as SessionUser;
  const hasPerm = await hasPermission(user, permission);
  
  if (!hasPerm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  return user;
};
