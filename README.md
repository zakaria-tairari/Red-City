# Red City

Red City is a full-stack tourism discovery platform for Marrakech. It helps users explore places, view them on a map, search and filter by category or tags, save favorites, write reviews, and browse multilingual place content. The project also includes an admin dashboard and a Python data engine for collecting, enriching, translating, and preparing tourism data.

## Features

- Interactive place discovery with list and map views
- Place details with gallery, description, tags, reviews, and related places
- Search, category filtering, tag filtering, sorting, and pagination
- User authentication, email verification, password reset, profile update
- Favorites and user review management
- Admin dashboard for places, categories, reviews, users, media, and statistics
- Multilingual frontend content with English, French, and Spanish support
- AI-assisted tag generation and automated translation pipeline
- Media download queue and storage status tracking
- API rate limiting, caching, resources, and role-based access control

## Architecture

The project is split into three main parts:

```text
red-city/
├── backend/      Laravel API, database, admin endpoints, auth, queues
├── frontend/     React + Vite client application
└── data-engine/  Python FastAPI ETL service for scraping, tagging, translation
```

## Tech Stack

**Backend:** Laravel, MySQL, Sanctum, Scout, Meilisearch, queues, Pest  
**Frontend:** React, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, Leaflet, Recharts  
**Data engine:** Python, FastAPI, Pandas, OpenAI-compatible API, OpenTranslate-compatible API  

## Getting Started

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Data Engine

```bash
cd data-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Configure the environment variables for database access, source APIs, AI tagging, and translation before running the full pipeline.

## Demo Accounts

After running the seeders, these local demo accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `password` |
| User | `demo@example.com` | `password` |

## API Documentation

The backend exposes REST endpoints for authentication, places, categories, tags, reviews, favorites, user profile, and admin operations. API documentation is generated from the Laravel backend using Scramble.

## Project Status

This project was developed as a PFE software engineering project. The main application features are implemented, with emphasis on a complete full-stack workflow, structured API design, admin operations, map-based discovery, and an external data enrichment pipeline.

