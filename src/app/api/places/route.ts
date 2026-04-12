import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get("keyword")?.trim() || "";
    const tagIds = searchParams.getAll("tags");
    const facilityIds = searchParams.getAll("facilities");

    const where: Prisma.PlaceWhereInput = {
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { address: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      }),

      ...(tagIds.length > 0 && {
        tags: {
          some: {
            tag: {
              id: {
                in: tagIds,
              },
            },
          },
        },
      }),

      ...(facilityIds.length > 0 && {
        facilities: {
          some: {
            facility: {
              id: {
                in: facilityIds,
              },
            },
          },
        },
      }),
    };

    const places = await prisma.place.findMany({
      where,
      include: {
        createdBy: true,
        tags: { include: { tag: true } },
        facilities: { include: { facility: true } },
        favorites: true,
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

    return NextResponse.json({
      places: safePlaces,
      total: safePlaces.length,
    });
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

    const { name, address, lat, lng, tags = [], facilities = [], description = null } = await req.json();

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
        description,
        createdById: session.user.id,
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
      include: {
        createdBy: true,
        tags: { include: { tag: true } },
        facilities: { include: { facility: true } },
        favorites: true,
      },
    });

    return NextResponse.json(place);
  } catch (error) {
    console.error("POST /api/places failed:", error);
    return NextResponse.json(
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}