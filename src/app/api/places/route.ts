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

    return NextResponse.json(places);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // ⭐ 1. 檢查登入
    const session = await getServerSession(authOptions);
    console.log("API****" + session);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // ⭐ 2. 解析 body
    const { name, address, lat, lng, tags, facilities } =
      await req.json();

    // ⭐ 3. 基本驗證
    if (!name || !address || lat == null || lng == null) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400 }
      );
    }

    // ⭐ 4. 建立資料
    const place = await prisma.place.create({
      data: {
        name,
        address,
        lat,
        lng,
        createdById: session.user?.id,

        // userId: session.user.id, // ⭐ 關鍵（你之前問題點）

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

  // const { name, address, lat, lng, tags, facilities } = await req.json();

  // try {
  //   const session = await getServerSession(authOptions);

  //   if (!session?.user?.id) {
  //     return new Response("Unauthorized", { status: 401 });
  //   }
  
  //   const body = await req.json();

  //   const lat = Number(body.lat);
  //   const lng = Number(body.lng);

  //   if (isNaN(lat) || isNaN(lng)) {
  //     return Response.json({ error: "Invalid lat/lng" }, { status: 400 });
  //   }

  //   const place = await prisma.place.create({
  //     data: {
  //       name,
  //       address,
  //       lat,
  //       lng,

  //       tags: {
  //         create: tags.map((tagId: string) => ({
  //           tag: {
  //             connect: { id: tagId },
  //           },
  //         })),
  //       },

  //       facilities: {
  //         create: facilities.map((facilityId: string) => ({
  //           facility: {
  //             connect: { id: facilityId },
  //           },
  //         })),
  //       },
  //     },
  //   });
  
  //   return Response.json(place);
  // } catch (error) {
  //   console.error(error);
  //   return NextResponse.json(
  //     { error: "Failed to create place" },
  //     { status: 500 }
  //   );
  // }
}