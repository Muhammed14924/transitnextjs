import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 1. Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        text,
        isUser: true,
        userId: user.id,
      },
    });

    // 2. Mock AI response (Phase 3: Integration with LLM/n8n)
    let aiResponseText = `لقد استلمت رسالتك: "${text}". في المرحلة القادمة، سيتم ربط هذا المساعد ببياناتك المرفوعة عبر n8n أو LangChain لتحليل المستندات بدقة.`;

    // Simple context-aware mock for demo purposes
    if (text.includes("فاتورة") || text.includes("شحنة")) {
      aiResponseText =
        "قمت بمراجعة آخر الشحنات المرفوعة. يبدو أن هناك شحنة من شركة النور تم استلامها بتاريخ 25 مارس.";
    }

    const aiMessage = await prisma.chatMessage.create({
      data: {
        text: aiResponseText,
        isUser: false,
        userId: user.id,
      },
    });

    return NextResponse.json({ userMessage, aiMessage });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
