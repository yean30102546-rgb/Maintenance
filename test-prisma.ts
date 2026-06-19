import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/index.js";

async function main() {
  try {
    const prisma = new PrismaClient();
    console.log("Success with no args");
  } catch (e) {
    console.log("Error with no args:", e.message);
  }

  try {
    const prisma = new PrismaClient({});
    console.log("Success with {}");
  } catch (e) {
    console.log("Error with {}:", e.message);
  }

  try {
    const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });
    console.log("Success with { accelerateUrl }");
    const count = await prisma.user.count();
    console.log("Count:", count);
  } catch (e) {
    console.log("Error with { accelerateUrl }:", e.message);
  }

  try {
    const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
    console.log("Success with { datasourceUrl }");
  } catch (e) {
    console.log("Error with { datasourceUrl }:", e.message);
  }
}

main();
