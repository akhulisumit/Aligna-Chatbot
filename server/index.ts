  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for debugging purposes
    log(`ERROR: ${req.method} ${req.path} - Status: ${status} - Message: ${message} - Details: ${err.stack || err}`);

    res.status(status).json({ message });
    // Do NOT re-throw the error after sending a response.
    // Re-throwing an error in an Express error handler can lead to unhandled promise rejections
    // or uncaught exceptions, potentially crashing the Node.js process.
  });