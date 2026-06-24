const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function run() {
  const u1 = await prisma.user.findFirst({where:{role:'user'},orderBy:{createdAt:'asc'}});
  const u2 = await prisma.user.findFirst({where:{role:'technician'},orderBy:{createdAt:'asc'}});
  console.log('User 1:', u1?.fullname, u1?.role, u1?.supabaseAuthId);
  console.log('User 2:', u2?.fullname, u2?.role, u2?.supabaseAuthId);
}

run().finally(() => prisma.$disconnect());
