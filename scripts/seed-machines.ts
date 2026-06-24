import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  const machines = []
  for (let i = 1; i <= 26; i++) {
    const padded = i.toString().padStart(2, '0')
    machines.push(`FLF (${padded})`)
  }

  for (const name of machines) {
    await prisma.machine.upsert({
      where: { name },
      update: {},
      create: { name, status: 'active' }
    })
    console.log(`Upserted machine: ${name}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
