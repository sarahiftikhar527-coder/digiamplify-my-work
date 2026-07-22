# DigiAmplify Monorepo

Welcome to the DigiAmplify monorepo! This project is organized as an npm workspaces monorepo.

## Project Structure

- `frontend/`: The Next.js web application.
- `backend/`: Node/Express backend space (placeholder for portal APIs).

## Getting Started

### Installation

To install all dependencies across the entire monorepo, run this command from the root directory:

```bash
npm install
```

### Development

To start the frontend development server:

```bash
npm run dev
```

To run a production build of the frontend:

```bash
npm run build
```

This root configuration routes all commands to the appropriate workspace using npm workspace flags.
