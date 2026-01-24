import { checkDatabaseConnection } from "@/app/lib/db"
import { NextResponse } from "next/server"


export const GET = async () => {
  const isConnected = await checkDatabaseConnection()
  if (!isConnected) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }
  return NextResponse.json({
    status: "ok",
    message: "Database connection successful"
  }, { status: 200 })
}