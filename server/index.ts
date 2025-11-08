  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error details internally for debugging, using the existing logger
    log(`ERROR: ${req.method} ${req.path} - Status: ${status} - Message: ${message}`);
    if (err.stack) {
        log(err.stack);
    } else {
        log(err);
    }

    // Only send a response if headers haven't been sent yet.
    // This prevents trying to send multiple responses or errors after headers are committed.
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    // Do NOT re-throw the error here. Once a response has been initiated/sent,
    // re-throwing can lead to uncaught promise rejections or process crashes
    // that are not gracefully handled by Express or Node.js. The error is considered
    // handled at this point for the request cycle, even if it signifies a server issue.
    // Process managers (like PM2) should restart the app based on its health or exit code,
    // not from an error re-thrown after a response.
  });