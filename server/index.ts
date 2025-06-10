import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { runMigrations } from "./migrations";
import { createSalesTargetsTable } from "./sales-targets-migration";
import { migrateLeads } from "./leads-migration";
import { addModuleIdColumn } from "./module-id-column-migration";
import { addTaskModifiedColumns } from "./tasks-modified-columns-migration";
import { addLeadModifiedColumns } from "./leads-modified-columns-migration";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  // Add process timeout handler to prevent hanging
  const startupTimeout = setTimeout(() => {
    console.error('Startup timeout - forcing exit to prevent hanging');
    process.exit(1);
  }, 30000); // 30 second timeout

  // Run migrations first with timeout handling
  try {
    log("Starting database initialization...");
    
    await Promise.race([
      runMigrations(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Migration timeout')), 10000)
      )
    ]);
    log("Database migrations completed");
    
    await Promise.race([
      createSalesTargetsTable(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sales targets table timeout')), 5000)
      )
    ]);
    log("Sales targets table creation completed");
    
    await Promise.race([
      migrateLeads(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Leads migration timeout')), 5000)
      )
    ]);
    log("Leads migration completed");
    
    await Promise.race([
      addModuleIdColumn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Module ID migration timeout')), 5000)
      )
    ]);
    log("Module ID column migration completed");
    
    await Promise.race([
      addTaskModifiedColumns(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tasks migration timeout')), 5000)
      )
    ]);
    log("Tasks modified columns migration completed");
    
    await Promise.race([
      addLeadModifiedColumns(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Leads modified migration timeout')), 5000)
      )
    ]);
    log("Leads modified columns migration completed");
    
    log("Database initialization completed successfully");
  } catch (error) {
    log(`Database initialization error: ${(error as Error).message}`);
    log("Continuing with server startup despite database errors...");
  }

  // Clear the startup timeout since we've completed initialization
  clearTimeout(startupTimeout);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error("Server error:", err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
