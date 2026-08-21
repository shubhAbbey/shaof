# Development Guide

## Prerequisites

- Node.js >= 20.0.0 (Host installed: `v22.3.0`)
- npm >= 10.0.0 (Host installed: `10.8.1`)
- Docker & Docker Compose (Host installed: `Docker 27.1.1`, `Compose v2.29.1`)

## Getting Started

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the unified environment template to each application:

   ```bash
   cp .env.example .env
   ```

3. **Workspace Scripts:**
   - Run Storefront: `npm run dev:storefront` (Starts on `http://localhost:3000`)
   - Run Medusa Backend: `npm run dev:backend` (Starts on `http://localhost:9000`)
   - Run Strapi CMS: `npm run dev:cms` (Starts on `http://localhost:1337`)
   - Run All Checks:
     ```bash
     npm run lint
     npm run typecheck
     npm run test
     npm run build
     ```
