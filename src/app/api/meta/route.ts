import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const [tags, facilities] = await Promise.all([
      prisma.tag.findMany(),
      prisma.facility.findMany(),
    ]);

    return NextResponse.json({
      tags,
      facilities,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}