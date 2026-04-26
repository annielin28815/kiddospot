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
            tagId: {
              in: tagIds,
            },
          },
        },
      }),

      ...(facilityIds.length > 0 && {
        facilities: {
          some: {
            facilityId: {
              in: facilityIds,
            },
          },
        },
      }),
    };

    const places = await prisma.place.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        lat: true,
        lng: true,
        googlePlaceId: true,
        avgRating: true,
        reviewCount: true,
        createdAt: true,
        createdById: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        tags: {
          select: {
            tagId: true,
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        facilities: {
          select: {
            facilityId: true,
            facility: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        favorites: {
          select: {
            // id: true,
            userId: true,
            placeId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      places,
      total: places.length,
    });
  } catch (error) {
    console.error("[GET /api/places]", error);
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