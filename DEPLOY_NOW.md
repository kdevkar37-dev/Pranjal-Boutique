# Deploy Now - End-to-End Steps

This project is prepped for a free-tier go-live flow:

- Frontend: Vercel
- Backend: Render
- DB: MongoDB Atlas M0
- Images: Cloudinary free tier

## 1) Prepare accounts

- Vercel account
- Render account
- MongoDB Atlas account
- Cloudinary account

## 2) Backend deploy

1. Create a new Render Web Service from `backend`.
2. Build command: `mvn -DskipTests clean package`
3. Start command: `java -jar target/boutique-backend-0.0.1-SNAPSHOT.jar`
4. Add all variables from `backend/.env.production.example`.
5. Deploy and copy backend URL.

## 3) Frontend deploy

1. Create a new Vercel project from `frontend`.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-url>/api`
6. Deploy.

## 4) Post-deploy checks

- Open frontend home page.
- Login as admin.
- Create service with uploaded image.
- Verify generated image URL uses Cloudinary domain.
- Update inquiry status.
- Delete inquiry.
- Logout and confirm protected pages redirect to login.

## 5) Security checks

- Confirm CORS includes only your Vercel domain.
- Confirm `REQUIRE_HTTPS=true`.
- Confirm Cloudinary secrets are set only on backend host.
- Confirm alert webhook receives a message if upload is intentionally blocked by size/type.

## 6) Zero-surprise cost guardrails

- Keep provider accounts on free plans.
- Disable auto-upgrade/billing where supported.
- Configure usage alerts in Cloudinary/Render/Vercel dashboards.
