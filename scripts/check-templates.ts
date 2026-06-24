import { prisma } from '../src/lib/prisma'

async function main() {
  const templates = await prisma.pmTemplate.findMany({
    include: { items: true }
  })
  console.log(JSON.stringify(templates, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
