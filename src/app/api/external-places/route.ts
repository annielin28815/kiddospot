import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { Prisma, ExternalSourceType } from "@prisma/client";

function getSourceLabel(sourceType: ExternalSourceType) {
  switch (sourceType) {
    case "GOV_FAMILY_TOILET":
      return "政府資料｜親子廁所";
    case "GOV_NURSING_ROOM":
      return "政府資料｜哺乳室";
    case "GOV_PARENTING_CENTER":
      return "政府資料｜親子館";
    default:
      return "政府資料";
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword")?.trim() || "";
    const sourceTypes = searchParams.getAll("sourceTypes") as ExternalSourceType[];
    const facilityNames = searchParams.getAll("facilityNames");
    const hasLatLngOnly = searchParams.get("hasLatLngOnly") === "true";

    const validSourceTypes = sourceTypes.filter((type) =>
      Object.values(ExternalSourceType).includes(type)
    );

    const where: Prisma.ExternalPlaceWhereInput = {
      isActive: true,
    
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { address: { contains: keyword, mode: "insensitive" } },
          { note: { contains: keyword, mode: "insensitive" } },
          { city: { contains: keyword, mode: "insensitive" } },
          { district: { contains: keyword, mode: "insensitive" } },
        ],
      }),
    
      ...(validSourceTypes.length > 0 && {
        sourceType: {
          in: validSourceTypes,
        },
      }),
    
      ...(facilityNames.length > 0 && {
        facilities: {
          some: {
            facility: {
              name: {
                in: facilityNames,
              },
            },
          },
        },
      }),
    
      ...(hasLatLngOnly && {
        lat: { not: null },
        lng: { not: null },
      }),
    };

    const externalPlaces = await prisma.externalPlace.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        facilities: {
          include: {
            facility: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedPlaces = externalPlaces.map((place) => ({
      id: place.id,
      name: place.name,
      description: null,
      address: place.address ?? "",
      lat: place.lat,
      lng: place.lng,

      avgRating: null,
      reviewCount: 0,

      createdAt: place.createdAt,
      createdById: null,
      createdBy: null,
      favorites: [],

      sourceType: place.sourceType,
      sourceLabel: getSourceLabel(place.sourceType),

      city: place.city,
      district: place.district,
      phone: place.phone,
      openTime: place.openTime,
      note: place.note,
      officialUrl: place.officialUrl,

      // tags: place.tags.map((item) => item.tag),
      tags: [],
      facilities: place.facilities.map((item) => item.facility),
    }));

    return NextResponse.json({
      places: formattedPlaces,
      total: formattedPlaces.length,
    });
  } catch (error) {
    console.error("GET /api/external-places failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch external places" },
      { status: 500 }
    );
  }
}