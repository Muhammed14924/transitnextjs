import { NextResponse } from "next/server";
import { getSessionUser, unauthorized, serverError } from "@/app/lib/api-helper";
import { getUserPermissions } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const permissions = await getUserPermissions(user);
    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Permissions API error:", error);
    return serverError("Error fetching permissions");
  }
}
