require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma');

async function main() {
  let prisma;
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    
    console.log("Fetching machines...");
    const machines = await prisma.machine.findMany();
    console.log("Machines count:", machines.length);
    
    console.log("Fetching repair jobs...");
    const jobs = await prisma.repairJob.findMany();
    console.log("Jobs count:", jobs.length);
    
  } catch (e) {
    console.error("ERROR CODE:", e.code);
    console.error("ERROR META:", e.meta);
    console.error("ERROR MSG:", e.message);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
