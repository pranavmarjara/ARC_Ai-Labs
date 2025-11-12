# ARC AI Labs Website

## Overview
A modern website for ARC AI Labs featuring sleek animations, responsive design, and a clean black-and-white aesthetic. ARC AI Labs designs speech recognition systems that empower people who struggle to be heard, built on a patient-first philosophy and the principle that machines should adapt to people. Built with React, TypeScript, Tailwind CSS on the frontend and FastAPI on the backend.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + Uvicorn (Python)
- **Database**: SQLite
- **Styling**: Tailwind CSS with custom animations
- **Typography**: Inter font (Google Fonts)

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
│   │   │   ├── ContactForm.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   └── ScrollToTop.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ResearchDevelopment.tsx
│   │   │   ├── ClinicalTrials.tsx
│   │   │   ├── ARCResearch.tsx
│   │   │   └── GetInvolved.tsx
│   │   ├── assets/         # Images and static assets
│   │   ├── App.tsx         # Main app component with routing
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
- Changed typography to Inter font family for clean, tech-forward aesthetic - Oct 19, 2025
- Updated philosophy and messaging to reflect speech recognition mission and patient-first approach - Oct 19, 2025
- Prepared project for Netlify deployment via GitHub (Oct 21, 2025)
- Added environment variable support for API endpoints
- Created deployment configuration and documentation
- Added high-quality stock images to CTA cards: sound waves (research) and robotic eye (vision) - Oct 22, 2025
- Implemented React Router for multi-page navigation - Oct 22, 2025
- Created Research & Development page showcasing 3-phase data pipeline (Collection → Training → Validation) - Oct 22, 2025
- Created Clinical Trials page highlighting patient-first methodology and collaboration approach - Oct 22, 2025
- Fixed scroll-to-top behavior on page navigation with ScrollToTop component - Oct 22, 2025
- Created stunning "Get Involved" page (/get-involved) with animated gradients, multiple sections, and prominent "Join Us!" CTA - Oct 22, 2025
- Connected "Get Involved" buttons in Navbar and Clinical Trials page to new contributor applications page - Oct 22, 2025
- Integrated Google Form for contributor applications (https://forms.gle/UWVjRFVK4foqz3Lv9) - Oct 22, 2025
- Made ARC logo in navbar clickable to navigate back to homepage with hover effect - Oct 22, 2025
- Added LinkedIn and email contact buttons to "Meet Our Pioneers" section for both co-founders with secure links and accessibility features - Oct 26, 2025
- Created comprehensive "ARC × Research" page (/arc-research) showcasing research validation, methodology, key findings, publications, and research team with purple/pink gradient theme - Nov 8, 2025
- Removed Technology section (CTASection component) from homepage and all navigation links - Nov 8, 2025
- Simplified ARC × Research page CTA: removed duplicate Get Involved button, kept single pink gradient button linking to /get-involved page - Nov 8, 2025
- Streamlined ARC × Research page by removing bullet points from methodology cards and eliminating "Transparent Publication" concept entirely - Nov 12, 2025
- Updated research overview section from 3 principle cards to 2 cards (Patient-First Design and Rapid Validation) with centered 2-column layout - Nov 12, 2025

## API Endpoints
- `GET /` - API status check
- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check endpoint

## Development
The frontend runs on port 5000 with Vite dev server. The backend API is served through the same port via proxy configuration.

## Deployment

### Frontend (Netlify)
The project is configured for Netlify deployment via GitHub:
- Build configuration: `netlify.toml`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variables: `VITE_API_URL` (points to deployed backend)
- See `DEPLOYMENT.md` for detailed instructions

### Backend (Render/Railway/Fly.io)
The FastAPI backend needs to be deployed separately:
- Requirements file: `backend/requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Database: SQLite (consider PostgreSQL for production)
- CORS: Configured to allow all origins
- See `DEPLOYMENT.md` for detailed instructions

### Environment Variables
- Local development: `frontend/.env` (git-ignored)
- Template: `frontend/.env.example`
- Production: Set `VITE_API_URL` in Netlify dashboard to your deployed backend URL
