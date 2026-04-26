import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const [tags, facilities] = await Promise.all([
      prisma.tag.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      prisma.facility.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json(
      {
        tags,
        facilities,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/meta]", err);

    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}