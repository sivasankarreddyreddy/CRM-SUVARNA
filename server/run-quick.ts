/**
 * Lightweight server starter that skips the lengthy database seeding process
 * This script is designed to start the server quickly for development and testing
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sessions } from "@shared/schema";
import { db } from "./db";
import { setupAuth } from "./auth";
import { seedMinimalData } from "./minimal-seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Quick start mode - using minimal data seeding...");
    
    // Check if session table exists and seed minimal data if needed
    try {
      const sessionCount = await db.select({ count: db.fn.count() }).from(sessions);
      log(`Found ${sessionCount[0].count} existing sessions`);
      
      // Check if we need to seed minimal data
      const userCount = await db.select({ count: db.fn.count() }).from(sessions);
      if (userCount[0].count === 0) {
        log("No users found - seeding minimal data...");
        await seedMinimalData();
      } else {
        log("Users found - skipping minimal seeding");
      }
    } catch (err) {
      log("Warning: Session table check failed. Attempting to seed minimal data...");
      console.error(err);
      await seedMinimalData();
    }
    
    // Register API routes
    const server = await registerRoutes(app);

    // Set up error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });

    // Setup vite/static file serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${port}`);
    });
    
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
})();