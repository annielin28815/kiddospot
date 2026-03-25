import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await req.json();

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_placeId: {
          userId: session.user.id,
          placeId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_placeId: {
            userId: session.user.id,
            placeId,
          },
        },
      });

      return Response.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        placeId,
      },
    });

    return Response.json({ favorited: true })
  } catch (error) {
    console.error("🔥 FAVORITE ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}