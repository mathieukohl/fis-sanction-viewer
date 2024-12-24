# FIS Sanction Viewer (fis-sanction-viewer)

A Quasar Project for viewing FIS-sanctioned athlete data. This project includes both a frontend built with Quasar and a backend API for fetching data from the FIS API.

## Prerequisites

- Node.js (v14 or later)
- Yarn or npm

## Install the dependencies

```bash
yarn
# or
npm install
```

## Start the frontend in development mode (hot-code reloading, error reporting, etc.)

```bash
npm run dev
```

## Start the backend

```bash
node server.js
```

The backend runs on `http://localhost:5001` and proxies requests to the FIS API.

## Lint the files

```bash
yarn lint
# or
npm run lint
```

## Format the files

```bash
yarn format
# or
npm run format
```

## Build the app for production

```bash
quasar build
```

## Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Features

- **Frontend:**

  - Built with Quasar and Vue.js.
  - Search and filter FIS-sanctioned athletes by discipline, season, and name.
  - Responsive design and dynamic data table.

- **Backend:**
  - Node.js with Express.
  - Fetches and filters data from the FIS API.
  - Supports filtering by discipline, season, and athlete name.
  - Combines data for multiple disciplines in a single request.

## How to Use

1. **Start the backend:**
   ```bash
   node server.js
   ```
2. **Start the frontend:**
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:8080` (default Quasar development server).

## Notes

- Make sure the backend is running on `http://localhost:5001` before starting the frontend.
- The backend handles rate limiting and data filtering for efficient querying of the FIS API.
