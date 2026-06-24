import { prisma } from '../src/lib/prisma';
async function main() {
  await prisma.pmTemplate.deleteMany({});
  console.log('Deleted all templates');
}
main().catch(console.error).finally(() => prisma.$disconnect());
