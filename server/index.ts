import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { crawlWebsite } from "./crawlingService"; // New: Import the centralized crawling service

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// ... existing middleware ...

(async () => {
  const server = await registerRoutes(app);

  // New: API endpoint for initiating website crawls
  app.post("/api/crawl", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required in the request body." });
      }

      // Basic URL validation to ensure it's a valid web address
      if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
        return res.status(400).json({ message: "Invalid URL format. Please provide a valid http(s) URL." });
      }

      // Execute the centralized crawling service
      const crawlResult = await crawlWebsite(url);
      log(`Crawl initiated for URL: ${url}. Result: ${JSON.stringify(crawlResult)}`);
      res.status(200).json({ message: "Crawl initiated successfully", result: crawlResult });
    } catch (error: any) {
      log(`Error during crawl initiation for URL ${req.body?.url || 'N/A'}: ${error.message}`);
      // Pass the error to the global error handling middleware
      next(error);
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Do not throw the error here, as it will crash the process if uncaught by other middleware
    // Express's error handling middleware should just handle the response.
  });