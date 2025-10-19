# ARC AI Labs Website

## Overview
A modern website for ARC AI Labs featuring sleek animations, responsive design, and a clean black-and-white aesthetic. ARC AI Labs designs speech recognition systems that empower people who struggle to be heard, built on a patient-first philosophy and the principle that machines should adapt to people. Built with React, TypeScript, Tailwind CSS on the frontend and FastAPI on the backend.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + Uvicorn (Python)
- **Database**: SQLite
- **Styling**: Tailwind CSS with custom animations
- **Typography**: Montserrat font (Google Fonts)

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
- Hero section with powerful messaging: "From fractured words, a voice rises"
- Company philosophy section emphasizing speech recognition and patient-first approach
- Smooth scroll animations using Framer Motion
- Testimonials showcase with profile cards
- Call-to-action tiles for different audiences
- Contact form with backend integration
- Cookie consent banner
- Fully responsive design
- Black and white theme matching ARC logo
- "Persevere and Pioneer" company motto

## Company Philosophy
ARC AI Labs designs speech recognition systems that return agency, dignity, and freedom to those who fight to be heard. The company believes in building machines that adapt to people, not the other way around. With a patient-first, technology-uncompromised approach, every line of code serves a human purpose.

## Recent Changes
- Initial project setup (Oct 19, 2025)
- Created all frontend components with modern design
- Configured FastAPI backend with contact form endpoint
- Set up SQLite database for form submissions
- Integrated ARC AI Labs branding and logo
- Updated logo to larger, clearer ARC design (80px height) - Oct 19, 2025
- Changed typography to Montserrat font family for sleek, breathable design - Oct 19, 2025
- Updated philosophy and messaging to reflect speech recognition mission and patient-first approach - Oct 19, 2025

## API Endpoints
- `GET /` - API status check
- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check endpoint

## Development
The frontend runs on port 5000 with Vite dev server. The backend API is served through the same port via proxy configuration.
