  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Removing logLine truncation to ensure full API response JSON is visible for debugging.
      // This is crucial for pinpointing issues related to API route responses during crawling.
      // if (logLine.length > 80) {
      //   logLine = logLine.slice(0, 79) + "…";
      // }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => { // Changed _req to req to access request details
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the full error for debugging purposes, including the request method and path
    log(`ERROR: ${req.method} ${req.path} - Status ${status} - Message: ${message}`);
    log(err); // Log the entire error object, including stack trace

    if (!res.headersSent) { // Added check to prevent errors if headers are already sent
      res.status(status).json({ message });
    }
    // Do NOT throw err after attempting to send a response. This can lead to uncaught exceptions
    // and process termination after a response has already been sent or is in the process
    // of being sent. The error is now handled by logging and sending an appropriate HTTP response.
  });