import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
export const GET = async (request: NextRequest) => {
    try {

        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        console.log(error, "me failed");
        return NextResponse.json({ error: "Internal server error , me failed" }, { status: 500 })
    }

}