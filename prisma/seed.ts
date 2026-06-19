import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding machines...')

  const machines = [
    { name: 'CNC-01', dept: 'Production' },
    { name: 'CNC-02', dept: 'Production' },
    { name: 'Lathe-A', dept: 'Production' },
    { name: 'Conveyor-Main', dept: 'Maintenance' },
    { name: 'AirCompressor-1', dept: 'Maintenance' },
    { name: 'Spectrometer-X', dept: 'QC' },
    { name: 'Microscope-Z', dept: 'QC' },
    { name: 'Forklift-01', dept: 'Warehouse' },
    { name: 'Forklift-02', dept: 'Warehouse' },
    { name: 'Printer-HR', dept: 'Admin' },
  ]

  for (const m of machines) {
    await prisma.machine.upsert({
      where: { name: m.name },
      update: {},
      create: {
        name: m.name,
        dept: m.dept,
        status: 'active',
      },
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
