import { env } from '../backend/src/config/env.js';
import { isDbReachable } from '../backend/src/config/prisma.js';

console.log('Testing isDbReachable...');
const start = Date.now();
isDbReachable().then((res) => {
  console.log('isDbReachable result:', res, 'took:', Date.now() - start, 'ms');
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
