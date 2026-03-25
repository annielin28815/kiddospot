import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth";

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
        favorites: {
          select: {
            userId: true,
          }
        },
        createdBy: {
          select: {
            name: true,
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
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
  
    const body = await req.json();

    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return Response.json({ error: "Invalid lat/lng" }, { status: 400 });
    }

    const place = await prisma.place.create({
      data: {
        ...body,
        lat,
        lng,
        createdById: session.user.id
      },
    });
  
    return Response.json(place);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}