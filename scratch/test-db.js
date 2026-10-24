import { prisma } from '../backend/src/config/prisma.js';

async function main() {
  try {
    console.log('Connecting to Prisma...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Query succeeded:', result);
  } catch (err) {
    console.log('Query failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
