const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.tag.createMany({
    data: [
      { name: "室內" },
      { name: "戶外" },
      { name: "餐飲" },
      { name: "景點" },
      { name: "住宿" },
    ],
    skipDuplicates: true,
  });

  await prisma.facility.createMany({
    data: [
      { name: "尿布台" },
      { name: "哺乳室" },
      { name: "飲水機" },
      { name: "推車友善" },
      { name: "親子廁所" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log("🌱 seed done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });