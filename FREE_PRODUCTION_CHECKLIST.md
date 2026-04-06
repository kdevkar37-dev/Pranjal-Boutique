# Free Production Readiness Checklist

This checklist keeps deployment free-cost and production-safe for Pranjal-Boutique.

## 1. Hosting Plan (Free)

- Frontend: Cloudflare Pages (free) or Vercel (free)
- Backend: Render free web service
- Database: MongoDB Atlas M0
- Keep all platforms on free plans and disable auto-upgrade/billing where possible

## 2. Required Production Environment Variables

Set these on your backend host:

- `MONGODB_URI` = your MongoDB Atlas URI
- `JWT_SECRET` = strong 32+ byte random secret
- `CORS_ALLOWED_ORIGINS` = exact frontend URL, for example `https://your-site.pages.dev`
- `OAUTH2_REDIRECT_URL` = frontend oauth callback URL, for example `https://your-site.pages.dev/oauth2/success`
- `ADMIN_EMAIL` = your private admin email
- `ADMIN_PASSWORD` = strong password
- `ADMIN_NAME` = admin display name
- `GOOGLE_CLIENT_ID` = optional if OAuth is enabled
- `GOOGLE_CLIENT_SECRET` = optional if OAuth is enabled
- `REFRESH_COOKIE_SECURE` = `true`
- `REQUIRE_HTTPS` = `true`
- `FILE_UPLOAD_ENABLED` = `true`
- `UPLOAD_PROVIDER` = `cloudinary`
- `CLOUDINARY_CLOUD_NAME` = your free Cloudinary cloud name
- `CLOUDINARY_API_KEY` = your Cloudinary API key
- `CLOUDINARY_API_SECRET` = your Cloudinary API secret
- `CLOUDINARY_FOLDER` = `boutique-services` (or your preferred folder)
- `ALERTS_ENABLED` = `true` (recommended)
- `ALERTS_WEBHOOK_URL` = your free alert webhook (Discord/Slack/Telegram)
- `ALERTS_WEBHOOK_TOKEN` = optional shared token for webhook auth

## 3. Image Strategy (Free-Safe)

Free backends usually have ephemeral disk, so avoid storing uploads on local disk in production.

Recommended mode:

- Keep `FILE_UPLOAD_ENABLED=true`
- Use `UPLOAD_PROVIDER=cloudinary` so images are stored on Cloudinary free tier
- Keep upload max size at 5MB per image (`UPLOAD_MAX_SIZE=5242880`)
- Use compressed formats (WebP/JPEG) to reduce bandwidth and improve load times
- Admin can upload many images; Cloudinary handles storage/delivery and CDN caching

## 4. Production Profile

Run backend with production profile:

- `SPRING_PROFILES_ACTIVE=prod`

## 5. Security Verification

- Login with admin credentials works
- `/api/auth/refresh` rotates token and keeps session alive
- Logout invalidates access token
- Admin endpoints reject non-admin users
- CORS allows only your frontend domain

## 6. Functional Verification

- Public pages load from frontend host
- Backend APIs reachable from frontend
- Service create/update with file upload works
- Uploaded images return `https://res.cloudinary.com/...` URLs
- Inquiry + review flows work

## 7. Known Free-Tier Limits

- Backend cold starts
- Request/sleep limits on free backend hosts
- Cloudinary free-tier quotas apply (storage/bandwidth/transformations)
- If free quota is exceeded, uploads may fail until monthly reset

If limits become a problem later, upgrade only the backend host first.
