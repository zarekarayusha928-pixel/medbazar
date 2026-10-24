import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.__prismaClient ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

import net from 'node:net';

// Fast TCP socket reachability helper
function checkSocket(host: string, port: number, timeoutMs = 250): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.unref();
    let resolved = false;

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      resolved = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    try {
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

// Connection reachability checker with circuit-breaker cooldown
let isOnline: boolean | null = null;
let lastCheckTime = 0;
const RECHECK_COOLDOWN_MS = 15000;

export async function isDbReachable(): Promise<boolean> {
  // If running in test mode without an explicit PostgreSQL instance flag, bypass to in-memory store
  if (process.env.NODE_ENV === 'test' && !process.env.FORCE_DB) {
    return false;
  }

  const now = Date.now();
  if (isOnline === false && now - lastCheckTime < RECHECK_COOLDOWN_MS) {
    return false;
  }

  try {
    let host = 'localhost';
    let port = 5432;
    if (env.DATABASE_URL) {
      try {
        const parsed = new URL(env.DATABASE_URL.replace('postgresql://', 'http://'));
        host = parsed.hostname || 'localhost';
        port = parsed.port ? parseInt(parsed.port, 10) : 5432;
      } catch {
        // default
      }
    }

    const socketOpen = await checkSocket(host, port, 250);
    if (!socketOpen) {
      isOnline = false;
      lastCheckTime = now;
      return false;
    }

    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1000)),
    ]);
    isOnline = true;
    lastCheckTime = now;
    return true;
  } catch (_err) {
    isOnline = false;
    lastCheckTime = now;
    return false;
  }
}

