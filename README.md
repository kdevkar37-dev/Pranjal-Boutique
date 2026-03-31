# Pranjal-Boutique

Full-stack boutique platform for Pranjal's Designer and Boutique.

## Stack

- Frontend: React + Vite + Tailwind + Framer Motion + Axios + i18next
- Backend: Spring Boot + Spring Security + JWT + OAuth2 (Google) + MongoDB

## Project Structure

- `frontend/`: React application (port 3000)
- `backend/`: Spring Boot API (port 8080)

## Backend Features

- JWT authentication with Spring Security
- Google OAuth2 login with frontend callback redirect
- Role-based access control:
	- `ROLE_USER`
	- `ROLE_ADMIN`
- Public APIs:
	- `GET /api/services`
	- `GET /api/services/{id}`
	- `POST /api/services/inquiries`
	- `GET /api/services/reviews`
	- `POST /api/services/reviews`
	- `GET /api/services/reviews/analytics`
- Protected Admin APIs (`ROLE_ADMIN`):
	- `POST /api/admin/services`
	- `PUT /api/admin/services/{id}`
	- `DELETE /api/admin/services/{id}`
	- `GET /api/admin/inquiries`
	- `PUT /api/admin/inquiries/{id}/status`
- CORS enabled for `http://localhost:3000`

### Environment (Backend)

Set these as environment variables if needed:

- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

The backend auto-creates an admin user from the admin environment values on startup.

## Frontend Features

- Animated hero with floating profile image
- Sticky top navigation (Home, Gallery, Classes, Contact)
- Route transitions using Framer Motion
- Theme toggle:
	- Royal Maroon/Gold
	- Soft Blossom
- Language toggle:
	- English
	- Marathi
- Gallery data fetched from backend API
- Admin dashboard for:
	- Uploading new gallery work (URL-based)
	- Deleting work
	- Reviewing and updating inquiry status
- Axios interceptor attaches JWT token automatically
- WhatsApp quick-chat button on each gallery card

## Run Locally

### 1. Start backend

```bash
cd backend
mvn spring-boot:run
```

### 2. Start frontend

```bash
cd frontend
npm install
npm run dev
```

## Deploy With Docker

### 1. Prepare environment file

```bash
cp .env.example.backend .env
```

Update `.env` with your production values for:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

### 2. Build and run

```bash
docker-compose up -d --build
```

### 3. Access

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

### 4. Useful commands

```bash
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose down
```

## Notes

- API base URL defaults to `/api` in production-style setups and is proxied in local Vite dev mode.
- Current image flow stores image URLs. For production, integrate Cloudinary or S3 upload endpoints in backend and call them from admin UI.