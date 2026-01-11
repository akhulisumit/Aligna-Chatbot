
# Overview

This is an AI chatbot creation platform called "ALIGNA" that allows users to build intelligent chatbots by uploading content and customizing their behavior. The application provides a complete workflow from content upload to chatbot deployment, featuring a modern React frontend with a Node.js/Express backend and PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for dark theme and glassmorphism effects
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **Development Server**: Custom Vite integration for development with HMR support

## Database Layer
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Storage Strategy**: Dual storage implementation with in-memory fallback for development

## AI Integration
- **Provider**: Google Gemini 2.0 Flash model
- **Features**: Content processing, chatbot response generation, and web scraping capabilities
- **Rate Limiting**: Built-in request throttling (1 second intervals)
- **Content Processing**: Support for text and URL-based content ingestion

## Authentication & Session Management
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **User Management**: Basic user authentication with username/password

## Data Models
- **Users**: Basic user accounts with username/password authentication
- **Chatbots**: Configurable AI assistants with personality traits, themes, and knowledge bases
- **Chat Messages**: Conversation history storage with user/bot message tracking
- **Personality System**: Configurable traits including formality, detail level, and playfulness

## External Dependencies
- **UI Components**: Comprehensive Radix UI component library
- **Validation**: Zod for runtime type checking and validation
- **HTTP Client**: Axios for external API requests
- **Web Scraping**: Cheerio for HTML parsing and content extraction
- **Utilities**: Various utility libraries for date handling, styling, and development tools

## Development Features
- **Hot Module Replacement**: Vite-powered development with runtime error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Build Process**: Optimized production builds with esbuild for server bundling
- **Debugging**: Replit-specific development tools and error handling

# Deployment

## Render Deployment

This application is configured for deployment on [Render](https://render.com).

### Prerequisites
1. A Render account
2. Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Neon PostgreSQL database from [Neon](https://neon.tech)

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```bash
GOOGLE_API_KEY=your_google_api_key_here
SESSION_SECRET=your_session_secret_here
DATABASE_URL=your_neon_database_url_here
```

### Deploy Steps
1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` configuration
3. Set the following environment variables in Render dashboard:
   - `GOOGLE_API_KEY`
   - `SESSION_SECRET`
   - `DATABASE_URL`
4. Deploy the service

### Manual Configuration (if needed)
If Render doesn't auto-detect the configuration:
- **Service Type**: Web Service
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Runtime**: Node.js
- **Plan**: Starter (free tier)

The application will be available at your Render URL once deployed.
