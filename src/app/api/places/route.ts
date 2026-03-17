import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      include: {
        facility: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(places);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}