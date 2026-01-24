import { NextResponse } from "next/server"

export const POST = async () => {
    const response = NextResponse.json({

        message: "Logout successful"
    }, {
        status: 200
    })

    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
    })

    return response
}