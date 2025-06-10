import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon with timeout and error handling
try {
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineConnect = false;
  neonConfig.pipelineTLS = false;
  neonConfig.fetchConnectionCache = true;
} catch (error) {
  console.warn('WebSocket configuration warning:', error);
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with timeout configuration to prevent hanging
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500,
  allowExitOnIdle: true,
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle(pool, { schema });