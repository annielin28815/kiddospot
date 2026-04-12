import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await req.json();
    const userId = session.user.id;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_placeId: {
            userId,
            placeId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        action: "removed",
      });
    }

    await prisma.favorite.create({
      data: {
        userId,
        placeId,
      },
    });

    return NextResponse.json({
      success: true,
      action: "added",
    });
  } catch (error) {
    console.error("favorite toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}