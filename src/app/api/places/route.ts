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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const place = await prisma.place.create({
      data: {
        name: body.name,
        address: body.address,
        lat: Number(body.lat),
        lng: Number(body.lng),
        description: body.description || "",
      },
    });

    return NextResponse.json(place);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}