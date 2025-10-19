# ARC AI Labs Website

## Overview
A modern, Neuralink-inspired website for ARC AI Labs featuring sleek animations, responsive design, and a clean black-and-white aesthetic. Built with React, TypeScript, Tailwind CSS on the frontend and FastAPI on the backend.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + Uvicorn (Python)
- **Database**: SQLite
- **Styling**: Tailwind CSS with custom animations

## Project Structure
```
.
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Mission.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── CookieConsent.tsx
│   │   ├── assets/         # Images and static assets
│   │   ├── App.tsx         # Main app component
│   │   └── index.css       # Global styles with Tailwind
│   ├── vite.config.ts      # Vite configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
├── backend/                # FastAPI backend
│   └── main.py            # API endpoints and database logic
└── attached_assets/        # Original assets (logo, etc.)
```

## Features
- Hero section with animated headlines
- Smooth scroll animations using Framer Motion
- Testimonials showcase with profile cards
- Call-to-action tiles for different audiences
- Contact form with backend integration
- Cookie consent banner
- Fully responsive design
- Black and white theme matching ARC logo

## Recent Changes
- Initial project setup (Oct 19, 2025)
- Created all frontend components with Neuralink-inspired design
- Configured FastAPI backend with contact form endpoint
- Set up SQLite database for form submissions
- Integrated ARC AI Labs branding and logo

## API Endpoints
- `GET /` - API status check
- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check endpoint

## Development
The frontend runs on port 5000 with Vite dev server. The backend API is served through the same port via proxy configuration.
