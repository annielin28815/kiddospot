import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/auth";

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      include: {
        createdBy: true,
        tags: { include: { tag: true } },
        facilities: { include: { facility: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safePlaces = places.map((place) => ({
      ...place,
      tags: place.tags ?? [],
      facilities: place.facilities ?? [],
    }));

    return NextResponse.json(safePlaces);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { name, address, lat, lng, tags, facilities } =
      await req.json();

    if (!name || !address || lat == null || lng == null) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400 }
      );
    }

    const place = await prisma.place.create({
      data: {
        name,
        address,
        lat,
        lng,
        createdById: session.user?.id,
        tags: {
          create: tags.map((tagId: string) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },

        facilities: {
          create: facilities.map((facilityId: string) => ({
            facility: {
              connect: { id: facilityId },
            },
          })),
        },
      },
    });

    return NextResponse.json(place);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}